const express = require('express');
const { registerUser, loginUser, logoutUser, updateProfile, getUserProfile } = require('../controllers/authController');
const isLoggedIn = require('../middlewares/isLoggedIn');
const upload = require('../middlewares/multer');


const route = express.Router();


route.post('/login', loginUser);

route.post('/register', registerUser);

route.post('/logout', isLoggedIn, logoutUser);

route.put('/update-profile', isLoggedIn, upload.single("image"), updateProfile);

route.get('/user-profile', isLoggedIn, getUserProfile);




module.exports = route;