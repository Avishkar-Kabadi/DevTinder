

const express = require('express');
const { fetchFeed, sendRequest, fetchAllRequest, fetchAllConnections, declineRequest, acceptRequest, removeConnection, markNotInterested } = require('../controllers/feedController');
const isLoggedIn = require('../middlewares/isLoggedIn');

const route = express.Router();


route.get('/feed', isLoggedIn, fetchFeed);

route.post('/send-request/:id', isLoggedIn, sendRequest);

route.post('/mark-not-interested/:id', isLoggedIn, markNotInterested);

route.post('/accept-request/:id', isLoggedIn, acceptRequest);

route.post('/decline-request/:id', isLoggedIn, declineRequest);

route.get('/requests', isLoggedIn, fetchAllRequest);

route.get('/connections', isLoggedIn, fetchAllConnections);

route.post('/remove-connection/:id', isLoggedIn, removeConnection);

module.exports = route;