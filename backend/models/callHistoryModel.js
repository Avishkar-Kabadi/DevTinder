const mongoose = require("mongoose");

const callHistorySchema = new mongoose.Schema(
    {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["audio", "video"],
            required: true,
        },
        status: {
            type: String,
            enum: ["completed", "missed", "rejected"],
            default: "completed",
        },
        duration: {
            type: Number, // in seconds
            default: 0,
        },
        startedAt: {
            type: Date,
        },
        endedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("CallHistory", callHistorySchema);
