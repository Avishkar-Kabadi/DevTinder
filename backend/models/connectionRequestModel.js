const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: {
                values: ["interested", "ignored", "accepted", "rejected"],
                message: "{VALUE} is incorrect status type",
            },
        },
    },
    { timestamps: true }
);

// Compound index to optimize queries fetching requests between two users
connectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

// Index for efficiently fetching an individual user's active connections/requests
connectionRequestSchema.index({ receiverId: 1, status: 1 });
connectionRequestSchema.index({ senderId: 1, status: 1 });

const ConnectionRequest = mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = ConnectionRequest;
