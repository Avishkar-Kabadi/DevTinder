import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { Body } from "./components";
import CompleteProfile from "./components/CompleteProfile";
import Login from "./components/Login";
import SignUp from "./components/SignUp";

function App() {
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
