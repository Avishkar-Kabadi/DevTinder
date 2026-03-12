const express = require('express');
const { fetchFeed } = require('../controllers/feedController');
const isLoggedIn = require('../middlewares/isLoggedIn');

const router = express.Router();

// GET /api/feed — posts from accepted connections only
router.get('/feed', isLoggedIn, fetchFeed);

module.exports = router;