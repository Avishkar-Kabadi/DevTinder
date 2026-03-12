import { baseUrl } from "../utils/constants";
import { useState, useEffect, useCallback } from "react"; // Added useCallback
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Search as SearchIcon, UserPlus, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cacheResults } from "../store/searchSlice";

export default function Search() {
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fallbacks for optimistic UI
    const [localSent, setLocalSent] = useState(new Set());
    const [localAccepted, setLocalAccepted] = useState(new Set());

    const currentUser = useSelector((store) => store.user);
    const searchCache = useSelector((store) => store.search);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Memoized fetch function to prevent unnecessary re-renders
    const fetchSearchResults = useCallback(async (query) => {
        setLoading(true);
        setError("");
        try {
            const response = await axios.get(`${baseUrl}/auth/search?query=${query}`, { 
                withCredentials: true 
            });

            const filteredUsers = response.data.users.filter(u => u._id !== currentUser._id);
            setUsers(filteredUsers);

            dispatch(cacheResults({
                query: query,
                results: filteredUsers
            }));

            if (filteredUsers.length === 0 && response.data.users.length > 0) {
                setError("No other users found matching your search.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong while searching.");
        } finally {
            setLoading(false);
        }
    }, [currentUser._id, dispatch]);

    useEffect(() => {
        const trimmedQuery = searchQuery.trim();
        
        if (!trimmedQuery) {
            setUsers([]);
            return;
        }

        // Check cache first
        if (searchCache[trimmedQuery]) {
            setUsers(searchCache[trimmedQuery]);
            setLoading(false);
            return;
        }

        const timerId = setTimeout(() => {
            fetchSearchResults(trimmedQuery);
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery, searchCache, fetchSearchResults]);

    const handleSendRequest = async (e, targetUserId) => {
        e.stopPropagation();
        try {
            await axios.post(
                `${baseUrl}/api/send-request/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setLocalSent(prev => new Set([...prev, targetUserId]));
        } catch (error) {
            console.error("Failed to send request", error);
        }
    };

    const handleAcceptRequest = async (e, targetUserId) => {
        e.stopPropagation();
        try {
            await axios.post(
                `${baseUrl}/api/accept-request/${targetUserId}`,
                {},
                { withCredentials: true }
            );
            setLocalAccepted(prev => new Set([...prev, targetUserId]));
        } catch (error) {
            console.error("Failed to accept request", error);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent tracking-tight mb-8">
                Discover People
            </h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 glass-panel p-4 rounded-3xl">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {loading ? (
                            <span className="loading loading-spinner loading-sm text-cyan-400"></span>
                        ) : (
                            <SearchIcon className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                    <input
                        type="text"
                        className="loom-input w-full pl-12 rounded-2xl h-14 text-lg"
                        placeholder="Search by name, username or interests..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <div className="alert bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl mb-6">
                    <span>{error}</span>
                </div>
            )}

            {!loading && users.length === 0 && !error && searchQuery && (
                <div className="flex flex-col items-center justify-center py-20 text-base-content/40">
                    <SearchIcon className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg">No people found. Try a different search term.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map((user) => {
                    const isConnected = currentUser?.connections?.includes(user._id) || localAccepted.has(user._id);
                    const hasSent = currentUser?.sentRequests?.includes(user._id) || localSent.has(user._id);
                    const hasReceived = currentUser?.requests?.includes(user._id);

                    return (
                        <div
                            key={user._id}
                            onClick={() => navigate(`/profile/${user._id}`, { state: { user } })}
                            className="glass-panel glow-border p-5 cursor-pointer group flex flex-col"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent shrink-0 group-hover:border-cyan-400 transition-colors">
                                    <img
                                        src={user.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                                        alt={user.firstName}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <h2 className="text-lg font-bold truncate group-hover:text-cyan-400 text-gray-100 transition-colors">
                                        {user.firstName} {user.lastName}
                                    </h2>
                                    <p className="text-sm text-gray-500 truncate">@{user.username || user.firstName?.toLowerCase()}</p>
                                </div>
                            </div>

                            <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                                {user.about || "No bio provided."}
                            </p>

                            <div className="mt-auto border-t border-white/5 pt-4">
                                {isConnected ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${user._id}`); }}
                                        className="btn w-full rounded-xl gap-2 font-medium bg-white/10 text-white hover:bg-white/20 border-none transition-all"
                                    >
                                        Message
                                    </button>
                                ) : (hasReceived && !localAccepted.has(user._id)) ? (
                                    <button
                                        onClick={(e) => handleAcceptRequest(e, user._id)}
                                        className="btn w-full rounded-xl gap-2 font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none transition-all"
                                    >
                                        Accept Request
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => handleSendRequest(e, user._id)}
                                        disabled={hasSent}
                                        className={`btn w-full rounded-xl gap-2 transition-all font-medium border-none ${hasSent
                                                ? "bg-emerald-500/10 text-emerald-400"
                                                : "btn-primary" // Use your primary class here
                                            }`}
                                    >
                                        {hasSent ? (
                                            <><CheckCircle2 className="w-5 h-5" /> Requested</>
                                        ) : (
                                            <><UserPlus className="w-5 h-5" /> Connect</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}