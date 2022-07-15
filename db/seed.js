const { client, getAllUsers, createUser } = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
    DROP TABLE IF EXISTS users
      `);
    console.log("Finished dropping tables!");
  } catch (error) {
    throw error; // we pass the error up to the function that calls dropTables
  }
}

// this function should call a query which creates all tables for our database
async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
    CREATE TABLE users(
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );
      `);
    console.log("Finished building tables!");
  } catch (error) {
    throw error; // we pass the error up to the function that calls createTables
  }
}

const createInitialUser = async () => {
  try {
    console.log("Starting to create user...");
    const albert = await createUser({
      username: "albert",
      password: "bertie99",
    });
    const sandra = await createUser({ username: 'sandra', password: '2sandy4me' });
    const glamgal = await createUser({ username: 'glamgal', password: 'soglam' });

    // console.log(albert, 'the first of many!')

    console.log('Finished making user!')
  } catch (error) {
    throw error
  }
};

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUser()
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");
    // queries are promises, so we can await them
    //   const {rows} = await client.query(`SELECT * FROM users;`);
    const users = await getAllUsers();

    // for now, logging is a fine way to see what's up
    console.log(users, "this is the users from the function getAllUsers");
    console.log("finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
