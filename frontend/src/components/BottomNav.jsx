import { Home, Users, MessageCircle, User, PlusCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const BottomNav = () => {
  const location = useLocation();
  const user = useSelector((store) => store?.user);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10 md:hidden pb-safe rounded-t-[2rem] rounded-b-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-16 px-4">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/") ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Home className={`w-6 h-6 transition-transform ${isActive("/") ? "scale-110" : ""}`} />
        </Link>
        <Link
          to="/connections"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/connections") ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <Users className={`w-6 h-6 transition-transform ${isActive("/connections") ? "scale-110" : ""}`} />
        </Link>
        <Link
          to="/create-post"
          className="flex flex-col items-center justify-center w-full h-full -mt-6"
        >
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all hover:-translate-y-1">
            <PlusCircle className="w-6 h-6" />
          </div>
        </Link>
        <Link
          to="/chats"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/chats") || location.pathname.startsWith("/chat/")
              ? "text-cyan-400"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <MessageCircle className={`w-6 h-6 transition-transform ${isActive("/chats") || location.pathname.startsWith("/chat/") ? "scale-110" : ""}`} />
        </Link>
        <Link
          to="/edit-profile"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/edit-profile") ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"
          }`}
        >
          <div className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
            isActive("/edit-profile") ? "border-cyan-400 scale-110" : "border-transparent"
          }`}>
            <img
              src={user?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
