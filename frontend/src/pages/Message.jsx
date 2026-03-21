import axios from "axios";
import { Send, ArrowLeft, Phone, Video, Info, RefreshCw, ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  clearNewMessage,
  removeActiveConversationId,
  setActiveConversationId,
} from "../store/chatSlice";
import { baseUrl } from "../utils/constants";
import { socket } from "../utils/socket";
import { encodeMessage, decodeMessage } from "../utils/messageEncoder";

const Message = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const user = useSelector((store) => store.user);
  const currentUserId = user?._id;
  const location = useLocation();
  const { OtherUserphotoUrl, OtherUserfirstName, OtherUserlastName } =
    location.state || {};

  const getSenderId = (msg) => {
    return msg?.sender?._id || msg?.sender;
  };

  const [otherUserId, setOtherUserId] = useState(location.state?.OtherUserId || null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMessages = async (isRefetch = false) => {
    if (isRefetch) setIsRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await axios.get(
        `${baseUrl}/api/chat/message/${conversationId}`,
        { withCredentials: true }
      );

      const rawMsgs = Array.isArray(res.data?.data) ? res.data.data : [];
      const decodedMsgs = rawMsgs.map(msg => ({ ...msg, text: decodeMessage(msg.text) }));
      setMessages(decodedMsgs);

      if (!otherUserId) {
        const remoteMsg = decodedMsgs.find(m => getSenderId(m) !== currentUserId);
        if(remoteMsg) setOtherUserId(getSenderId(remoteMsg));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  const startCall = (isVideo) => {
      if (!otherUserId) return;
      window.dispatchEvent(new CustomEvent('startCall', {
          detail: {
              userToCall: otherUserId,
              isVideo,
              name: `${OtherUserfirstName} ${OtherUserlastName}`,
              photo: OtherUserphotoUrl
          }
      }));
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    const messageToSend = text.trim();
    const originalText = text;
    const tempId = Date.now();

    const tempMessage = {
      _id: tempId,
      text: messageToSend,
      sender: { _id: currentUserId },
      createdAt: new Date().toISOString(),
      isTemporary: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {
      const res = await axios.post(
        `${baseUrl}/api/chat/message/${conversationId}`,
        { text: encodeMessage(messageToSend) },
        { withCredentials: true }
      );

      // The DB returns the encoded message, decode it for our own state
      const dbMsg = res.data.data;
      const decodedMsg = { ...dbMsg, text: decodeMessage(dbMsg.text) };

      setMessages((prev) => prev.map((m) => (m._id === tempId ? decodedMsg : m)));

      // Broadcast encoded payload
      socket.emit("sendMessage", {
        conversationId,
        message: dbMsg, // Send the encoded db message
        receiverId: dbMsg.receiver,
        sender: user?.firstName + " " + user?.lastName,
        photoUrl: user?.photoUrl,
        recipientId: "...",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setText(originalText);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: "smooth"
        });
        setShowScrollDown(false);
    }
  };

  const handleScroll = () => {
      if(scrollRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
          if (scrollHeight - scrollTop - clientHeight > 150) {
              setShowScrollDown(true);
          } else {
              setShowScrollDown(false);
          }
      }
  };

  useEffect(() => {
    if (!conversationId) return;

    dispatch(setActiveConversationId(conversationId));

    socket.emit("joinConversation", conversationId);

    const handleReceiveMessage = (msg) => {
      const senderId = getSenderId(msg);

      if (!otherUserId && senderId !== currentUserId) {
          setOtherUserId(senderId);
      }

      if (senderId !== currentUserId) {
        setMessages((prev) => [...prev, { ...msg, text: decodeMessage(msg.text) }]);
      }
    };

    const handleOnlineUsers = (users) => setOnlineUsers(users);

    socket.emit("getOnlineUsers");
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("onlineUsers", handleOnlineUsers);
      dispatch(removeActiveConversationId());
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (conversationId) fetchMessages();
    dispatch(clearNewMessage({ conversationId }));
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full h-full sm:h-[90vh] flex justify-center bg-base-200/50 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl flex flex-col sm:border sm:border-base-300 sm:rounded-2xl overflow-hidden bg-base-100 shadow-xl">
        
        {/* Chat Header */}
        <div className="px-4 py-3 bg-base-100/95 backdrop-blur-sm border-b border-base-200 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="btn btn-ghost btn-circle btn-sm sm:hidden mr-1"
            >
                <ArrowLeft className="w-5 h-5 text-base-content/70" />
            </button>
            <div className="relative">
                <img
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-base-200"
                src={OtherUserphotoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                alt=""
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg hover:underline cursor-pointer">
                {OtherUserfirstName} {OtherUserlastName}
              </span>
              <span className={`text-xs flex items-center gap-1 ${onlineUsers.includes(otherUserId) ? 'text-green-500 font-semibold' : 'text-base-content/60'}`}>
                {loading ? "Connecting..." : onlineUsers.includes(otherUserId) ? "Online" : "Offline"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 text-base-content/70">
              <button 
                  onClick={() => fetchMessages(true)}
                  disabled={isRefreshing}
                  className="btn btn-ghost btn-circle btn-sm hover:text-primary transition-colors"
                  title="Refresh Messages"
              >
                  <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => startCall(false)} className="btn btn-ghost btn-circle btn-sm hover:text-primary transition-colors">
                  <Phone className="w-5 h-5" />
              </button>
              <button onClick={() => startCall(true)} className="btn btn-ghost btn-circle btn-sm hover:text-primary transition-colors">
                  <Video className="w-5 h-5" />
              </button>
              <button className="btn btn-ghost btn-circle btn-sm hidden sm:flex hover:text-primary transition-colors">
                  <Info className="w-5 h-5" />
              </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="relative flex-1 overflow-hidden flex flex-col">
            <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed relative"
            >
          {loading && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <span className="loading loading-spinner text-primary loading-lg"></span>
            </div>
          )}

          {messages.map((msg, index) => {
            const senderId = getSenderId(msg);
            const isMine = senderId === currentUserId;
            
            // Check if this is the first message or if the sender changed
            const showAvatar = index === 0 || getSenderId(messages[index - 1]) !== senderId;

            return (
              <div
                key={msg._id || index}
                className={`flex ${isMine ? "justify-end" : "justify-start"} items-end gap-2 group`}
              >
                  {!isMine && showAvatar && (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto ml-1">
                          <img src={OtherUserphotoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="" />
                      </div>
                  )}
                  {!isMine && !showAvatar && <div className="w-8 shrink-0 ml-1"></div>}

                <div className={`flex flex-col ${isMine ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[65%]`}>
                    <div
                    className={`px-4 py-2.5 shadow-sm text-[15px]
                            ${
                                isMine
                                ? "bg-primary text-primary-content rounded-2xl rounded-tr-md sm:rounded-3xl sm:rounded-br-sm"
                                : "bg-base-200 text-base-content rounded-2xl rounded-tl-md sm:rounded-3xl sm:rounded-bl-sm border border-base-300"
                            }
                            ${msg.isTemporary ? "opacity-70 flex items-center gap-2" : "transition-transform hover:-translate-y-0.5"}`}
                    >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    {msg.isTemporary && <span className="loading loading-spinner loading-xs shrink-0"></span>}
                    </div>

                    <span className={`text-[10px] sm:text-xs text-base-content/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Floating Scroll Down Button */}
        {showScrollDown && (
            <button 
                onClick={scrollToBottom}
                className="absolute bottom-[80px] sm:bottom-[90px] right-6 z-50 btn btn-circle btn-primary btn-sm sm:btn-md shadow-xl animate-bounce border-2 border-base-100"
            >
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-base-100" />
            </button>
        )}
        </div>

        {/* Message Input Container */}
        <div className="p-3 bg-base-100 border-t border-base-200 flex items-end gap-2 shrink-0 z-10">
            <button className="btn btn-ghost btn-circle shrink-0 text-base-content/60 hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
            
          <div className="relative flex-1">
              <textarea
                value={text}
                onChange={(e) => {
                    setText(e.target.value);
                    // simple auto-resize logic could go here
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
                placeholder="Message..."
                className="w-full bg-base-200 border-none rounded-2xl sm:rounded-3xl pl-4 pr-12 py-3 sm:py-3.5 focus:outline-none focus:ring-1 focus:ring-primary/30 resize-none max-h-32 min-h-[44px] custom-scrollbar text-sm sm:text-base leading-relaxed"
                rows={1}
                disabled={loading}
              />
              <button className="absolute right-2 bottom-1.5 btn btn-ghost btn-sm btn-circle text-base-content/50 hover:text-primary transition-colors hidden sm:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
              </button>
          </div>

          <button
            onClick={sendMessage}
            className={`btn btn-circle shrink-0 transition-transform ${
                text.trim() ? "btn-primary hover:scale-105" : "bg-base-200 text-base-content/40 border-none pointer-events-none"
            }`}
            disabled={!text.trim() || loading}
          >
            <Send className="w-5 h-5 -ml-1 mt-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
