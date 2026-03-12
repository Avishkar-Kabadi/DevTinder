const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true, // For scalable lookups per user
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: ['request_received', 'request_accepted', 'like', 'comment'],
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            // Nullable because connection requests don't have posts
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true, // Speeds up unread counts queries
        },
        content: {
            type: String, // Useful for comment text snippet
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
