import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Post from "../../components/Post";
import PostSkeleton from "../../components/PostSkeleton";
import axios from "axios";
import { baseUrl } from "../../utils/constants";
import { setUserPosts } from "../../store/userPostsSlice";
import { setProfilePosts } from "../../store/profilePostsSlice";

const UserPostsDetail = () => {
    const { userId, postId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const currentUser = useSelector((store) => store.user);
    
    // Determine which slice to use
    const isSef = currentUser?._id === userId;
    const userPosts = useSelector((store) => store.userPosts);
    const profilePosts = useSelector((store) => store.profilePosts);
    const posts = isSef ? userPosts : profilePosts;

    const [loading, setLoading] = useState(false);
    const postRefs = useRef({});

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const url = isSef 
                ? `${baseUrl}/api/posts/my-posts` 
                : `${baseUrl}/api/posts/user/${userId}`;
            
            const res = await axios.get(url, { withCredentials: true });
            
            if (isSef) {
                dispatch(setUserPosts(res.data.posts || res.data));
            } else {
                dispatch(setProfilePosts(res.data.posts || res.data));
            }
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!posts || posts.length === 0) {
            fetchPosts();
        }
    }, [userId]);

    useEffect(() => {
        if (posts && posts.length > 0 && postId) {
            // Give time for components to mount
            const timer = setTimeout(() => {
                const element = postRefs.current[postId];
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [posts, postId]);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 sticky top-0 md:top-4 z-20 bg-base-100/80 backdrop-blur-md p-2 -mx-2 rounded-2xl border border-white/5">
                <button 
                    onClick={() => navigate(-1)}
                    className="btn btn-ghost btn-circle hover:bg-white/5"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-bold">Posts</h1>
            </div>

            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                {loading ? (
                    <>
                        <PostSkeleton />
                        <PostSkeleton />
                    </>
                ) : posts && posts.length > 0 ? (
                    posts.map((post) => (
                        <div 
                            key={post._id} 
                            ref={(el) => (postRefs.current[post._id] = el)}
                            className={`transition-all duration-1000 ${post._id === postId ? 'ring-2 ring-cyan-500/50 rounded-3xl' : ''}`}
                        >
                            <Post post={post} />
                        </div>
                    ))
                ) : !loading && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-60">
                        <p className="text-gray-400">No posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserPostsDetail;
