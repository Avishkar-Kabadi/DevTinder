const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: String,
    photoUrl: String,
    isDeleted: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
