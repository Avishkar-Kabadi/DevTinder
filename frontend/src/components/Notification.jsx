import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeNotifications } from "../store/chatSlice"; // Assuming you have this action

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
      // Use Tailwind/DaisyUI transition classes for smooth entrance/exit
      className={`fixed top-5 right-5 z-50 w-80 md:w-96 p-3 bg-base-100 shadow-2xl rounded-xl transition-all duration-300 ease-out 
                ${
                  isVisible
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }
                border-l-4 border-primary`} // Use border-primary for accent color
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <img
            src={notification.photoUrl || "https://via.placeholder.com/150"}
            alt={sender || "User"}
            className="h-10 w-10 rounded-full object-cover border border-base-content/10"
          />

          {/* Sender Info */}
          <div className="flex flex-col text-sm">
            <p className="font-bold text-base-content">
              {sender || "New User"}
            </p>
            <span className="text-primary text-xs font-medium">
              New Message
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="p-1 text-base-content/50 hover:text-base-content/80 transition-colors duration-150 rounded-full ml-4"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message Content */}
      <div className="mt-2 pl-[52px] text-base-content/80 text-sm overflow-hidden whitespace-nowrap overflow-ellipsis">
        {message.text}
      </div>
    </div>
  );
};

export default Notification;
