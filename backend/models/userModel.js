const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },

        lastName: {
            type: String,
            trim: true,
        },
        
        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },

        otp: String,

        isVerified: {
            type: Boolean,
            default: false,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        gender: String,

        photoUrl: String,

        age: Number,

        about: {
            type: String,
            trim: true,
        },

        isProfileCompleted: {
            type: Boolean,
            default: false,
        }
    },
    
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);
