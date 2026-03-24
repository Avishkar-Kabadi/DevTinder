const express = require('express');
const { fetchNotifications, markAsRead } = require('../controllers/notificationController');
const isLoggedIn = require('../middlewares/isLoggedIn');

const route = express.Router();

route.get('/', isLoggedIn, fetchNotifications);
route.get('/my-notifications', isLoggedIn, fetchNotifications);
route.post('/mark-read', isLoggedIn, markAsRead);

module.exports = route;
