import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotifications } from "../store/chatSlice";
import { decodeMessage } from "../utils/messageEncoder";

const Notification = () => {
  const dispatch = useDispatch();
  // ⚠️ CRITICAL REDUX FIX: Use 'notification' (singular) as defined in chatSlice
  const notification = useSelector((store) => store.chat?.notifications);
  const [isVisible, setIsVisible] = useState(false);

  // --- 1. Show/Hide Logic ---
  useEffect(() => {
    if (notification) {
      // Show the notification when data arrives
      setIsVisible(true);

      // 2. Auto-Dismiss after 5 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [notification]);

  if (!notification && !isVisible) return null;

  const message = notification?.message || {};
  const sender = notification?.sender || {};

  // Function to handle manual or automatic dismissal
  const handleDismiss = () => {
    setIsVisible(false);
    // Delay clearing Redux state until the animation finishes
    setTimeout(() => {
      dispatch(removeNotifications());
    }, 300); // Match this timeout to your CSS animation duration
  };

  return (
    <div
      className={`fixed top-5 right-5 z-50 w-80 md:w-96 p-4 glass-panel glow-border rounded-2xl transition-all duration-300 ease-out shadow-[0_0_30px_rgba(0,0,0,0.5)] 
                ${
                  isVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }
                border-l-[3px] border-l-cyan-400`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <img
            src={notification.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
            alt={sender || "User"}
            className="h-12 w-12 rounded-full object-cover border border-white/10"
          />

          {/* Sender Info */}
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-bold text-gray-100 truncate text-base">
              {sender || "New User"}
            </p>
            <span className="text-cyan-400/90 text-[13px] font-medium tracking-wide">
              New Message
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 transition-colors duration-150 rounded-full ml-4 shrink-0 -mt-1 -mr-1"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Content */}
      <div className="mt-3 pl-[64px] text-gray-400 text-sm overflow-hidden whitespace-nowrap overflow-ellipsis">
        {message.text ? decodeMessage(message.text) : "Sent a new message."}
      </div>
    </div>
  );
};

export default Notification;
