const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    participants: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        validate: {
            validator: v => v.length === 2,
            message: "A conversation must have exactly 2 participants"
        }
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("Conversation", conversationSchema);
