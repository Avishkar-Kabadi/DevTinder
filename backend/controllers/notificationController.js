const Notification = require('../models/notificationModel');
const dbgr = require('debug')('development:Notification');

module.exports.fetchNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("sender", "firstName lastName photoUrl");

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications
        });
    } catch (error) {
        dbgr("Fetch Notifications :", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({
            message: "Notifications marked as read"
        });
    } catch (error) {
        dbgr("Mark As Read :", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
