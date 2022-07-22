const express = require("express");
const apiRouter = express.Router();

const usersRouter = require("./users");
const postsRouter = require("./posts");
const tagsRouter = require("./tags");
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");


apiRouter.use(async (req, res, next) => {
  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }
});

apiRouter.use((req, res, next) => {
    if (req.user) {
      console.log("User is set:", req.user);
    }
  
    next();
  });
    

apiRouter.use("/users", usersRouter);
apiRouter.use("/posts", postsRouter);
apiRouter.use("/tags", tagsRouter);


apiRouter.get("/", (req, res) => {
  res.send(`
    <h1>Check out this data!</h1>
    <a href='/api/users'>Users</a>
    <a href='/api/posts'>Posts</a>
    <a href='/api/tags'>Tags</a>

    
    `);
});


apiRouter.use((error, req, res, next) => {
    res.send({
      name: error.name,
      message: error.message
    });
  });

module.exports = apiRouter
