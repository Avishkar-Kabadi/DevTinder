import React, { useState } from 'react';
import axios from 'axios';
import { baseUrl } from '../utils/constants';
import { updatePost } from '../store/feedSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ThumbsUp, MessageSquare, Share2, Bookmark, MoreVertical, X } from 'lucide-react';
import Comments from './Comments';
import { useNavigate } from 'react-router-dom';

const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
};

export default function Post({ post }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showComments, setShowComments] = useState(false);
    const currentUser = useSelector((store) => store.user);

    const isLiked = post.likes?.includes(currentUser?._id);

    const handleLikeDislike = async () => {
        // Optimistic Like UI approach
        const updatedPost = {
            ...post, 
            likes: isLiked 
               ? post.likes.filter(id => id !== currentUser._id) 
               : [...(post.likes || []), currentUser._id],
            likesCount: isLiked ? post.likesCount - 1 : post.likesCount + 1
        };
        dispatch(updatePost(updatedPost));
        
        try {
            const res = await axios.put(`${baseUrl}/api/posts/like-dislike/${post._id}`, {}, { withCredentials: true });
            dispatch(updatePost(res.data)); // Sync exact state with server
        } catch (err) {
            console.error("Like error:", err);
            dispatch(updatePost(post)); // Revert entirely if it fails
        }
    };

    const navigateToProfile = () => {
        if (post.owner?._id) {
             navigate(`/profile/${post.owner._id}`, { state: { user: post.owner } });
        }
    }

    return (
        <article className="w-full mx-auto mb-6 glass-panel glow-border transition-all duration-300 max-w-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div 
                        onClick={navigateToProfile}
                        className="w-12 h-12 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-cyan-400 transition-colors"
                    >
                        <img 
                            src={post.owner?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span 
                            onClick={navigateToProfile}
                            className="font-semibold text-gray-100 cursor-pointer hover:text-cyan-400 transition-colors"
                        >
                            {post.owner?.firstName} {post.owner?.lastName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>@{post.owner?.username || post.owner?.firstName?.toLowerCase()}</span>
                            <span>•</span>
                            <span>{post.createdAt ? timeAgo(post.createdAt) : 'Just now'}</span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-ghost btn-sm btn-circle text-gray-500 hover:text-gray-100 hover:bg-white/5">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </header>

            {/* Caption */}
            {post.caption && (
                <div className="px-5 pb-3 text-gray-300 whitespace-pre-wrap text-[15px] leading-relaxed">
                    {post.caption}
                </div>
            )}

            {/* Media Item */}
            {post.image && (
                <div className="w-full bg-[#0a0a0a] flex items-center justify-center max-h-[600px] overflow-hidden border-y border-white/5">
                    <img
                        src={post.image}
                        alt="Post media"
                        className="w-full object-contain max-h-[600px]"
                        loading="lazy"
                    />
                </div>
            )}

            {/* Engagement Stats */}
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between text-sm text-gray-500">
                <div className="flex flex-1 items-center gap-2">
                    {post.likesCount > 0 && (
                        <div className="flex items-center gap-1.5">
                            <div className="bg-cyan-500/20 p-1 rounded-full"><ThumbsUp className="w-3.5 h-3.5 text-cyan-400" /></div>
                            <span className="text-gray-300">{post.likesCount.toLocaleString()} Likes</span>
                        </div>
                    )}
                </div>
                {post.comments?.length > 0 && (
                    <div 
                        className="cursor-pointer hover:underline hover:text-gray-300 transition-colors"
                        onClick={() => setShowComments(!showComments)}
                    >
                        {post.comments?.length} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
                    </div>
                )}
            </div>

            {/* Action Bar (LinkedIn/Twitter style) */}
            <div className="px-2 py-1 border-t border-white/10 flex justify-between items-center text-gray-400">
                <button 
                    onClick={handleLikeDislike} 
                    className={`btn btn-ghost hover:bg-white/5 hover:text-gray-200 border-none flex-1 gap-2 rounded-xl transition-all ${isLiked ? "text-cyan-400 bg-cyan-500/10" : ""}`}
                >
                    <ThumbsUp className={`w-5 h-5 ${isLiked ? "fill-cyan-400" : ""}`} />
                    <span className="font-semibold">{isLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)} 
                    className={`btn btn-ghost hover:bg-white/5 hover:text-gray-200 border-none flex-1 gap-2 rounded-xl transition-all ${showComments ? 'bg-white/10 text-gray-100' : ''}`}
                >
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-semibold">Comment</span>
                </button>
                <div className="hidden sm:flex flex-1">
                    <button className="btn btn-ghost hover:bg-white/5 hover:text-gray-200 border-none flex-1 gap-2 rounded-xl transition-all">
                        <Share2 className="w-5 h-5" />
                        <span className="font-semibold">Share</span>
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="border-t border-white/10 bg-[#111111]/50 p-4 transition-all duration-300 animate-in slide-in-from-top-2">
                    <Comments postId={post._id} currentUser={currentUser} />
                </div>
            )}
        </article>
    );
}