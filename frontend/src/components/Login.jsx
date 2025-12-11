import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addUser } from "../store/userSlice";
import { baseUrl } from "../utils/constants";
import { connectSocket } from "../utils/socket";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      const res = await axios.post(
        baseUrl + "/auth/login",
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const { data } = res;
      dispatch(addUser(data.user));
      connectSocket();
      navigate("/");
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-300 px-4">
      <div className="card bg-base-100 w-96 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-semibold">
            Login
          </h2>

          <div className="mt-6 flex flex-col gap-5">
            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium mb-2">Email</span>
              </div>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Enter email"
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium mb-2">Password</span>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Enter password"
                className="input input-bordered w-full"
              />
            </label>
          </div>

          {error && <p className="text-red-500">Error : {error}</p>}

          <div className="card-actions justify-center mt-6">
            <button className="btn btn-primary w-full" onClick={handleSubmit}>
              Login
            </button>
          </div>

          <p className="text-center text-sm mt-3 text-gray-500">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline cursor-pointer"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
