const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");

// ---------------------------------------------
// Safe Socket Emitter for One-to-One Notification
// ---------------------------------------------
const emitSocketEvent = (req, event, data) => {
    try {
        if (req.io && data.receiverId) {
            req.io.to(data.receiverId.toString()).emit(event, data);
        }
    } catch (err) {
        console.log("Socket Emit Error:", err.message);
    }
};

// ---------------------------------------------
// Create or Get Conversation (Strict 1-to-1)
// ---------------------------------------------
module.exports.createOrGetConversation = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.params.id;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID missing" });
        }

        // Find conversation between exactly 2 users
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        // Create if doesn't exist
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        return res.json({
            success: true,
            message: "Conversation ready",
            data: conversation,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ---------------------------------------------
// Send Message (One-to-One Chat Only)
// ---------------------------------------------
module.exports.sendMessage = async (req, res) => {
    try {
        const { text, photoUrl } = req.body;
        const { conversationId } = req.params;
        const senderId = req.user._id;

        if (!text && !photoUrl) {
            return res.status(400).json({ message: "Message content is empty" });
        }

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Create the message
        const message = await Message.create({
            conversationId,
            sender: senderId,
            text: text || "",
            photoUrl: photoUrl || null,
        });

        // Update last message & timestamp
        conversation.lastMessage = message._id;
        await conversation.save();

        // Identify the other user in this one-to-one conversation
        const receiverId = conversation.participants.find(
            (id) => id.toString() !== senderId.toString()
        );

        // Emit message to receiver only
        emitSocketEvent(req, "new_message", {
            message,
            conversationId,
            senderId,
            receiverId,
        });

        return res.json({
            success: true,
            message: "Message sent",
            data: message,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ---------------------------------------------
// Get All Messages of a Conversation
// ---------------------------------------------
module.exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .populate("sender", "firstName lastName photoUrl")
            .sort({ createdAt: 1 });

        return res.json({
            success: true,
            message: "Messages fetched",
            data: messages,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ---------------------------------------------
// Get Conversations List for Logged In User
// ---------------------------------------------
module.exports.getConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate("participants", "firstName lastName photoUrl")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        return res.json({
            success: true,
            message: "Conversations fetched",
            data: conversations,
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
