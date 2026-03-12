import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { baseUrl } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { addConnections, removeConnection } from "../../store/connectionSlice";
import { MessageCircle, UserMinus, RefreshCw } from "lucide-react";

const Connections = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchConnections = async (isRefetch = false) => {
    if (isRefetch) setIsRefreshing(true);
    try {
      const res = await axios.get(baseUrl + "/api/connections", { withCredentials: true });
      dispatch(addConnections(res.data.connections));
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  };

  const connections = useSelector((store) => store.connections);

  const handleRemoveConnection = async (id) => {
    dispatch(removeConnection(id));
    try {
      await axios.post(baseUrl + `/api/remove-connection/${id}`, {}, { withCredentials: true });
    } catch (error) {
      console.log(error);
      fetchConnections();
    }
  };

  const handleConversation = async (connection) => {
    try {
      const res = await axios.get(baseUrl + `/api/chat/conversation/${connection._id}`, { withCredentials: true });
      const conversationId = res.data.data._id;
      navigate(`/chat/${conversationId}`, {
        state: {
          OtherUserphotoUrl: connection.photoUrl,
          OtherUserfirstName: connection.firstName,
          OtherUserlastName: connection.lastName,
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (!connections || initialLoading) return (
    <div className="flex justify-center mt-20">
      <span className="loading loading-spinner loading-lg text-cyan-400"></span>
    </div>
  );

  if (connections.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">No Connections Yet</h2>
        <p className="text-base-content/60 max-w-sm">
          Start connecting with others to build your circle.
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-100">
          Connections <span className="text-gray-500 font-medium text-lg ml-2">({connections.length})</span>
        </h1>
        <button onClick={() => fetchConnections(true)} disabled={isRefreshing} className="btn btn-sm btn-ghost text-gray-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {connections.map((connection) => {
          const { _id, firstName, lastName, photoUrl, about, username } = connection;
          return (
            <div key={_id} className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/30 transition-all group">
              <div
                className="flex items-center gap-4 flex-1 min-w-0 w-full cursor-pointer"
                onClick={() => navigate(`/profile/${_id}`, { state: { user: connection } })}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent shrink-0 group-hover:border-cyan-400 transition-colors">
                  <img src={photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col truncate flex-1">
                  <h2 className="text-base font-semibold truncate group-hover:text-cyan-400 text-gray-100 transition-colors">{firstName} {lastName}</h2>
                  <p className="text-xs text-gray-500 truncate">@{username || firstName.toLowerCase()}</p>
                  <p className="text-sm text-gray-400 truncate mt-0.5">{about || "No bio available"}</p>
                </div>
              </div>

              <div className="flex flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0 items-center justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                <button
                  onClick={() => handleConversation(connection)}
                  className="btn btn-sm text-white bg-white/10 hover:bg-white/20 border-none rounded-xl flex-1 sm:flex-none gap-2 font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Message</span>
                </button>
                <button
                  onClick={() => handleRemoveConnection(_id)}
                  className="btn-ghost-loom h-8 min-h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex-1 sm:flex-none"
                  title="Remove Connection"
                >
                  <UserMinus className="w-4 h-4" />
                  <span className="sm:hidden">Remove</span>
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
