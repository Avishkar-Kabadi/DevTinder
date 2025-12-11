import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRequests, removeReqest } from "../store/requestSlice";
import { baseUrl } from "../utils/constants";

const Requests = () => {
  const dispatch = useDispatch();
  const fetchRequests = async () => {
    try {
      const res = await axios.get(baseUrl + "/api/requests", {
        withCredentials: true,
      });
      dispatch(addRequests(res.data.requests));
    } catch (error) {
      console.log(error);
    }
  };

  const requests = useSelector((store) => store.requests);

  const handleRequest = async (status, id) => {
    try {
      const res = await axios.post(
        baseUrl + `/api/${status}-request/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(removeReqest(id));
      // fetchRequests();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!requests) fetchRequests();
  }, [requests]);

  if (!requests) return;

  if (requests.length === 0)
    return (
      <div className="flex justify-center my-10">
        <h1 className="text-xl font-bold">No connection requests Found</h1>
      </div>
    );
  return (
    <div className="w-full flex flex-col bg-base-200 min-h-screen items-center p-6">
      <h1 className="text-3xl font-bold mb-8">
        Connection Requests ({requests.length})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-5xl">
        {requests.map((request) => {
          const { firstName, lastName, photoUrl, about } = request;

          return (
            <div
              key={request._id}
              className="p-5 bg-base-300 rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div className="flex flex-col truncate">
                  <h2 className="text-lg font-semibold truncate">
                    {firstName} {lastName}
                  </h2>
                  <p className="text-sm opacity-70 line-clamp-2">
                    {about || "No bio available"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                <button
                  onClick={() => handleRequest("accept", request._id)}
                  className="btn btn-primary rounded-2xl hover:bg-primary-focus transition"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRequest("decline", request._id)}
                  className="btn btn-secondary rounded-2xl hover:bg-secondary-focus transition"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;
