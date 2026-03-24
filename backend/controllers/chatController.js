const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");



const emitSocketEvent = (req, event, data) => {
    try {
        if (req.io && data.receiverId) {
            req.io.to(data.receiverId.toString()).emit(event, data);
        }
    } catch (err) {
        console.log("Socket Emit Error:", err.message);
    }
};

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

        const receiverId = conversation.participants.find(
            (id) => id.toString() !== senderId.toString()
        );


        const message = await Message.create({
            conversationId,
            sender: senderId,
            receiver: receiverId,
            text: text || "",
            photoUrl: photoUrl || null,
        });

        conversation.lastMessage = message._id;
        await conversation.save();


        emitSocketEvent(req, "sendMessage", {
            message,
            conversationId,
            senderId,
            photoUrl: req.user.photoUrl,
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

module.exports.editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Message text is required" });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not allowed to edit this message" });
        }
        if (message.isDeleted) {
            return res.status(400).json({ message: "Cannot edit a deleted message" });
        }

        message.text = text.trim();
        message.editedAt = new Date();
        await message.save();

        if (req.io) {
            req.io.to(message.conversationId.toString()).emit("messageEdited", {
                messageId: message._id,
                text: message.text,
                editedAt: message.editedAt,
                conversationId: message.conversationId,
            });
        }

        return res.json({ success: true, data: message });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports.deleteMessageForEveryone = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not allowed to delete this message" });
        }

        message.text = "This message was deleted";
        message.photoUrl = null;
        message.isDeleted = true;
        message.editedAt = new Date();
        await message.save();

        if (req.io) {
            req.io.to(message.conversationId.toString()).emit("messageDeleted", {
                messageId: message._id,
                conversationId: message.conversationId,
                text: message.text,
            });
        }

        return res.json({ success: true, data: message });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


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
