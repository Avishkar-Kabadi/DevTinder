import axios from "axios";
import { Clock, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setConversations } from "../store/chatSlice";
import { baseUrl } from "../utils/constants";

const Chats = () => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((store) => store.user);
  const conversations = useSelector((store) => store.chat?.conversations);
  const newMessage = useSelector((store) => store.chat?.newMessage);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (conversations.length === 0) {
      fetchConversations();
    }
  }, [conversations.length]);

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

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (conversations && conversations.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center my-10 p-6 bg-base-100 rounded-lg shadow-lg max-w-md mx-auto">
        <MessageSquare className="w-10 h-10 text-gray-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-700">
          No Conversations Yet!
        </h1>
        <p className="text-gray-500 mt-2 text-center">
          Start a new conversation to see your chats appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-4">
      <h2 className="text-2xl font-bold text-primary mb-4 border-b pb-2">
        💬 Your Chats
      </h2>

      <div className="space-y-2">
        {conversations.map((conv) => {
          if (!user) return null;

          const otherUser = conv.participants.find((u) => u._id !== user._id);
          const lastMessage = conv?.lastMessage;
          const lastMessageText = lastMessage?.text || "Start a chat...";
          const lastMessageTime = formatTime(lastMessage?.createdAt);

          if (!otherUser) return null;

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
              className="flex items-center gap-4 p-3 bg-base-100 rounded-xl shadow-md cursor-pointer 
                                transition duration-200 hover:bg-base-200 hover:shadow-lg"
            >
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img
                    src={
                      otherUser.photoUrl ||
                      "https://via.placeholder.com/150?text=U"
                    }
                    alt={`${otherUser.firstName} Profile`}
                  />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold truncate">
                  {otherUser.firstName} {otherUser.lastName}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {lastMessageText}
                </p>
              </div>
              <div className="flex flex-col items-end text-right text-xs">
                {/* Display last message time */}
                <span className="text-base-content/60 font-medium mb-1">
                  {lastMessageTime}
                </span>

                {/* Display Unread Count Badge */}
                {/* Assuming unreadCount is calculated and is > 0 */}
                {lastMessage && (
                  <>
                    {/* Find the number of unread messages for this conversation */}
                    {Array.isArray(newMessage) &&
                      newMessage.filter(
                        (msg) => msg.conversationId === conv._id
                      ).length > 0 && (
                        // Use a DaisyUI badge for a modern unread indicator
                        <div className="badge badge-primary badge-sm text-white font-semibold">
                          {/* Display the count, or just 'New' if the count is not ready/needed */}
                          {
                            newMessage.filter(
                              (msg) => msg.conversationId === conv._id
                            ).length
                          }
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Chats;
