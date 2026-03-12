import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addUser } from "../../store/userSlice";
import { baseUrl } from "../../utils/constants";
// Removed Globe import as it's no longer used
import Icon from "../../assets/Icon.png";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please enter both email/username and password.");
      return;
    }

    setLoading(true);
    try {
      setError(null);
      const res = await axios.post(
        baseUrl + "/auth/login",
        { identifier, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      dispatch(addUser(res.data.user));
      navigate("/");
      setIdentifier("");
      setPassword("");
    } catch (error) {
      setError(error?.response?.data?.message || "Invalid credentials or something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200/50 px-4 py-8 relative overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="card bg-base-100/90 backdrop-blur-xl w-full max-w-md shadow-2xl border border-white/10 z-10 animate-in zoom-in-95 duration-500 rounded-3xl">
        <div className="card-body p-8 sm:p-10">

          <div className="flex flex-col items-center mb-6">
            {/* Replaced Globe with Icon Image */}
            <div className="bg-primary/5 p-2 rounded-full mb-4 w-20 h-20 flex items-center justify-center overflow-hidden">
              <img
                src={Icon}
                alt="App Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="card-title text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-base-content/60 text-sm mt-2 text-center">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-gray-200">Email or Username</span>
              </label>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                type="text"
                placeholder="jane@example.com or @username"
                className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12"
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1 justify-between">
                <span className="label-text font-semibold text-gray-200">Password</span>
                <span className="label-text-alt text-cyan-400 cursor-pointer hover:underline">Forgot?</span>
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-xl mt-2 animate-in fade-in">
                <p className="text-error text-sm text-center font-medium">{error}</p>
              </div>
            )}

            <div className="card-actions mt-6">
              <button
                type="submit"
                className="btn-electric w-full rounded-xl text-base h-12 transition-transform hover:scale-[1.02] flex justify-center items-center"
                disabled={loading}
              >
                {loading ? <span className="loading loading-spinner text-white"></span> : "Sign In"}
              </button>
            </div>
          </form>

          <div className="divider before:bg-white/10 after:bg-white/10 text-gray-500 text-sm mt-8">Or</div>

          <p className="text-center text-sm mt-2 text-gray-400">
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline cursor-pointer transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;