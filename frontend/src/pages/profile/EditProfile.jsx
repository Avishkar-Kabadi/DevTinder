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
        <div className="bg-base-100 rounded-3xl p-6 md:p-8 border border-base-200 shadow-xl">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-base-200">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <X className="w-6 h-6 cursor-pointer" onClick={() => setEditing(false)} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
              <img src={photoUrl} className="w-20 h-20 rounded-full object-cover border-2 border-primary" alt="Preview" />
              <label className="btn btn-primary btn-sm rounded-lg cursor-pointer">
                Change Photo
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="input input-bordered w-full" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
              <input className="input input-bordered w-full" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>

            <input className="input input-bordered w-full" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <textarea className="textarea textarea-bordered w-full h-32" placeholder="Bio" value={about} onChange={e => setAbout(e.target.value)} />

            <div className="grid grid-cols-2 gap-4">
              <input type="number" className="input input-bordered w-full" placeholder="Age" value={age} onChange={e => setAge(e.target.value)} />
              <select className="select select-bordered w-full" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <button type="button" onClick={() => setEditing(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" disabled={loading} className="btn btn-primary px-8">
                {loading ? "Saving..." : "Save Changes"}
              </button>
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
