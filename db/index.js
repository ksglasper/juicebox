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

const createPost = async ({ authorId, title, content, tags = [] }) => {
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
    const tagList = await createTags(tags);

    return await addTagsToPost(post.id, tagList);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createTags = async (taglist) => {
  if (taglist.length === 0) {
    return;
  }

  // console.log(taglist, 'this is the taglist')
  const insertValues = taglist.map((_, idx) => `$${idx + 1}`).join("), (");

  const selectValues = taglist.map((_, idx) => `$${idx + 1}`).join(", ");
  try {
    await client.query(
      `
    INSERT INTO tags(name)
    VALUES (${insertValues})
    ON CONFLICT (name) DO NOTHING;
    `,
      taglist
    );
    // console.log(insertValues, 'made it here')
    const { rows } = await client.query(
      `
    SELECT * FROM tags
    WHERE name
    IN (${selectValues});
    `,
      taglist
    );
    // console.log(selectValues, 'made it here too!')

    return rows;
  } catch (error) {
    throw error;
  }
};

async function createPostTag(postId, tagId) {
  try {
    await client.query(
      `
        INSERT INTO post_tags("postId", "tagId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "tagId") DO NOTHING;
    ;
      `,
      [postId, tagId]
    );
  } catch (error) {
    throw error;
  }
}

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

const updatePost = async (postId, fields = {}) => {
  const { tags } = fields;
  delete fields.tags;

  const setString = Object.keys(fields)
    .map((key, idx) => `"${key}" =$${idx + 1}`)
    .join(",");

  // console.log(setString, 'this is the setstring')
  // console.log('"title" =$1,"content" =$2, "active" =$3', 'this should be a copy')

  //   const setString = '"title" =$1,"content" =$2, "active" =$3';
  // console.log(tags, 'current tags')

  try {
    if (setString.length > 0) {
      await client.query(
        `
          UPDATE posts
          SET ${setString}
          WHERE id=${postId}
          RETURNING *;
      `,
        Object.values(fields)
      );
    }

    if (tags === undefined) {
      return await getPostById(postId);
    }

    const tagList = await createTags(tags);
    const tagListIdString = tagList.map((tag) => `${tag.id}`).join(", ");

    await client.query(
      `
      DELETE FROM post_tags
      WHERE "tagId"
      NOT IN (${tagListIdString})
      AND "postId"=$1;
    `,
      [postId]
    );

    await addTagsToPost(postId, tagList);

    return await getPostById(postId);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

async function getAllPosts() {
  const { rows: postIds } = await client.query(
    `SELECT id
      FROM posts;
    `
  );
  const posts = await Promise.all(postIds.map((post) => getPostById(post.id)));
  //   console.log(posts, 'this is the newest post addition')
  // console.log(await getPostById(3), 'this is the postIds')
  return posts;
}

async function getPostsByUser(userId) {
  try {
    const { rows: postIds } = await client.query(
      `SELECT id
       FROM posts 
       WHERE "authorId"='${userId}';
       `
    );
    // console.log(pos, 'these are posts')
    const posts = await Promise.all(
      postIds.map((post) => getPostById(post.id))
    );
    return posts;
  } catch (error) {
    throw error;
  }
}

const getUserById = async (userId) => {
  try {
    // console.log(`${userId}`);
    const {
      rows: [userObj],
    } = await client.query(
      `SELECT * FROM users
            WHERE id=${userId};`
    );

    if (!userObj) {
      return null;
    } else {
      delete userObj["password"];
      const userPosts = await getPostsByUser(userId);
      userObj.posts = userPosts;
      //   console.log(userObj.posts[0].title, 'this is what was created')

      //   console.log(userObj.posts[0].tags, 'this is what was created')
    }

    return userObj;
  } catch (error) {
    throw error;
  }
};

async function addTagsToPost(postId, tagList) {
  try {
    // console.log( tagList, 'taglist-last thing before I break')
    // console.log( postId, 'postId-last thing before I break')

    const createPostTagPromises = tagList.map((tag) =>
      createPostTag(postId, tag.id)
    );

    await Promise.all(createPostTagPromises);

    return await getPostById(postId);
  } catch (error) {
    throw error;
  }
}

async function getPostById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
        SELECT *
        FROM posts
        WHERE id=$1;
      `,
      [postId]
    );

    const { rows: tags } = await client.query(
      `
        SELECT tags.*
        FROM tags
        JOIN post_tags ON tags.id=post_tags."tagId"
        WHERE post_tags."postId"=$1;
      `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
        SELECT id, username, name, location
        FROM users
        WHERE id=$1;
      `,
      [post.authorId]
    );
    // console.log(tags, 'the generated tags')
    post.tags = tags;
    post.author = author;
    // console.log(post, 'this is the post after adding tags and author')
    delete post.authorId;
    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByTagName(tagName) {
    try {
      const { rows: postIds } = await client.query(`
        SELECT posts.id
        FROM posts
        JOIN post_tags ON posts.id=post_tags."postId"
        JOIN tags ON tags.id=post_tags."tagId"
        WHERE tags.name=$1;
      `, [tagName]);
  
      return await Promise.all(postIds.map(
        post => getPostById(post.id)
      ));
    } catch (error) {
      throw error;
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
  getUserById,
  createTags,
  addTagsToPost,
  getPostsByTagName
};
