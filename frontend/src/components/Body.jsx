import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { addUser } from "../store/userSlice";
import { baseUrl } from "../utils/constants";
import Navbar from "./Navbar";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const res = await axios.get(baseUrl + "/auth/user-profile", {
        withCredentials: true,
      });
      dispatch(addUser(res.data.user));
      navigate("/");
    } catch (error) {
      console.log(error);
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default Body;
