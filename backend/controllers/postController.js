const postModel = require('../models/postModel');
const cloudinary = require("../config/cloudinary");


module.exports.createPost = async (req, res) => {
    const { caption } = req.body;

    const owner = req.user._id;

    let photoUrl = undefined;

    if (req.file) {
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "user_posts",
        });
        photoUrl = cloud.secure_url;
    }

    try {

        const post = await postModel.create({
            owner,
            image: photoUrl,
            caption
        });

        if (!post) return res.status(400).json({ message: "Post not created" });
        return res.status(200).json({ message: "Post created", post });

    } catch {
        return res.status(500).json({ message: "Internal server error" });

    }

}


module.exports.fetchPosts = async (req, res) => {
    const { _id } = req.user;

    try {
        const posts = await postModel.find({ owner: _id })
            .populate("owner", "firstName lastName photoUrl username");;

        if (!posts) return res.status(400).json({ message: "Posts not found" });
        return res.status(200).json({ message: "Posts fetched", posts });

    } catch {
        return res.status(500).json({ message: "Internal server error" });


    }
}


module.exports.like_Dislike_Post = async (req, res) => {
    const postId = req.params.id; // route: PUT /like-dislike/:id
    const userId = req.user._id;

    try {
        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const isLiked = post.likes.includes(userId);

        if (isLiked) {
            // Remove Like
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            post.likesCount = Math.max(0, post.likesCount - 1); // Prevent negative counts
        } else {
            // Add Like
            post.likes.push(userId);
            post.likesCount++;

            // Create notification if liking someone else's post
            if (post.owner.toString() !== userId.toString()) {
                const Notification = require('../models/notificationModel');
                const notification = await Notification.create({
                    recipient: post.owner,
                    sender: userId,
                    type: 'like',
                    post: post._id
                });

                if (req.io) {
                    req.io.to(post.owner.toString()).emit("newNotification", {
                        _id: notification._id,
                        type: 'like',
                        sender: {
                            _id: req.user._id,
                            firstName: req.user.firstName,
                            lastName: req.user.lastName,
                            photoUrl: req.user.photoUrl
                        },
                        post: post._id,
                        isRead: false,
                        createdAt: notification.createdAt
                    });
                }
            }
        }

        // Save the changes
        await post.save();

        // IMPORTANT: Populate the owner details before sending back to Redux
        const populatedPost = await post.populate("owner", "firstName lastName photoUrl");

        return res.status(200).json(populatedPost);
    }
    catch (error) {
        console.error("Like/Dislike Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


module.exports.deletePost = async (req, res) => {
    const postId = req.params.id; // route: DELETE /post/:id

    try {
        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: you do not own this post" });
        }
        await postModel.findByIdAndDelete(postId);
        return res.status(200).json({ message: "Post deleted" });

    } catch (error) {
        console.error("Delete Post Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.editPost = async (req, res) => {
    const postId = req.params.id; // route: PUT /post/:id
    const { caption } = req.body;

    try {
        const post = await postModel.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized: you do not own this post" });
        }
        post.caption = caption;
        await post.save();
        const populated = await post.populate("owner", "firstName lastName photoUrl username");
        return res.status(200).json({ message: "Post edited", post: populated });
    } catch (error) {
        console.error("Edit Post Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports.getPosts = async (req, res) => {
    try {
        const posts = await postModel
            .find()
            .populate("owner", "firstName lastName photoUrl email") // Only fetch these fields
            // OR: .populate("owner", "-password") // Fetch everything EXCEPT password
            .sort({ createdAt: -1 }); // Sort by newest first (typical for a feed)

        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports.getUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const posts = await postModel
            .find({ owner: userId })
            .populate("owner", "firstName lastName photoUrl username")
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};