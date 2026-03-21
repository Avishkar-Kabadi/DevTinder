import { Home, Users, UserPlus, MessageCircle, User, LogOut, Search, PlusCircle, Settings, Bell, Phone } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { baseUrl } from "../utils/constants";
import { disconnectSocket } from "../utils/socket";
import Logo from "../assets/Loom.png"; // Import your logo

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((store) => store?.user);
  const notifications = useSelector((store) => store?.notifications) || [];

  if (!user) return null;
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => {
    const drawer = document.getElementById("mobile-sidebar-drawer");
    if (drawer) drawer.checked = false;
  };

  const handleLogout = async () => {
    try {
      await axios.post(baseUrl + `/auth/logout`, {}, { withCredentials: true });
      dispatch({ type: "auth/logout" });
      disconnectSocket();
    } catch (error) {
      console.log(error);
    }
  };

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Search", path: "/search", icon: Search },
    { name: "Notifications", path: "/notifications", icon: Bell, badge: unreadCount },
    { name: "Messages", path: "/chats", icon: MessageCircle },
    { name: "Create Post", path: "/create-post", icon: PlusCircle },
    { name: "Connections", path: "/connections", icon: Users },
    { name: "Requests", path: "/requests", icon: UserPlus },
    { name: "Calls", path: "/calls", icon: Phone },
  ];

  return (
    <div className="flex flex-col w-[260px] min-h-screen h-full border-r border-white/5 bg-[#0a0a0a] p-4 shrink-0 overflow-y-auto custom-scrollbar">

      <Link to="/" onClick={closeSidebar} className="flex items-center px-4 py-8 mb-4 hover:opacity-80 transition-opacity">
        <img
          src={Logo}
          alt="Loom Logo"
          className="h-10 w-auto object-contain brightness-110"
        />
      </Link>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <label key={item.name} htmlFor="mobile-sidebar-drawer" className="cursor-pointer">
            <Link
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium relative group ${isActive(item.path) || (item.name === "Messages" && location.pathname.startsWith("/chat/"))
                ? "bg-cyan-500/10 text-cyan-400 font-semibold"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-100"
                }`}
            >
              <div className="relative">
                <item.icon className={`w-[22px] h-[22px] transition-colors ${isActive(item.path) ? "stroke-[2.5px] text-cyan-400" : "stroke-[2px] group-hover:text-gray-100"}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[15px]">{item.name}</span>
            </Link>
          </label>
        ))}

        {/* Settings Link */}
        {/* <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-1">
          <Link
            to="/edit-profile"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium group ${isActive("/edit-profile") ? "bg-cyan-500/10 text-cyan-400" : "text-gray-400 hover:bg-white/5 hover:text-gray-100"}`}
          >
            <Settings className="w-[22px] h-[22px] stroke-[2px] transition-colors" />
            <span className="text-[15px]">Settings</span>
          </Link>
        </div> */}
      </nav>

      <div className="mt-auto pt-4 flex flex-col gap-2">
        <Link to="/edit-profile" onClick={closeSidebar} className="flex items-center gap-3 px-3 py-3 rounded-xl bg-[#111111] border border-white/5 hover:bg-[#1a1a1a] transition-colors">
          <img
            src={user?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
            alt="Profile"
            className="w-9 h-9 rounded-full object-cover border border-white/10"
          />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-medium text-sm text-gray-100 truncate">{user.firstName} {user.lastName}</span>
            <span className="text-xs text-gray-500 truncate">@{user.username || user.firstName.toLowerCase()}</span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full text-left mt-2 group"
        >
          <LogOut className="w-[22px] h-[22px] stroke-[2px]" />
          <span className="text-[15px]">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;