import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../../store/userSlice";
import { baseUrl } from "../../utils/constants";
import { checkValidData } from "../../utils/validate";
import { Link } from "react-router-dom";
// Updated Import
import Icon from "../../assets/Icon.png";

const SignUp = () => {
  const [formData, setFormData] = useState({ firstName: "", lastName: "", username: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [showOtpView, setShowOtpView] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setError(null);
    const { email, password, firstName, lastName, username } = formData;
    const validationMessage = checkValidData(email, password, firstName, lastName);
    if (!username) return setError("Username is required.");
    if (validationMessage) return setError(validationMessage);

    setLoading(true);
    try {
      await axios.post(`${baseUrl}/auth/register`, formData, { withCredentials: true });
      setShowOtpView(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/auth/verify-otp`, { email: formData.email, otp }, { withCredentials: true });
      dispatch(addUser(res.data.user));
      if (res.data.user?.isProfileCompleted) {
        navigate("/");
      } else {
        navigate("/complete-profile");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200/50 px-4 py-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      {showOtpView ? (
        <VerifyOTPForm otp={otp} setOtp={setOtp} handleVerify={handleVerifyOtp} error={error} loading={loading} />
      ) : (
        <SignUpForm formData={formData} setFormData={setFormData} handleSubmit={handleSignUp} error={error} loading={loading} />
      )}
    </div>
  );
};

const SignUpForm = ({ formData, setFormData, handleSubmit, error, loading }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="card bg-base-100/90 backdrop-blur-xl w-full max-w-md shadow-2xl border border-white/10 z-10 animate-in zoom-in-95 duration-500 rounded-3xl">
      <div className="card-body p-8 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          {/* Replaced Globe with App Icon */}
          <div className="bg-primary/5 p-2 rounded-full mb-4 w-20 h-20 flex items-center justify-center overflow-hidden">
            <img
              src={Icon}
              alt="App Icon"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="card-title text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Create an Account
          </h2>
          <p className="text-base-content/60 text-sm mt-2 text-center">Connect with the world today.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="form-control">
            <label className="label py-1"><span className="label-text font-semibold text-gray-200">Username</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-cyan-400 font-semibold">@</span>
              <input name="username" type="text" value={formData.username} onChange={handleChange} placeholder="johndoe" className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12 pl-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-gray-200">First Name</span></label>
              <input name="firstName" type="text" value={formData.firstName} onChange={handleChange} placeholder="John" className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12" />
            </div>
            <div className="form-control">
              <label className="label py-1"><span className="label-text font-semibold text-gray-200">Last Name</span></label>
              <input name="lastName" type="text" value={formData.lastName} onChange={handleChange} placeholder="Doe" className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12" />
            </div>
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text font-semibold text-gray-200">Email</span></label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12" />
          </div>

          <div className="form-control">
            <label className="label py-1"><span className="label-text font-semibold text-gray-200">Password</span></label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className="input input-bordered focus:border-cyan-500 bg-[#111111] text-gray-100 w-full rounded-xl transition-all h-12" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl mt-4 animate-in fade-in">
            <p className="text-error text-sm text-center font-medium">{error}</p>
          </div>
        )}

        <button className="btn-electric w-full mt-6 rounded-xl text-base h-12 transition-transform hover:scale-[1.02] flex justify-center items-center" onClick={handleSubmit} disabled={loading}>
          {loading ? <span className="loading loading-spinner text-white"></span> : "Sign Up"}
        </button>

        <div className="divider before:bg-white/10 after:bg-white/10 text-gray-500 text-sm mt-8">Or</div>

        <p className="text-center text-sm mt-2 text-gray-400">
          Already have an account? <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const VerifyOTPForm = ({ otp, setOtp, handleVerify, error, loading }) => {
  return (
    <div className="card bg-base-100/90 backdrop-blur-xl w-full max-w-md shadow-2xl border border-white/10 z-10 animate-in slide-in-from-right-8 duration-500 rounded-3xl">
      <div className="card-body p-8 sm:p-10 text-center">
        {/* Consistent Styling for OTP icon view as well */}
        <div className="bg-secondary/10 p-4 rounded-full mx-auto w-20 h-20 flex items-center justify-center mb-6">
          <img
            src={Icon}
            alt="App Icon"
            className="w-full h-full object-contain grayscale opacity-70"
          />
        </div>

        <h2 className="card-title justify-center text-3xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-2">Verify Email</h2>
        <p className="text-sm text-base-content/70 max-w-[250px] mx-auto">Enter the 6-digit code sent to your email to confirm your account.</p>

        <div className="form-control mt-8">
          <input type="text" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" className="input input-bordered focus:input-secondary bg-base-200/50 w-full text-center text-3xl tracking-[0.5em] font-mono rounded-2xl transition-all h-16 py-2" />
        </div>

        {error && (
          <div className="p-3 bg-error/10 border border-error/20 rounded-xl mt-4 animate-in fade-in">
            <p className="text-error text-sm text-center font-medium">{error}</p>
          </div>
        )}

        <button className="btn btn-secondary w-full mt-8 rounded-2xl text-base h-12 transition-transform hover:scale-[1.02]" onClick={handleVerify} disabled={otp.length !== 6 || loading}>
          {loading ? <span className="loading loading-spinner text-white"></span> : "Verify & Register"}
        </button>

        <p className="text-center text-xs mt-6 text-base-content/50">
          Didn't receive a code? <button className="text-secondary font-semibold hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;