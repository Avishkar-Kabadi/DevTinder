const express = require('express');
const {
    sendRequest,
    markNotInterested,
    fetchAllRequest,
    acceptRequest,
    declineRequest,
    removeConnection,
    fetchAllConnections
} = require('../controllers/connectionController');
const isLoggedIn = require('../middlewares/isLoggedIn');

const router = express.Router();

router.post('/send-request/:id', isLoggedIn, sendRequest);
router.post('/mark-not-interested/:id', isLoggedIn, markNotInterested);
router.post('/accept-request/:id', isLoggedIn, acceptRequest);
router.post('/decline-request/:id', isLoggedIn, declineRequest);
router.get('/requests', isLoggedIn, fetchAllRequest);
router.get('/connections', isLoggedIn, fetchAllConnections);
router.post('/remove-connection/:id', isLoggedIn, removeConnection);

module.exports = router;
