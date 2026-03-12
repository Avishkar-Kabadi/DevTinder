import axios from "axios";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { removeUserFeed } from "../store/feedSlice";
import { baseUrl } from "../utils/constants";
import { CheckCircle2, XCircle } from "lucide-react";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();
  const [loadingAction, setLoadingAction] = useState(null);


  const handleSubmit = async (status, id) => {
    // Optimistically update UI
    setLoadingAction(status);
    
    // We can dispatch remove right away or wait for the API
    // Let's delay dispatch slightly so the user sees the button feedback
    
    try {
      await axios.post(
        baseUrl + `/api/${status}/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      
      // Remove from feed after brief delay for UX
      setTimeout(() => {
         dispatch(removeUserFeed(id));
      }, 400);

    } catch (error) {
      console.log(error.response?.data);
      setLoadingAction(null); // Revert if failed
    }
  };

  return (
    <div className="bg-base-100 rounded-3xl p-5 shadow-sm border border-base-200 hover:shadow-md transition-all flex flex-col h-full group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-base-200 shrink-0 group-hover:border-primary/50 transition-colors">
            <img 
                src={user?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} 
                alt={user?.firstName}
                className="w-full h-full object-cover"
            />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
            <h2 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
                {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-base-content/60 truncate">
               {user?.age ? `${user.age} • ` : ''} {user?.gender || 'Not specified'}
            </p>
        </div>
      </div>
      
      <p className="text-sm text-base-content/80 line-clamp-3 mb-4 flex-1">
          {user?.about || "No bio provided."}
      </p>


      <div className="mt-auto border-t border-base-200 pt-4 flex gap-3">
        <button
          onClick={() => handleSubmit("mark-not-interested", user?._id)}
          disabled={loadingAction !== null}
          className={`btn flex-1 rounded-xl transition-all ${
              loadingAction === "mark-not-interested" 
              ? "btn-error bg-error/10 text-error border-none" 
              : "btn-ghost btn-outline border-base-300 hover:bg-error/10 hover:text-error hover:border-error/30"
          }`}
        >
            {loadingAction === "mark-not-interested" ? (
                <><XCircle className="w-4 h-4" /> Ignored</>
            ) : "Ignore"}
        </button>
        <button
          onClick={() => handleSubmit("send-request", user?._id)}
          disabled={loadingAction !== null}
          className={`btn flex-1 rounded-xl transition-all ${
            loadingAction === "send-request" 
            ? "btn-success bg-success/10 text-success border-none" 
            : "btn-primary"
          }`}
        >
             {loadingAction === "send-request" ? (
                <><CheckCircle2 className="w-4 h-4" /> Sent</>
            ) : "Connect"}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
