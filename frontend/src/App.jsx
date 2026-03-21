import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { WifiOff, RefreshCw } from 'lucide-react';

import { Suspense, lazy } from 'react';

const Body = lazy(() => import("./pages/Body"));

// Auth pages (public / no login required)
const Login = lazy(() => import("./pages/auth/Login"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const CompleteProfile = lazy(() => import("./pages/auth/CompleteProfile"));

// Global app pages (visible to all logged-in users)
const Feed = lazy(() => import("./pages/Feed"));
const Chats = lazy(() => import("./pages/Chats"));
const CallHistory = lazy(() => import("./pages/CallHistory"));
const Message = lazy(() => import("./pages/Message"));
const Search = lazy(() => import("./pages/Search"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

// Profile pages (show current user's own data)
const Connections = lazy(() => import("./pages/profile/Connections"));
const Requests = lazy(() => import("./pages/profile/Requests"));
const Notifications = lazy(() => import("./pages/profile/Notifications"));
const EditProfile = lazy(() => import("./pages/profile/EditProfile"));
const CreatePost = lazy(() => import("./pages/profile/CreatePost"));
const UserPostsDetail = lazy(() => import("./pages/profile/UserPostsDetail"));


import CallComponent from "./components/CallComponent";

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

        // Native Notification Requests
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

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
    <>
      <CallComponent />
      <BrowserRouter basename="/">
        <Suspense fallback={
        <div className="flex items-center justify-center h-screen bg-base-100">
          <span className="loading loading-spinner text-primary loading-lg"></span>
        </div>
      }>
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
            <Route path="calls" element={<CallHistory />} />
            <Route path="chat/:conversationId" element={<Message />} />
            <Route path="create-post" element={<CreatePost />} />
            <Route path="posts/:userId/:postId" element={<UserPostsDetail />} />
            <Route path="search" element={<Search />} />
            <Route path="profile/:id" element={<UserProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  );
}

export default App;
