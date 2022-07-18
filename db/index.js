const {Client} = require('pg')

const client = new Client('postgres://localhost:5432/juicebox-dev')

const createUser = async ({username, password, name, location})=>{
try {
    const result = await client.query(`
    INSERT INTO users(username, password, name, location)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,[username, password, name,location]);
    return result.rows
} catch (error) {
    throw error
}
}

const updateUser = async (id, fields = {}) => {
    const setString = Object.keys(fields).map(
        (key, idx) => `"${key}" =$${idx + 1 }`
).join(',');

if (setString.length === 0) {
    return
}
try {
    const {rows} = await client.query(`
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `, Object.values(fields))
    return rows
} catch (error) {
    console.error(error)
    throw error
}
}



async function getAllUsers() {
    const { rows } = await client.query(
      `SELECT id, username, name, location, active 
      FROM users;
    `);
  
    return rows;
  }


module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser
}