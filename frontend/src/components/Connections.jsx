import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { baseUrl } from "../utils/constants";

import { addConnections,removeConnection } from "../store/connectionSlice";

const Connections = () => {
  const dispatch = useDispatch();
  const fetchConnections = async () => {
    try {
      const res = await axios.get(baseUrl + "/api/connections", {
        withCredentials: true,
      });

      console.log(res.data.connections);
      dispatch(addConnections(res.data.connections));
    } catch (error) {
      console.log(error);
    }
  };

  const connections = useSelector((store) => store.connections);

  const handleRemoveConnection = async (id) => {
    try {
      const res = await axios.post(
        baseUrl + `/api/remove-connection/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(removeConnection(id));

      // fetchConnections();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!connections) fetchConnections();
  }, [connections]);

  if (!connections) return;

  if (connections.length === 0)
    return (
      <div className="flex justify-center my-10">
        <h1 className="text-xl font-bold">No Connections Found</h1>
      </div>
    );
  return (
    <div className="w-full flex flex-col bg-base-200 min-h-screen items-center p-6">
      <h1 className="text-3xl font-bold mb-8">
        Connections ({connections.length})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 w-full max-w-5xl">
        {connections.map((connection) => {
          const { firstName, lastName, photoUrl, about } = connection;

          return (
            <div
              key={connection._id}
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
                <button className="bg-primary text-white px-5 py-2 rounded-2xl hover:bg-primary-focus transition">
                  Message
                </button>
                <button
                  onClick={() => handleRemoveConnection(connection?._id)}
                  className="bg-secondary text-white px-5 py-2 rounded-2xl hover:bg-secondary-focus transition"
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

export default Connections;
