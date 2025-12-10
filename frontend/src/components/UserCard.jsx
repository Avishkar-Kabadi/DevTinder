import axios from "axios";
import { baseUrl } from "../utils/constants";

const UserCard = ({ user }) => {
  const cleanSkills =
    user?.skills?.map((skill) => skill.replace(/^"|"$/g, "")) || [];

  const handleSentRequest = async (id) => {
    console.log("Button is clicked");

    try {
      const res = await axios.post(
        baseUrl + `/api/send-request/${id}`,
        {},
        {
          withCredentials: true,
        }
      );

      console.log(res.data.message);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  return (
    <div className="card z-auto bg-base-200 w-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl border border-base-300">
      <figure className="px-4 pt-4">
        <img
          className="h-96 w-full object-cover rounded-xl"
          src={user?.photoUrl}
          alt={user?.firstName}
        />
      </figure>

      <div className="card-body space-y-1">
        <h2 className="card-title text-xl font-bold">
          {user?.firstName} {user?.lastName}
        </h2>

        <p className="text-base-content/70 text-lg">
          {user?.age} {user?.gender}
        </p>

        <p className="text-base-content/80 text-xs">{user?.about}</p>

        {cleanSkills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {cleanSkills.map((skill, index) => (
              <span
                key={index}
                className="badge badge-primary badge-outline px-3 py-2 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions justify-center mt-4">
          <button className="btn btn-outline w-32 rounded-full">Ignore</button>
          <button
            onClick={() => handleSentRequest(user?._id)}
            className="btn btn-primary w-32 rounded-full text-white"
          >
            Interested
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
