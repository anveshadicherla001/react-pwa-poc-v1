export async function getAllUsers() {

    try{
        const response = await fetch('https://reqres.in/api/users?page=1');
        return await response.json();
    }catch(error) {
        return [];
    }
    
}

export async function createUser(data) {
    const response = await fetch(`https://reqres.in/api/users`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user: data})
      })
    return await response.json();
}