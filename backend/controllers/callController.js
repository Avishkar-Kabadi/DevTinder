const CallHistory = require("../models/callHistoryModel");

// POST /api/calls — Save a call record
const saveCallHistory = async (req, res) => {
    try {
        const { receiverId, type, duration, startedAt, endedAt, status } = req.body;

        if (!receiverId || !type) {
            return res.status(400).json({ message: "receiverId and type are required." });
        }

        const call = await CallHistory.create({
            caller: req.user._id,
            receiver: receiverId,
            type,
            duration: duration || 0,
            startedAt: startedAt ? new Date(startedAt) : new Date(),
            endedAt: endedAt ? new Date(endedAt) : new Date(),
            status: status || "completed",
        });

        res.status(201).json({ success: true, data: call });
    } catch (err) {
        console.error("saveCallHistory error:", err);
        res.status(500).json({ message: "Failed to save call history." });
    }
};

// GET /api/calls — Fetch current user's call history
const getCallHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const calls = await CallHistory.find({
            $or: [{ caller: userId }, { receiver: userId }],
        })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("caller", "firstName lastName photoUrl")
            .populate("receiver", "firstName lastName photoUrl");

        res.json({ success: true, data: calls });
    } catch (err) {
        console.error("getCallHistory error:", err);
        res.status(500).json({ message: "Failed to fetch call history." });
    }
};

module.exports = { saveCallHistory, getCallHistory };
