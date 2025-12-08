const mongoose = require('mongoose');

const userSchema = mongoose.Schema({

    email: {
        type: String,
        required: true,
        minLength: 5,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },


})


const userModel = mongoose.model('user', userSchema)



module.exports = userModel;