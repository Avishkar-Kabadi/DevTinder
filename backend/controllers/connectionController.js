const dbgr = require("debug")("development:Connection");
const Notification = require('../models/notificationModel');
const ConnectionRequest = require('../models/connectionRequestModel');

module.exports.sendRequest = async (req, res) => {
    const { _id, firstName, lastName, photoUrl } = req.user;
    const userId = req.params.id;

    try {
        if (_id.toString() === userId) {
            return res.status(400).json({ message: "Cannot send request to yourself" });
        }

        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { senderId: _id, receiverId: userId },
                { senderId: userId, receiverId: _id }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Connection already exists or is pending/ignored" });
        }

        const newRequest = await ConnectionRequest.create({
            senderId: _id,
            receiverId: userId,
            status: "interested"
        });

        const notification = await Notification.create({
            recipient: userId,
            sender: _id,
            type: 'request_received'
        });

        if (req.io) {
            req.io.to(userId).emit("newNotification", {
                _id: notification._id,
                type: 'request_received',
                sender: { _id, firstName, lastName, photoUrl },
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        return res.json({ message: "Request sent successfully" });

    } catch (error) {
        dbgr("Send Request:", error.message);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.markNotInterested = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { senderId: _id, receiverId: userId },
                { senderId: userId, receiverId: _id }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Connection relation already exists" });
        }

        await ConnectionRequest.create({
            senderId: _id,
            receiverId: userId,
            status: "ignored"
        });

        return res.json({ message: "Profile ignored!" });

    } catch (error) {
        dbgr("Marked as not Interested:", error.message);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.fetchAllRequest = async (req, res) => {
    const { _id } = req.user;

    try {
        const requests = await ConnectionRequest.find({
            receiverId: _id,
            status: "interested"
        }).populate("senderId", "firstName lastName photoUrl about username");

        const requestData = requests.map(req => req.senderId);

        return res.json({
            message: "Requests fetched successfully",
            requests: requestData
        });

    } catch (error) {
        dbgr("Fetch Requests:", error.message);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.acceptRequest = async (req, res) => {
    const { _id, firstName, lastName, photoUrl } = req.user;
    const userId = req.params.id;

    try {
        const connectionRequest = await ConnectionRequest.findOne({
            senderId: userId,
            receiverId: _id,
            status: "interested"
        });

        if (!connectionRequest) {
            return res.status(404).json({ message: "Pending request not found" });
        }

        connectionRequest.status = "accepted";
        await connectionRequest.save();

        const notification = await Notification.create({
            recipient: userId,
            sender: _id,
            type: 'request_accepted'
        });

        if (req.io) {
            req.io.to(userId).emit("newNotification", {
                _id: notification._id,
                type: 'request_accepted',
                sender: { _id, firstName, lastName, photoUrl },
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        return res.status(200).json({ message: "Request accepted successfully" });

    } catch (error) {
        dbgr("Accept Request:", error.message);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.declineRequest = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        const connectionRequest = await ConnectionRequest.findOne({
            senderId: userId,
            receiverId: _id,
            status: "interested"
        });

        if (!connectionRequest) {
            return res.status(404).json({ message: "Pending request not found" });
        }

        connectionRequest.status = "rejected";
        await connectionRequest.save();

        return res.status(200).json({ message: "Request declined successfully" });

    } catch (error) {
        dbgr("Decline request:", error.message);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.removeConnection = async (req, res) => {
    const { _id } = req.user;
    const userId = req.params.id;

    try {
        await ConnectionRequest.findOneAndDelete({
            $or: [
                { senderId: _id, receiverId: userId },
                { senderId: userId, receiverId: _id }
            ],
            status: "accepted"
        });

        return res.status(200).json({ message: "Connection Removed" });

    } catch (error) {
        dbgr("Remove Connection:", error.message);
        return res.status(500).json({ message: "Internal server error", error });
    }
};

module.exports.fetchAllConnections = async (req, res) => {
    const { _id } = req.user;
    try {
        const connections = await ConnectionRequest.find({
            $or: [{ senderId: _id }, { receiverId: _id }],
            status: "accepted"
        })
        .populate("senderId", "firstName lastName photoUrl about username")
        .populate("receiverId", "firstName lastName photoUrl about username");

        const connectionData = connections
            .filter(conn => conn.senderId && conn.receiverId)
            .map(conn => {
                const isSender = conn.senderId._id.toString() === _id.toString();
                return isSender ? conn.receiverId : conn.senderId;
            });

        return res.json({
            message: "Connections fetched successfully",
            connections: connectionData
        });
    } catch (error) {
        dbgr("Fetch Connections Error:", error.message);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
