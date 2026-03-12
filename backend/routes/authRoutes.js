const express = require('express');
const { registerUser, loginUser, logoutUser, updateProfile, searchUser, getUserProfile, verifyOTP, resendOTP, getUserById } = require('../controllers/authController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require('../middlewares/multer');


const route = express.Router();


route.post('/login', loginUser);

route.post('/register', registerUser);

route.post('/verify-otp', verifyOTP);

route.post('/logout', isLoggedIn, logoutUser);

route.put('/update-profile', isLoggedIn, upload.single("image"), updateProfile);

route.get('/user-profile', isLoggedIn, getUserProfile);

route.get('/search', isLoggedIn, searchUser);


route.post('/resend-otp', resendOTP);
route.get('/user/:id', isLoggedIn, getUserById);

module.exports = route;