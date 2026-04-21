import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addUser } from "../../store/userSlice";
import { setUserPosts } from "../../store/userPostsSlice";
import { addConnections } from "../../store/connectionSlice";
import { baseUrl } from "../../utils/constants";
import { Camera, Settings, X, Grid3X3, Heart, MessageCircle } from "lucide-react";

const EditProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const connections = useSelector((store) => store.connections);
  const posts = useSelector((store) => store?.userPosts);
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || "");
  const [about, setAbout] = useState(user?.about || "");
  const [age, setAge] = useState(user?.age || "");
  const [image, setImage] = useState(null);
  const [gender, setGender] = useState(user?.gender || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [photoUrl, SetpPhotoUrl] = useState(user?.photoUrl || "");

  useEffect(() => {
    let objectUrl;
    if (image) {
      objectUrl = URL.createObjectURL(image);
      SetpPhotoUrl(objectUrl);
    }
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/posts/my-posts`, { withCredentials: true });
        dispatch(setUserPosts(res.data.posts));
      } catch (err) {
        console.error("Error fetching posts:", err);
      }
    };

    if (!posts || posts.length === 0) fetchPosts();

    if (!connections) {
      axios.get(baseUrl + "/api/connections", { withCredentials: true })
        .then((res) => dispatch(addConnections(res.data.connections)))
        .catch((err) => console.log(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("about", about);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("username", username);
    formData.append("age", age);
    formData.append("gender", gender);

    try {
      const res = await axios.put(baseUrl + "/auth/update-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(addUser(res.data.user));
      setMessage("Profile Updated!");
      setEditing(false);
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
      setTimeout(() => setError(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {!editing ? (
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row gap-6 md:gap-16 items-center md:items-start mb-12 px-4">
            <div className="w-32 h-32 md:w-40 md:h-40 shrink-0">
              <img src={photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt="Profile" className="w-full h-full object-cover rounded-full border border-base-300 p-1" />
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start">
              <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                <h2 className="text-2xl font-light">{user?.username || firstName.toLowerCase()}</h2>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)} className="btn btn-sm bg-base-200 hover:bg-base-300 border-none rounded-lg px-4 normal-case">Edit Profile</button>
                  <Settings className="w-6 h-6 cursor-pointer text-base-content/80" onClick={() => setEditing(true)} />
                </div>
              </div>

              <div className="flex gap-10 mb-6 text-base">
                <div><span className="font-bold">{posts?.length || 0}</span> posts</div>
                <div className="cursor-pointer" onClick={() => navigate('/connections')}>
                  <span className="font-bold">{connections?.length || 0}</span> connections
                </div>
              </div>

              <div className="text-center md:text-left">
                <p className="font-bold">{firstName} {lastName}</p>
                <p className="text-sm text-base-content/60 mb-2">{age ? `${age} years` : ''} {gender ? `• ${gender}` : ''}</p>
                <p className="whitespace-pre-wrap max-w-md">{about || "No bio added yet."}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-base-300 flex justify-center mb-4">
            <div className="flex items-center gap-2 border-t border-base-content py-3 -mt-[1px] uppercase tracking-widest text-xs font-bold">
              <Grid3X3 className="w-4 h-4" />
              <span>Posts</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 md:gap-6">
            {posts && posts.map((post) => (
              <div key={post._id} className="relative aspect-square group cursor-pointer overflow-hidden bg-base-300" onClick={() => navigate(`/posts/${user._id}/${post._id}`)}>
                <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-6">
                  <div className="flex items-center gap-1 font-bold"><Heart className="w-5 h-5 fill-current" /> {post.likes?.length || 0}</div>
                  <div className="flex items-center gap-1 font-bold"><MessageCircle className="w-5 h-5 fill-current" /> {post.comments?.length || 0}</div>
                </div>
              </div>
            ))}
          </div>

          {(!posts || posts.length === 0) && (
            <div className="flex flex-col items-center py-20 text-base-content/30">
              <Camera className="w-12 h-12 mb-2" />
              <p className="text-xl font-light">No Posts Yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-base-100 max-w-2xl mx-auto md:rounded-3xl border-0 md:border border-base-200 md:shadow-xl min-h-[80vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-base-200 bg-base-100 z-10 md:rounded-t-3xl">
             <div className="flex items-center gap-4">
                <X className="w-7 h-7 cursor-pointer hover:bg-base-200 p-1 rounded-full transition-colors" onClick={() => setEditing(false)} />
                <h1 className="text-xl font-bold">Edit profile</h1>
             </div>
             <button type="submit" form="edit-profile-form" disabled={loading} className="text-blue-500 font-semibold text-lg hover:text-blue-400 disabled:opacity-50 transition-colors">
                {loading ? "Saving..." : "Done"}
             </button>
          </div>

          <form id="edit-profile-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto w-full pb-8">
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative group cursor-pointer">
                <img src={photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} className="w-24 h-24 rounded-full object-cover border border-base-300 group-hover:opacity-80 transition-opacity" alt="Preview" />
              </div>
              <label className="text-blue-500 font-semibold mt-4 cursor-pointer hover:text-blue-400 text-base">
                Change profile photo
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            {/* Inputs Section */}
            <div className="border-t border-base-200">
              <div className="flex items-center px-4 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                <label className="w-1/3 sm:w-1/4 font-semibold text-base">First name</label>
                <input className="w-2/3 sm:w-3/4 bg-transparent outline-none text-base placeholder:text-base-content/40" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="flex items-center px-4 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                <label className="w-1/3 sm:w-1/4 font-semibold text-base">Last name</label>
                <input className="w-2/3 sm:w-3/4 bg-transparent outline-none text-base placeholder:text-base-content/40" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <div className="flex items-center px-4 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                <label className="w-1/3 sm:w-1/4 font-semibold text-base">Username</label>
                <input className="w-2/3 sm:w-3/4 bg-transparent outline-none text-base placeholder:text-base-content/40" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
              <div className="flex items-start px-4 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                <label className="w-1/3 sm:w-1/4 font-semibold text-base py-1">Bio</label>
                <textarea className="w-2/3 sm:w-3/4 bg-transparent outline-none text-base placeholder:text-base-content/40 min-h-[80px] resize-none py-1" placeholder="Bio" value={about} onChange={e => setAbout(e.target.value)} />
              </div>
              <div className="flex items-center px-4 py-3 border-b border-base-200 hover:bg-base-200/50 transition-colors">
                <label className="w-1/3 sm:w-1/4 font-semibold text-base">Age</label>
                <input type="number" className="w-2/3 sm:w-3/4 bg-transparent outline-none text-base placeholder:text-base-content/40" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
              </div>
              <div className="flex items-center px-4 py-3 hover:bg-base-200/50 transition-colors">
                <label className="w-1/3 sm:w-1/4 font-semibold text-base">Gender</label>
                <select className="w-2/3 sm:w-3/4 bg-transparent outline-none text-base appearance-none cursor-pointer text-base-content rounded-none" value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="" disabled className="text-base-content/40">Select Gender</option>
                  <option value="Male" className="bg-base-100 font-sans text-base-content">Male</option>
                  <option value="Female" className="bg-base-100 font-sans text-base-content">Female</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="toast toast-end">
        {message && <div className="alert alert-success"><span>{message}</span></div>}
        {error && <div className="alert alert-error"><span>{error}</span></div>}
      </div>
    </div>
  );
};

export default EditProfile;
