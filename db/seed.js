const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getUserById,
  createTags,
  addTagsToPost
} = require("./index");

async function dropTables() {
  try {
    console.log("Starting to drop tables...");
    await client.query(`
    DROP TABLE IF EXISTS post_tags;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS tags;

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
    
    CREATE TABLE posts(
        id SERIAL PRIMARY KEY,
        "authorId" INTEGER REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
    );

    CREATE TABLE tags(
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
        );
    
    CREATE TABLE post_tags(
        "postId" INTEGER REFERENCES posts(id) ,
        "tagId" INTEGER REFERENCES tags(id) 
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
      location: "River North",
      active: true,
    });
    const sandra = await createUser({
      username: "sandra",
      password: "2sandy4me",
      name: "Wanda",
      location: "Brighton Park",
      active: true,
    });
    const glamgal = await createUser({
      username: "glamgal",
      password: "soglam",
      name: "Beatrice",
      location: "Bridgeport",
      active: true,
    });

    // console.log(albert, 'the first of many!')

    console.log("Finished making user!");
  } catch (error) {
    throw error;
  }
};

const createInitialPosts = async () => {
  try {
    console.log("Starting to create user posts...");

    const [albert, sandra, glamgal] = await getAllUsers();

    await createPost({
      authorId: albert.id,
      title: "First Post",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them.",
    });

    await createPost({
      authorId: sandra.id,
      title: "Sandra Here!",
      content:
        "This is my first post. I hope I love writing blogs as much as I love writing them. This is Sandra BTW.",
    });

    await createPost({
      authorId: glamgal.id,
      title: "First Post, jk tenth post",
      content:
        "This is my 80th post. I hope I love writing blogs as much as I love writing them.",
    });
    console.log("Finished creating user posts...");
  } catch (error) {
    throw error;
  }
};

async function createInitialTags() {
    try {
      console.log("Starting to create tags...");
  
      const [happy, sad, inspo, catman] = await createTags([
        '#happy', 
        '#worst-day-ever', 
        '#youcandoanything',
        '#catmandoeverything'
      ]);
      const [postOne, postTwo, postThree] = await getAllPosts();
      
      await addTagsToPost(postOne.id, [happy, inspo]);
      console.log('and here!')
      await addTagsToPost(postTwo.id, [sad, inspo]);
      await addTagsToPost(postThree.id, [happy, catman, inspo]);
  
      console.log("Finished creating tags!");
    } catch (error) {
      console.log("Error creating tags!");
      throw error;
    }
  }


async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUser();
    await createInitialPosts();
    await createInitialTags();
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    console.log("Calling getAllUsers");
    const users = await getAllUsers();
    console.log("Result:", users);

    console.log("Calling updateUser on users[0]");
    const updateUserResult = await updateUser(users[0].id, {
      name: "Newname Sogood",
      location: "Lesterville, KY",
    });
    console.log("Result:", updateUserResult);

    console.log("Calling getAllPosts");
    const posts = await getAllPosts();
    console.log("Result:", posts);

    console.log("Calling updatePost on posts[0]");
    const updatePostResult = await updatePost(posts[0].id, {
      title: "New Title",
      content: "Updated Content",
    });
    console.log("Result:", updatePostResult);

    console.log("Calling getUserById with 1");
    const albert = await getUserById(1);
    console.log("Result:", albert);

    console.log("Finished database tests!");
  } catch (error) {
    console.log("Error during testDB");
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
