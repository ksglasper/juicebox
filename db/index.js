const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

const createUser = async ({ username, password, name, location }) => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
    INSERT INTO users(username, password, name, location)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (username) DO NOTHING
    RETURNING *;
    `,
      [username, password, name, location]
    );
    // console.log(user, 'made a new user')
    return user;
  } catch (error) {
    throw error;
  }
};

const updateUser = async (id, fields = {}) => {
  const setString = Object.keys(fields)
    .map((key, idx) => `"${key}" =$${idx + 1}`)
    .join(",");

  if (setString.length === 0) {
    return;
  }
  try {
    // console.log(setString, 'current string')
    // console.log(Object.values(fields), 'field value')

    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
`,
      Object.values(fields)
    );
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active 
      FROM users;
    `
  );

  return rows;
}

const createPost = async ({ authorId, title, content }) => {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
    INSERT INTO posts("authorId", title, content)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,
      [authorId, title, content]
    );
    // console.log(post, 'made a new post')
    return post;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updatePost = async (id, { title, content, active }) => {
  const setString = '"title" =$1,"content" =$2, "active" =$3';

  if (setString.length === 0) {
    return;
  }
  if(title || content){
    active = true
  }
  try {
    const {
      rows: [post],
    } = await client.query(
      `
    UPDATE posts
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
`,
      [title, content, active]
    );
    return post;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getAllPosts() {
  const { rows } = await client.query(
    `SELECT id, "authorId", title, content, active 
      FROM posts;
    `
  );

  return rows;
}

async function getPostsByUser(userId) {

    try {
        const { rows } = await client.query(
            `SELECT * FROM posts 
            WHERE "authorId"='${userId}';
            `);
        // console.log(rows, 'these are posts')
          return rows;
    } catch (error) {
        throw error
    }
  
}


const getUserById = async (userId) =>{
    try {
        console.log(`${userId}`)
        const {rows:[userObj]} = await client.query(
            `SELECT * FROM users
            WHERE id=${userId};`);

            if(!userObj){
                return null
            }else{

                delete userObj['password']
                const userPosts = await getPostsByUser(userId)
                userObj.posts = userPosts
                // console.log(userObj, 'this is what was created')
            }
            
            return userObj

        
    } catch (error) {
        throw error
    }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById
};
