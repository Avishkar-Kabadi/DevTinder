import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { WifiOff, RefreshCw } from 'lucide-react';

import Body from "./pages/Body";

// Auth pages (public / no login required)
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import CompleteProfile from "./pages/auth/CompleteProfile";

// Global app pages (visible to all logged-in users)
import Feed from "./pages/Feed";
import Chats from "./pages/Chats";
import Message from "./pages/Message";
import Search from "./pages/Search";
import UserProfile from "./pages/UserProfile";


// Profile pages (show current user's own data)
import Connections from "./pages/profile/Connections";
import Requests from "./pages/profile/Requests";
import Notifications from "./pages/profile/Notifications";
import EditProfile from "./pages/profile/EditProfile";
import CreatePost from "./pages/profile/CreatePost";
import UserPostsDetail from "./pages/profile/UserPostsDetail";


import { addUser } from "./store/userSlice";
import { baseUrl } from "./utils/constants";
import useOnline from "./utils/isOnline";
import { connectSocket, socket } from "./utils/socket";
import { initGlobalSocketListeners } from "./utils/socketListener";




function App() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

  const isOnline = useOnline();

  useEffect(() => {
    const initAuthAndSocket = async () => {
      try {
        let currentUser = user;

        if (!currentUser || !currentUser._id) {
          const res = await axios.get(`${baseUrl}/auth/user-profile`, {
            withCredentials: true,
          });

          currentUser = res.data.user;
          dispatch(addUser(currentUser));
        }

        connectSocket(currentUser._id);

        socket.once("connect", () => {
          socket.emit("joinUser", currentUser._id);
        });

        initGlobalSocketListeners();
      } catch (error) {
        console.log("User not authenticated, socket not connected");
      } finally {
        setLoading(false);
      }
    };

    initAuthAndSocket();
  }, [user, dispatch]);

  const handleRetry = () => {
    window.location.reload();
  }

  if (!isOnline) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 transition-all">

          {/* Icon with pulsed animation */}
          <div className="relative mb-6 flex justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-red-100 dark:bg-red-900/20 h-16 w-16 m-auto opacity-75"></div>
            <div className="relative bg-red-50 dark:bg-red-900/30 p-4 rounded-full">
              <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Connection Lost
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            It looks like you're currently offline. Please check your internet connection and try again.
          </p>

          {/* Action Button */}
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-indigo-200 dark:shadow-none w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <BrowserRouter basename="/">
      <Routes>
        {/* Public */}
        <Route
          path="login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="signup"
          element={
            !user ? <SignUp /> : <Navigate to="/complete-profile" replace />
          }
        />

        {/* Protected */}
        <Route
          path="/"
          element={user ? <Body /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Feed />} />
          {user?.isProfileCompleted ? null : (
            <Route path="complete-profile" element={<CompleteProfile />} />
          )}
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="requests" element={<Requests />} />
          <Route path="connections" element={<Connections />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="chats" element={<Chats />} />
          <Route path="chat/:conversationId" element={<Message />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="posts/:userId/:postId" element={<UserPostsDetail />} />
          <Route path="search" element={<Search />} />
          <Route path="profile/:id" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
