import axios from "axios";
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCallHistory } from "../store/chatSlice";
import { baseUrl } from "../utils/constants";

const formatDuration = (secs) => {
    if (!secs) return '0s';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
};

export default function CallHistory() {
  const [loading, setLoading] = useState(false);
  const user = useSelector((store) => store.user);
  const callHistory = useSelector((store) => store.chat?.callHistory) || [];
  const dispatch = useDispatch();

  const fetchCalls = React.useCallback(async () => {
    if (callHistory.length === 0) setLoading(true);
    try {
        const res = await axios.get(baseUrl + "/api/chat/calls", { withCredentials: true });
        const normalized = res.data.data.map(call => {
            const isCaller = call.caller._id === user._id;
            const otherUser = isCaller ? call.receiver : call.caller;
            return {
                _id: call._id,
                otherUserId: otherUser._id,
                otherUserName: `${otherUser.firstName} ${otherUser.lastName}`,
                otherUserPhoto: otherUser.photoUrl,
                type: call.type,
                startTime: call.startedAt,
                durationSecs: call.duration,
                status: call.status,
                isOutgoing: isCaller
            };
        });
        dispatch(setCallHistory(normalized));
    } catch(err) {
        console.error("Error fetching call history", err);
    } finally {
        setLoading(false);
    }
  }, [callHistory.length, dispatch, user._id]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="sticky top-0 bg-base-100/80 backdrop-blur-md z-10 px-4 pt-4 md:pt-6 border-b border-base-200 mb-2">
        <h2 className="text-2xl font-bold mb-4">Call History</h2>
        
        {/* Search Bar */}
        <div className="mt-2 relative hidden sm:block mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-base-content/40" />
            </div>
            <input 
                type="text" 
                className="input input-sm border-none bg-base-200 w-full pl-9 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20" 
                placeholder="Search calls..." 
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 md:px-0">
        <div className="flex flex-col gap-1 sm:gap-2">
            
            {loading ? (
                 <div className="flex justify-center items-center h-32">
                    <span className="loading loading-spinner text-primary loading-md"></span>
                 </div>
            ) : callHistory.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-[50vh] px-4 opacity-70">
                    <div className="bg-base-200 p-6 rounded-full mb-4">
                        <Phone className="w-10 h-10 text-base-content/50" />
                    </div>
                    <p className="text-lg font-medium">No calls yet</p>
                    <p className="text-sm text-base-content/60 mt-1">Make secure Voice or Video calls to your connections</p>
                </div>
            ) : (
                callHistory.map((call, index) => (
                    <div key={call._id || index} className="flex items-center gap-4 p-3 md:p-4 rounded-2xl hover:bg-base-200 transition-colors">
                        <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden border border-base-200">
                            <img src={call.otherUserPhoto || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="caller" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <h4 className={`text-base font-semibold truncate ${call.status === 'missed' ? 'text-error' : ''}`}>
                                {call.otherUserName}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-base-content/60">
                                {call.isOutgoing ? (
                                    <PhoneOutgoing className="w-3.5 h-3.5" />
                                ) : call.status === 'missed' ? (
                                    <PhoneMissed className="w-3.5 h-3.5 text-error" />
                                ) : (
                                    <PhoneIncoming className="w-3.5 h-3.5" />
                                )}
                                <span className="truncate">{call.type === 'video' ? 'Video' : 'Audio'} • {timeAgo(call.startTime)} {call.durationSecs > 0 ? `• ${formatDuration(call.durationSecs)}` : ''}</span>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-circle btn-sm text-primary hover:bg-primary/10">
                            {call.type === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                        </button>
                    </div>
                ))
            )}

        </div>
      </div>
    </div>
  );
}
