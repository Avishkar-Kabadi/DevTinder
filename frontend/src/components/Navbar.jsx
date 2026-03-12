import { Bell, Menu } from "lucide-react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Logo from "../assets/Loom.png";

const Navbar = () => {
  const user = useSelector((store) => store?.user) || null;
  const notifications = useSelector((store) => store?.notifications) || [];

  // If user is not logged in, don't show the mobile navbar
  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="navbar sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 md:hidden h-14 min-h-[56px] px-4 shadow-sm">
      <div className="flex-1 flex gap-2 items-center">
        {/* Mobile Hamburger Menu to Toggle Sidebar */}
        <label
          htmlFor="mobile-sidebar-drawer"
          className="btn btn-ghost btn-circle btn-sm hover:bg-white/5 cursor-pointer"
        >
          <Menu className="w-6 h-6 text-gray-400" />
        </label>

        {/* Brand Logo Link */}
        <Link to="/" className="flex items-center ml-1">
          <img
            src={Logo}
            alt="Loom Logo"
            className="h-8 w-auto object-contain brightness-110"
          />
        </Link>
      </div>

      <div className="flex-none gap-3">
        {/* Mobile Notifications Bell */}
        <Link
          to="/notifications"
          className="btn btn-ghost btn-circle btn-sm relative hover:bg-white/5"
        >
          <Bell className="w-5 h-5 text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Navbar;