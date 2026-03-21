import { Outlet, useLocation, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Notification from "../components/Notification";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import { useEffect } from "react";

const Body = () => {
  const notification = useSelector((store) => store.chat?.notifications);
  const user = useSelector((store) => store.user);
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    const mainContent = document.getElementById("main-scroll-area");
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (user && !user.isProfileCompleted && location.pathname !== "/complete-profile") {
    return <Navigate to="/complete-profile" replace />;
  }

  return (
    <div className="drawer lg:drawer-open bg-[#0a0a0a] min-h-screen text-gray-100 selection:bg-cyan-500/30 selection:text-cyan-100">
      <input id="mobile-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      
      {/* Main Content Area */}
      <div className="drawer-content flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Top Navbar */}
        <Navbar />

        {notification && (
          <div className="fixed top-16 right-4 z-50 md:top-4">
            <Notification />
          </div>
        )}

        {/* Scrollable Content */}
        <main 
          id="main-scroll-area"
          className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pb-20 md:pb-0"
        >
          <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 lg:py-8 min-h-full flex flex-col items-center">
             <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
      
      {/* Drawer Side (Sidebar for Mobile & Desktop) */}
      <div className="drawer-side z-50">
        <label htmlFor="mobile-sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <Sidebar />
      </div>
    </div>
  );
};

export default Body;