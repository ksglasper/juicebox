const { client, getAllUsers, createUser, updateUser } = require("./index");

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
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
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
      name: "Al Bert III",
      location: 'River North',
      active: true
    });
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Wanda",
      location: 'Brighton Park',
      active: true
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Beatrice",
      location: 'Bridgeport',
      active: true
    });

    // console.log(albert, 'the first of many!')

    console.log("Finished making user!");
  } catch (error) {
    throw error;
  }
};

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUser();
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {

    console.log("Starting to test database...");
    console.log('Getting all Users')
    const users = await getAllUsers();
    console.log(users, "these are the users from the function getAllUsers");

    console.log('Calling updateUser on users[0]')
    const updateUserResult = await updateUser(users[0].id, {
        name: "Newname Sogood",
        location: "Lesterville, KY"
      });
      console.log("Result:", updateUserResult)

    console.log("finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

const runDB = async () => {
  try {
    await rebuildDB().then(testDB);
  } catch (error) {
    console.error;
  } finally {
    client.end();
  }
};

runDB();
