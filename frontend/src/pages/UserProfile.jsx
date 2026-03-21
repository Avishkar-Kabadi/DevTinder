import { useLocation, useNavigate, useParams } from "react-router-dom";
import { UserPlus, CheckCircle2, ArrowLeft, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { baseUrl } from "../utils/constants";
import { useSelector, useDispatch } from "react-redux";
import Post from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";
import { setProfilePosts } from "../store/profilePostsSlice";
import { RefreshCw, FileText } from "lucide-react";

export default function UserProfile() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Prefer route state (fast nav), fall back to API fetch on hard-reload
    const [profileUser, setProfileUser] = useState(location.state?.user || null);
    const [profileUserLoading, setProfileUserLoading] = useState(!location.state?.user);
    const user = profileUser; // alias for backwards compat with rest of component

    useEffect(() => {
        if (!profileUser && id) {
            setProfileUserLoading(true);
            axios.get(`${baseUrl}/auth/user/${id}`, { withCredentials: true })
                .then(res => setProfileUser(res.data.user))
                .catch(() => navigate('/'))
                .finally(() => setProfileUserLoading(false));
        }
    }, [id]);

    const currentUser = useSelector(store => store.user);
    const profilePosts = useSelector(store => store.profilePosts) || [];
    const dispatch = useDispatch();
    
    const [localSent, setLocalSent] = useState(false);
    const [localAccepted, setLocalAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    if (profileUserLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
        );
    }

    const fetchUserPosts = async (isRefetch = false) => {
        if (!user?._id) return;
        if (isRefetch) setIsRefreshing(true);
        else setIsPageLoading(true);

        try {
            const res = await axios.get(`${baseUrl}/api/posts/user/${user._id}`, { withCredentials: true });
            dispatch(setProfilePosts(res.data));
        } catch (err) {
            console.error("Error fetching user posts", err);
        } finally {
            setIsPageLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUserPosts();
    }, [user?._id, dispatch]);

    if (!user) {
        return (
            <div className="flex flex-col justify-center items-center h-[70vh]">
                <p className="text-xl font-medium mb-6 text-gray-400">User not found or data missing.</p>
                <button onClick={() => navigate('/search')} className="btn-electric rounded-xl">Go back to Search</button>
            </div>
        );
    }

    const isConnected = currentUser?.connections?.includes(user._id) || localAccepted;
    const hasSent = currentUser?.sentRequests?.includes(user._id) || localSent;
    const hasReceived = currentUser?.requests?.includes(user._id);

    const handleSendRequest = async () => {
        setLoading(true);
        try {
            await axios.post(
                `${baseUrl}/api/send-request/${user._id}`,
                {},
                { withCredentials: true }
            );
            setLocalSent(true);
        } catch (error) {
            console.error("Failed to send request", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        setLoading(true);
        try {
            await axios.post(
                `${baseUrl}/api/accept-request/${user._id}`,
                {},
                { withCredentials: true }
            );
            setLocalAccepted(true);
        } catch (error) {
            console.error("Failed to accept request", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300 text-gray-100">
            <button 
                onClick={() => navigate(-1)} 
                className="btn-ghost-dev mb-6 w-10 h-10 p-0 rounded-full"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col">
                {/* Instagram-style Header */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-start mb-10 px-4 mt-4 glass-panel p-8">
                    {/* Avatar */}
                    <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
                        <img 
                            src={user.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} 
                            alt={user.firstName}
                            className="w-full h-full object-cover rounded-[2rem] border border-white/10 p-1 shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        />
                    </div>
                
                    {/* Info & Stats */}
                    <div className="flex-1 flex flex-col items-center md:items-start w-full">
                    
                        {/* Username & Action Buttons */}
                        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold mr-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white transform tracking-tight">
                                {user.username || user.firstName.toLowerCase()}
                            </h2>
                            
                            {isConnected ? (
                                <button 
                                    onClick={() => navigate(`/chat/${user._id}`)}
                                    className="btn btn-sm rounded-xl bg-white/10 text-white hover:bg-white/20 border-none h-10 px-4 transition-all"
                                >
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Message
                                </button>
                            ) : hasReceived && !localAccepted ? (
                                <button 
                                    onClick={handleAcceptRequest}
                                    disabled={loading}
                                    className="btn btn-sm rounded-xl gap-2 font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none transition-all h-10 px-4"
                                >
                                    {loading && <span className="loading loading-spinner loading-xs text-emerald-400"></span>}
                                    Accept Request
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSendRequest}
                                    disabled={hasSent || loading}
                                    className={`btn btn-sm rounded-xl font-medium px-6 transition-all border-none h-10 ${
                                        hasSent 
                                        ? "bg-emerald-500/10 text-emerald-400" 
                                        : "btn-electric"
                                    }`}
                                >
                                    {loading && !hasSent && <span className="loading loading-spinner loading-xs text-white"></span>}
                                    {hasSent ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 mr-1" />
                                            Requested
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4 mr-1" />
                                            Connect
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    
                        {/* Bio text */}
                        <div className="text-center md:text-left text-sm max-w-lg mb-2">
                            <p className="font-semibold mb-1 text-base text-gray-200">{user.firstName} {user.lastName} <span className="font-normal text-gray-500 text-sm ml-1">{user.age ? `• ${user.age}` : ''} {user.gender ? `• ${user.gender}` : ''}</span></p>
                            <p className="whitespace-pre-wrap leading-relaxed mt-2 text-gray-400">{user.about || "No bio added yet."}</p>
                        </div>
                    </div>
                </div>
            
                {/* Divider & Posts */}
                <div className="border-t border-white/5 pt-6 mt-4">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="border-t-[1.5px] border-cyan-500 pt-4 tracking-widest text-xs font-semibold uppercase flex gap-2 items-center text-cyan-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            Posts
                        </div>
                        <button 
                            onClick={() => fetchUserPosts(true)}
                            disabled={isRefreshing}
                            className="btn btn-sm btn-ghost text-gray-400 hover:text-white"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-1.5 w-full">
                        {isPageLoading ? (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="aspect-square rounded-xl bg-base-200 animate-pulse"></div>
                            ))
                        ) : profilePosts && profilePosts.length > 0 ? (
                            profilePosts.map((post) => (
                                <button
                                    key={post._id}
                                    onClick={() => navigate(`/posts/${user._id}/${post._id}`)}
                                    className="aspect-square rounded-xl overflow-hidden relative group border border-white/5 hover:border-cyan-500/30 transition-all duration-200"
                                >
                                    {post.image ? (
                                        <img
                                            src={post.image}
                                            alt="post"
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex flex-col items-start justify-end p-3 border border-white/5">
                                            <FileText className="w-4 h-4 text-cyan-400/60 mb-1" />
                                            <p className="text-[11px] font-medium text-gray-300 line-clamp-3 text-left leading-tight">{post.caption || 'Post'}</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <span className="text-white text-xs font-bold">{post.likesCount || 0} ♥</span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-3 flex flex-col items-center justify-center py-10 opacity-60">
                                <p className="text-gray-400">No posts down here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
