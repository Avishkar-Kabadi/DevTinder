import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Body from "./components/Body";
import CompleteProfile from "./components/CompleteProfile";
import Feed from "./components/Feed";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import EditProfile from "./components/EditProfile";
import Connections from "./components/Connections";
import Requests from "./components/Requests";

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Body />}>
          {/* Default/home route inside Body */}
          <Route index element={<Feed />} />

          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="complete-profile" element={<CompleteProfile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="requests" element={<Requests />} />
          <Route path="connections" element={<Connections />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
