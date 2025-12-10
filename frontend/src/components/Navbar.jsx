import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { baseUrl } from "../utils/constants";

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store?.user) || null;

  const handleSubmit = async () => {
    try {
      await axios.post(baseUrl + `/auth/logout`, {}, { withCredentials: true });
      dispatch({ type: "auth/logout" });
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="navbar sticky   bg-base-300 shadow-sm">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          🧑‍💻 DevTinder
        </Link>
      </div>
      <div className="flex gap-2">
        {user && (
          <div className="dropdown mx-4 dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10  rounded-full">
                <img
                  alt="Tailwind CSS Navbar component"
                  src={
                    user?.photoUrl ||
                    ` https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp`
                  }
                />
              </div>
            </div>
            <ul
              tabIndex="-1"
              className="menu menu-sm dropdown-content bg-base-200 rounded-box z-10 mt-2 w-32 p-2 shadow"
            >
              <li>
                <Link to="/edit-profile" className="justify-between">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/connections">Connections</Link>
              </li>
              <li>
                <Link to="/requests">Requests</Link>
              </li>
              <li onClick={handleSubmit}>
                <Link to="/login">Logout</Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
