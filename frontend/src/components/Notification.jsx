import { X, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotifications } from "../store/chatSlice";
import { decodeMessage } from "../utils/messageEncoder";

const Notification = () => {
  const dispatch = useDispatch();
  const notification = useSelector((store) => store.chat?.notifications);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setIsVisible(true), 10);
      const autoHide = setTimeout(() => handleDismiss(), 5000);
      return () => {
        clearTimeout(timer);
        clearTimeout(autoHide);
      };
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch(removeNotifications());
    }, 400);
  };

  if (!notification) return null;

  // FIX: Extract strings from objects to prevent "Objects are not valid as a React child"
  // If sender is an object, get the name property. If it's a string, use it directly.
  const displaySender = typeof notification.sender === 'object'
    ? (notification.sender.firstName || notification.sender.name || "User")
    : notification.sender;

  // If message is the object from your error log, it contains 'text'
  const displayMessage = typeof notification.message === 'object'
    ? notification.message.text
    : (notification.text || notification.message);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex justify-center p-4 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
        ${isVisible ? "translate-y-4 opacity-100" : "-translate-y-full opacity-0"}
      `}
    >
      <div className="pointer-events-auto w-full max-w-md overflow-hidden relative group">
        <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] p-4 flex items-center gap-4">

          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-70" />

          <div className="relative shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-cyan-500/30">
              <img
                src={notification.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                alt="Sender"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black p-1 rounded-full animate-pulse">
              <Bell className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-100 truncate pr-2">
                {/* SAFE STRING RENDERING */}
                {displaySender || "New Message"}
              </h3>
              <button onClick={handleDismiss} className="text-gray-500 hover:text-white transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-gray-400 text-sm line-clamp-1 italic">
              {/* SAFE STRING RENDERING */}
              {displayMessage ? decodeMessage(displayMessage) : "Sent a message..."}
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 h-[3px] bg-cyan-500/50 animate-shrink-width" style={{ width: '100%' }} />
      </div>
    </div>
  );
};

export default Notification;