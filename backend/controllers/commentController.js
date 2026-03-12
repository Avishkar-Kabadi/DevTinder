const commentModel = require('../models/commentModel');



module.exports.createComment = async (req, res) => {
    const { postId, text } = req.body;
    const userId = req.user._id;

    try {
        if (!text || !text.trim()) {
            return res.status(400).json({ message: "Comment text is required" });
        }

        // 1. Create the comment
        const newComment = await commentModel.create({
            post: postId,
            user: userId,
            text: text.trim()
        });

        // 2. Fetch the newly created comment AND populate user details
        // We do this so the UI can immediately show the commenter's name/photo
        const populatedComment = await commentModel.findById(newComment._id)
            .populate("user", "firstName lastName photoUrl");

        if (!populatedComment) {
            return res.status(404).json({ message: "Failed to retrieve created comment" });
        }

        // Notify post owner
        const postModel = require('../models/postModel');
        const Notification = require('../models/notificationModel');
        const post = await postModel.findById(postId);
        
        if (post && post.owner.toString() !== userId.toString()) {
            const notification = await Notification.create({
                recipient: post.owner,
                sender: userId,
                type: 'comment',
                post: postId,
                content: text.trim().substring(0, 50)
            });

            if (req.io) {
                req.io.to(post.owner.toString()).emit("newNotification", {
                    _id: notification._id,
                    type: 'comment',
                    sender: { 
                        _id: req.user._id, 
                        firstName: req.user.firstName, 
                        lastName: req.user.lastName, 
                        photoUrl: req.user.photoUrl 
                    },
                    post: postId,
                    content: text.trim().substring(0, 50),
                    isRead: false,
                    createdAt: notification.createdAt
                });
            }
        }

        // 3. SEND THE RESPONSE (Crucial!)
        return res.status(201).json(populatedComment);

    } catch (error) {
        console.error("Create Comment Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.getComments = async (req, res) => {
    let postId = req.params.id;

    try {
        // if (!mongoose.Types.ObjectId.isValid(postId)) {
        //     return res.status(400).json({
        //         message: "Invalid Post ID format",
        //         debug: `ID received: '${postId}' (Length: ${postId.length})`
        //     });
        // }

        const comments = await commentModel.find({ post: postId })
            .populate("user", "firstName lastName photoUrl")
            .sort({ createdAt: 1 });

        return res.status(200).json(comments);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ message: "Internal Server error" });
    }
};
module.exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user._id;

    try {
        const comment = await commentModel.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        await commentModel.findByIdAndDelete(commentId);

        return res.status(204).send();

    } catch (error) {
        console.error("Delete Comment Error:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
};

