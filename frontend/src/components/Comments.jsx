import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../utils/constants';
import { Trash2, Send } from 'lucide-react';

export default function Comments({ postId, currentUser, postOwnerId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchComments = async () => {
        try {
            const res = await axios.get(`${baseUrl}/api/comments/${postId}`, { withCredentials: true });
            setComments(res.data);
        } catch (err) {
            console.error("Error fetching comments", err);
        }
    };

    useEffect(() => {
        if (postId) fetchComments();
    }, [postId]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const res = await axios.post(`${baseUrl}/api/comments/comment`, { postId, text: newComment }, { withCredentials: true });
            setComments([...comments, res.data]);
            setNewComment("");
        } catch (err) { console.log(err); }
    };

    // --- DELETE API INTEGRATION ---
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axios.delete(`${baseUrl}/api/comments/comment/${commentId}`, { withCredentials: true });
            // Update UI locally
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-base-100">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments.map((comment) => {
                    // Logic: Is current user the author OR the post owner?
                    const isAuthor = currentUser?._id === comment.user?._id;
                    const isPostOwner = currentUser?._id === postOwnerId;
                    const canDelete = isAuthor || isPostOwner;

                    return (
                        <div key={comment._id} className="group flex gap-3 items-start justify-between">
                            <div className="flex gap-3 items-start">
                                <div className="avatar">
                                    <div className="w-8 h-8 rounded-full">
                                        <img src={comment.user?.photoUrl || "https://via.placeholder.com/150"} alt="avatar" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="text-sm">
                                        <span className="font-bold mr-2">{comment.user?.firstName}</span>
                                        <span className="text-base-content">{comment.text}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* DELETE BUTTON: Only visible if authorized */}
                            {canDelete && (
                                <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-error transition-all"
                                    title="Delete comment"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            <form onSubmit={handlePostComment} className="p-4 border-t border-base-300 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="text-primary font-bold text-sm disabled:opacity-50">Post</button>
            </form>
        </div>
    );
}