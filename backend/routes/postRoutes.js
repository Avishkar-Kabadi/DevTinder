const express = require('express');
const isLoggedIn = require('../middlewares/isLoggedIn');
const { createPost, editPost, deletePost, fetchPosts, like_Dislike_Post, getPosts, getUserPosts } = require('../controllers/postController');
const upload = require('../middlewares/multer');

const router = express.Router();


router.post('/post', isLoggedIn, upload.single("image"), createPost);

router.put('/post/:id', isLoggedIn, editPost);

router.delete('/post/:id', isLoggedIn, deletePost);

router.put('/like-dislike/:id', isLoggedIn, like_Dislike_Post);

router.get('/', isLoggedIn, getPosts);         // All posts (for feed)

router.get('/my-posts', isLoggedIn, fetchPosts); // Current user's own posts

router.get('/user/:userId', isLoggedIn, getUserPosts);

module.exports = router;