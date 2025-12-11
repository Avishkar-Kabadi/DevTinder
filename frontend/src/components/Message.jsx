import axios from "axios";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { baseUrl } from "../utils/constants";
import { socket } from "../utils/socket";

const Message = () => {
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
    // Safely return the sender ID whether it's an object or a string
    return msg?.sender?._id || msg?.sender;
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${baseUrl}/api/chat/message/${conversationId}`,
        { withCredentials: true }
      );

      setMessages(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
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
        { text: messageToSend },
        { withCredentials: true }
      );

      const msg = res.data.data;

      setMessages((prev) => prev.map((m) => (m._id === tempId ? msg : m)));

      socket.emit("sendMessage", {
        conversationId,
        message: msg,
        recipientId: "...",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message.");
      setText(originalText);
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      });
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    socket.emit("joinConversation", conversationId);

    const handleReceiveMessage = (msg) => {
      const senderId = getSenderId(msg);

      if (senderId !== currentUserId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (conversationId) fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="w-full h-[90vh] flex justify-center bg-base-200">
      <div className="w-full max-w-4xl flex flex-col border border-base-300 rounded-lg overflow-hidden bg-white">
        <div className="p-4 bg-base-300 shadow-md font-extrabold text-xl text-primary sticky top-0 z-0">
          <div display="flex" className="flex items-center gap-3">
            <img
              className="h-10 w-10 rounded-full"
              src={OtherUserphotoUrl}
              alt=""
            />
            <div>
              {OtherUserfirstName} {OtherUserlastName}
            </div>
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({loading ? "Loading..." : `${messages.length} messages`})
            </span>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800"
        >
          {messages.map((msg) => {
            const senderId = getSenderId(msg);
            const isMine = senderId === currentUserId;

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] lg:max-w-[50%] p-3 rounded-2xl shadow-md 
                                        ${
                                          isMine
                                            ? "bg-primary text-primary-content rounded-br-none"
                                            : "bg-base-300 text-base-content rounded-tl-none"
                                        }
                                        ${msg.isTemporary ? "opacity-60" : ""}`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <small
                    className={`text-xs block mt-1 ${
                      isMine ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          )}
        </div>

        <div className="p-4 bg-base-100 flex items-center gap-2 border-t border-base-300 sticky bottom-0 z-10">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="input input-bordered input-primary w-full shadow-inner"
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            className="btn btn-primary min-w-[60px]"
            disabled={!text.trim() || loading}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Message;
