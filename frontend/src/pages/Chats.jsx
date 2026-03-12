import axios from "axios";
import { Clock, MessageSquare, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setConversations } from "../store/chatSlice";
import { baseUrl } from "../utils/constants";
import { decodeMessage } from "../utils/messageEncoder";

const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
};

const Chats = () => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((store) => store.user);
  const conversations = useSelector((store) => store.chat?.conversations);
  const newMessage = useSelector((store) => store.chat?.newMessage);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await axios.get(baseUrl + "/api/chat/conversations", {
        withCredentials: true,
      });
      dispatch(setConversations(res.data.data));
    } catch (error) {
      console.error("Error fetching chats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && (!conversations || conversations.length === 0)) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="loading loading-spinner text-primary loading-lg"></span>
      </div>
    );
  }

  if (conversations && conversations.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] px-4 animate-in fade-in duration-300">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
            <MessageSquare className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-base-content mb-2">
          No Messages Yet
        </h1>
        <p className="text-base-content/60 text-center max-w-sm mb-8">
          Connect with other developers to start chatting and collaborating on projects.
        </p>
        <button 
            onClick={() => navigate('/connections')}
            className="btn btn-primary rounded-full px-8"
        >
            Find Connections
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="sticky top-0 bg-base-100/80 backdrop-blur-md z-10 px-4 py-4 md:py-6 border-b border-base-200 mb-2">
        <h2 className="text-2xl font-bold">Messages</h2>
        
        {/* Search Bar Placeholder */}
        <div className="mt-4 relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-base-content/40" />
            </div>
            <input 
                type="text" 
                className="input border-none bg-base-200 w-full pl-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="Search messages..." 
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 md:px-0">
        <div className="flex flex-col gap-1 sm:gap-2">
            {conversations.map((conv) => {
            if (!user) return null;

            const otherUser = conv.participants.find((u) => u._id !== user._id);
            const lastMessage = conv?.lastMessage;
            const lastMessageText = lastMessage?.text ? decodeMessage(lastMessage.text) : "Start a chat...";
            const lastMessageTime = timeAgo(lastMessage?.createdAt);

            if (!otherUser) return null;

            // Check if there are unread messages
            const unreadMessages = Array.isArray(newMessage) 
                ? newMessage.filter((msg) => msg.conversationId === conv._id && msg.senderId !== user._id)
                : [];
            
            const hasUnread = unreadMessages.length > 0;

            return (
                <div
                onClick={() =>
                    navigate(`/chat/${conv._id}`, {
                    state: {
                        OtherUserphotoUrl: otherUser.photoUrl,
                        OtherUserfirstName: otherUser.firstName,
                        OtherUserlastName: otherUser.lastName,
                    },
                    })
                }
                key={conv._id}
                className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl cursor-pointer transition-all duration-200 group
                    ${hasUnread ? 'bg-primary/5 hover:bg-primary/10' : 'bg-transparent hover:bg-base-200'}
                `}
                >
                
                {/* Avatar with Online indicator placeholder */}
                <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-base-200 group-hover:border-primary/30 transition-colors">
                        <img
                        src={
                            otherUser.photoUrl ||
                            "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        }
                        alt={`${otherUser.firstName} Profile`}
                        className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Fake online indicator */}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100"></div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                        <h4 className={`text-base truncate ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                            {otherUser.firstName} {otherUser.lastName}
                        </h4>
                        <span className={`text-xs whitespace-nowrap ml-2 ${hasUnread ? 'text-primary font-medium' : 'text-base-content/50'}`}>
                            {lastMessageTime}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center pr-1">
                        <p className={`text-sm truncate max-w-[85%] ${hasUnread ? 'text-base-content font-medium' : 'text-base-content/60'}`}>
                            {lastMessage?.senderId === user._id && "You: "}{lastMessageText}
                        </p>
                        
                        {hasUnread && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                                <span className="text-[10px] text-primary-content font-bold">
                                    {unreadMessages.length}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            );
            })}
        </div>
      </div>
    </div>
  );
};

export default Chats;
