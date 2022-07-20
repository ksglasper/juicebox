const express = require('express')
const tagsRouter = express.Router()
const {getAllTags, getPostsByTagName} = require('../db')


tagsRouter.use((req,res,next) =>{
    console.log('A request is being made to /tags')
    next()

})

tagsRouter.get('/:tagName/posts', async (req, res, next) => {
    const {tagName} = req.params
    // read the tagname from the params
    console.log(tagName, 'this is the tags we are sending')
    try {
        const allPosts = await getPostsByTagName(tagName)
      // use our method to get posts by tag name from the db
      // send out an object to the client { posts: // the posts }

      const activePosts = allPosts.filter((post) => {
        return post.active || (req.user && post.author.id === req.user.id)
    
    });

    res.send(activePosts);

    } catch ({ name, message }) {
      // forward the name and message to the error handler
      next({name, message})
    }
  });



tagsRouter.get('/', async (req, res) =>{
    const tags = await getAllTags()
    res.send(tags)
})




module.exports = tagsRouter