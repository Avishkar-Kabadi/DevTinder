import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Body from "./components/Body";
import Chats from "./components/Chats";
import CompleteProfile from "./components/CompleteProfile";
import Connections from "./components/Connections";
import EditProfile from "./components/EditProfile";
import Feed from "./components/Feed";
import Login from "./components/Login";
import Message from "./components/Message";
import Requests from "./components/Requests";
import SignUp from "./components/SignUp";

import { addUser } from "./store/userSlice";
import { baseUrl } from "./utils/constants";
import { connectSocket, socket } from "./utils/socket";
import { initGlobalSocketListeners } from "./utils/socketListener";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);

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
          <Route path="chats" element={<Chats />} />
          <Route path="chat/:conversationId" element={<Message />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
