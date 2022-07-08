import React, { useEffect, useRef, useState } from 'react';
//import logo from './logo.svg';
import './App.css';
import { getAllUsers, createUser } from '././services/userService';

function App() {

  const [users, setUsers] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);
  const [offlineUsersData, setOfflineUsersData] = useState(null);
  let myFormRef = useRef(null);
  useEffect(() => {
    getAllUsersInfo();
    window.addEventListener('online', () => { 
      syncItems();
      console.log(`Online Network Status Change Detected`, navigator.onLine);
      setOnlineStatus(navigator.onLine); 
    });
    window.addEventListener('offline', () => {
      console.log(`Online Network Status Change Detected`, navigator.onLine);
      setOnlineStatus(navigator.onLine);
    });
    console.log(onlineStatus);
    setOfflineUsersData(retriveItems('local', 'users'));
  }, []);

  const getAllUsersInfo = async () => {
      const response = await getAllUsers();
      setUsers(response);
  };
  
  const syncItems = async () => {
    let processedItems = [];
    let allNonSyncedItems = retriveItems('local', 'users');
    console.log(allNonSyncedItems);
    if (allNonSyncedItems && allNonSyncedItems.length) {
      for (const element of allNonSyncedItems) {
        console.log('record submitting', element);
        const response = await createUser(element);
        console.log('record subitted',response);
        processedItems.push({ response });
      }
      if (processedItems && allNonSyncedItems && processedItems.length === allNonSyncedItems.length) {
        console.log(`REMOVING ITEMS`);
        removeItem('local', 'users');
      }
    }
  }

  const retriveItems = (storageType, keyName) => {
    if (storageType === 'session') {
      return JSON.parse(window.sessionStorage.getItem(keyName));
    } else {
      return JSON.parse(window.localStorage.getItem(keyName));
    }
  };
  
  const storeItems = (storageType, keyName, value) =>{
    const valueData = JSON.stringify(value);
    if (storageType === 'session') {
      window.sessionStorage.setItem(keyName, valueData);
    } else {
      window.localStorage.setItem(keyName, valueData);
    }
  };

  const removeItem = (storageType, keyName) => {
    if (storageType === 'session') {
      window.sessionStorage.removeItem(keyName);
    } else {
      window.localStorage.removeItem(keyName);
    }
  }

  const submitForm = async (e) => {
    console.log('submitting form')
    e.preventDefault();
    const { fname, designation } = e.target.elements;
    let bodyObj = [{
      name: fname.value,
      job: designation.value
    }];
    if (navigator.onLine) {
      const response = await createUser(bodyObj);
      console.log(response, 'API RESPONSE');
    }
    else {
      let allNonSyncedItems = retriveItems('local', 'users');
      console.log(allNonSyncedItems);
      if (allNonSyncedItems && allNonSyncedItems.length) {
        bodyObj = [...bodyObj, ...allNonSyncedItems];
      }
      storeItems('local', 'users', bodyObj);
      setOfflineUsersData(bodyObj);
    }
    myFormRef.reset();
  }


  return (
    <div className="App">
      {!onlineStatus && <h4 className='text-center'>OFFLINE NON_SYNCED ITEMS</h4>}
      {!onlineStatus && offlineUsersData?.length > 0 && <table id="customers">
        <tr>
          <th>Full Name</th>
          <th>Designation</th>
        </tr>
        {offlineUsersData && offlineUsersData.length > 0 && offlineUsersData.map(function(object, i){
              return <tr key={i}>
              <td>{object.name}</td>
              <td>{object.job}</td>
            </tr>
        })}
      </table>}
      <form ref={(el) => myFormRef = el} onSubmit={submitForm}>
        <div className='form'>

            <label for="fname">Full Name</label>
            <input type="text" id="fname" name="fullname" placeholder="Your Full Name.." />

            <label for="designation">Designation</label>
            <select id="designation" name="designations">
              <option value="">Select Option</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="QA">QA</option>
              <option value="Devops">Devops</option>
              <option value="Business Analyst">Business Analyst</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Vice President">Vice President</option>
              <option value="President">President</option>
            </select>

            <button type='submit' className='btn'>SUBMIT</button>
            
        </div>
      </form>
      <div className='adjust-center grid-container'>
        {users && users.data && users.data.map(function(object, i){
            return <div className='grid-item' key={i}>
              <img alt={object.first_name} src={object.avatar}></img>
              <p>{object.first_name}</p>
            </div>
        })}
      </div>

    </div>
  );
}

export default App;
