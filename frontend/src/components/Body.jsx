import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import Notification from "./Notification";
import Spinner from "./Spinner";
import { useSelector } from "react-redux";

const Body = () => {
  const notification = useSelector((store) => store.chat?.notifications);
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {notification && <Notification />}
      {/* <Spinner /> */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Body;
