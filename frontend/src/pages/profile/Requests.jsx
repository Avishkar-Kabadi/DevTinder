import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { baseUrl } from "../../utils/constants";
import { addRequests, removeReqest } from "../../store/requestSlice";
import { Check, X, RefreshCw, Loader2 } from "lucide-react";

const Requests = () => {
  const dispatch = useDispatch();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchRequests = React.useCallback(async (isRefetch = false) => {
    if (isRefetch) setIsRefreshing(true);
    try {
      const res = await axios.get(baseUrl + "/api/requests", { withCredentials: true });
      dispatch(addRequests(res.data.requests));
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
      setInitialLoading(false);
    }
  }, [dispatch]);

  const requests = useSelector((store) => store.requests);

  const handleRequest = async (status, id) => {
    dispatch(removeReqest(id));
    try {
      await axios.post(baseUrl + `/api/${status}-request/${id}`, {}, { withCredentials: true });
    } catch (error) {
      console.log(error);
      fetchRequests();
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  if (!requests || initialLoading) return (
    <div className="flex justify-center mt-20">
      <span className="loading loading-spinner loading-lg text-cyan-400"></span>
    </div>
  );

  if (requests.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-2xl font-bold mb-2">No Requests Found</h2>
        <p className="text-base-content/60 max-w-sm">
          You don't have any pending connection requests right now.
        </p>
      </div>
    );

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-100">
          Requests <span className="text-gray-500 font-medium text-lg ml-2">({requests.length})</span>
        </h1>
        <button onClick={() => fetchRequests(true)} disabled={isRefreshing} className="btn btn-sm btn-ghost text-gray-400 hover:text-white">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {requests.map((request) => {
          const { _id, firstName, lastName, photoUrl, about, username } = request;
          return (
            <div key={_id} className="glass-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-cyan-500/30 transition-all group">
              <div className="flex items-center gap-4 flex-1 min-w-0 w-full cursor-pointer">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent shrink-0 group-hover:border-cyan-400 transition-colors">
                  <img src={photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col truncate flex-1">
                  <h2 className="text-base font-semibold truncate group-hover:text-cyan-400 text-gray-100 transition-colors">{firstName} {lastName}</h2>
                  <p className="text-xs text-gray-500 truncate">@{username || firstName.toLowerCase()}</p>
                  <p className="text-sm text-gray-400 truncate mt-0.5">{about || "No bio available"}</p>
                </div>
              </div>

              <div className="flex flex-row gap-2 w-full sm:w-auto mt-3 sm:mt-0 items-center justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                <button onClick={() => handleRequest("accept", _id)} className="btn btn-sm bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-none rounded-xl flex-1 sm:flex-none gap-2 font-medium">
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Accept</span>
                </button>
                <button onClick={() => handleRequest("decline", _id)} className="btn-ghost-dev h-8 min-h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300 flex-1 sm:flex-none border border-red-500/20" title="Decline Request">
                  <X className="w-4 h-4" />
                  <span className="sm:hidden">Decline</span>
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
