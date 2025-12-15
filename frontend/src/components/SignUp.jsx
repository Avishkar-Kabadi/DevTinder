import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addUser } from "../store/userSlice";
import { baseUrl } from "../utils/constants";
import { checkValidData } from "../utils/validate";


const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isProfileCompleted = useSelector(
    (store) => store.user?.isProfileCompleted
  );

  const handleSubmit = async () => {
    try {
      const message = checkValidData(email, password, firstName, lastName);

      if (message) {
        setError(message);
        return null;
      }
      const res = await axios.post(
        baseUrl + "/auth/register",
        {
          firstName,
          lastName,
          email,
          password,
        },
        { withCredentials: true }
      );

      const { data } = res;
      dispatch(addUser(data.user));
      if (isProfileCompleted) {
        navigate("/");
      } else {
        navigate("/complete-profile");
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      setError(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-300 px-4">
      <div className="card bg-base-100 w-96 shadow-xl border border-base-300 hover:shadow-2xl transition-all duration-300">
        <div className="card-body">
          <h2 className="card-title justify-center text-2xl font-semibold">
            Signup
          </h2>

          <div className="mt-3 flex flex-col gap-5">
            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium mb-2">First Name</span>
              </div>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                type="text"
                placeholder="Enter first name"
                className="input input-bordered w-full"
              />
            </label>

            <label className="form-control">
              <div className="label">
                <span className="label-text font-medium mb-2">Last Name</span>
              </div>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                placeholder="Enter last name"
                className="input input-bordered w-full"
              />
            </label>

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
              Signup
            </button>
          </div>

          <p className="text-center text-sm mt-3 text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline cursor-pointer"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
