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

        skills: [String],

        requests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],

        connections: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],

        notInterested: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],

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
