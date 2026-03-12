const express = require('express');
const { createComment, getComments, deleteComment } = require('../controllers/commentController');
const isLoggedIn = require('../middlewares/isLoggedIn');

const router = express.Router();


router.post('/comment', isLoggedIn, createComment)

router.get('/:id', isLoggedIn, getComments)

router.delete('/comment/:id', isLoggedIn, deleteComment)



module.exports = router;

