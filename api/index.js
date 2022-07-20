const express = require('express');
const apiRouter = express.Router();

const usersRouter = require('./users');
const postsRouter = require('./posts')
const tagsRouter = require('./tags')




apiRouter.use('/users', usersRouter);
apiRouter.use('/posts', postsRouter)
apiRouter.use('/tags', tagsRouter)


apiRouter.get('/', (req, res) =>{
    res.send(`
    <h1>Check out this data!</h1>
    <a href='/api/users'>Users</a>
    <a href='/api/posts'>Posts</a>
    <a href='/api/tags'>Tags</a>

    
    `)
    })



module.exports = 
    apiRouter, postsRouter, tagsRouter