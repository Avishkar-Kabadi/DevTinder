import { useState, useRef } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { baseUrl } from '../../utils/constants';
import { ImagePlus, X, Send, Type, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
    const [caption, setCaption] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [tab, setTab] = useState("text"); // "text" | "photo"
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const user = useSelector(store => store.user);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
    };

    const handleSubmit = async () => {
        if (!caption.trim() && !image) {
            setError("Please write a caption or upload a photo.");
            return;
        }
        setError("");
        setLoading(true);
        const formData = new FormData();
        if (image) formData.append("image", image);
        formData.append("caption", caption);

        try {
            await axios.post(`${baseUrl}/api/posts/post`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            setCaption("");
            setImage(null);
            setPreview(null);
            setSuccess(true);
            setTimeout(() => navigate('/'), 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create post. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const charLimit = 280;
    const remaining = charLimit - caption.length;

    return (
        <div className="w-full max-w-xl mx-auto py-4 px-2 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <img
                    src={user?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div>
                    <p className="font-semibold text-sm text-gray-100">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">@{user?.username || user?.firstName?.toLowerCase()}</p>
                </div>
            </div>

            {/* Tab Toggle */}
            <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl">
                <button
                    onClick={() => setTab("text")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "text" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
                >
                    <Type className="w-4 h-4" /> Text Post
                </button>
                <button
                    onClick={() => setTab("photo")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "photo" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-gray-300"}`}
                >
                    <ImageIcon className="w-4 h-4" /> Photo Post
                </button>
            </div>

            {/* Photo Upload (photo tab or if image is already picked) */}
            {(tab === "photo" || image) && (
                <div className="mb-4">
                    {!preview ? (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="w-full aspect-video bg-white/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-white/10 hover:border-cyan-500/40 hover:bg-white/8 transition-all group"
                        >
                            <ImagePlus className="w-10 h-10 text-gray-500 mb-2 group-hover:text-cyan-400 transition-colors" />
                            <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">Click to upload a photo</span>
                            <span className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP up to 10MB</span>
                        </div>
                    ) : (
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 p-1.5 rounded-full text-white transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                </div>
            )}

            {/* Caption */}
            <div className="relative mb-2">
                <textarea
                    className="w-full bg-transparent text-gray-100 placeholder-gray-600 text-base resize-none focus:outline-none min-h-[120px] leading-relaxed"
                    placeholder={tab === "photo" ? "Add a caption..." : "What's on your mind? Share your thoughts, updates, or ideas..."}
                    maxLength={charLimit}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    autoFocus
                />
                <span className={`absolute bottom-2 right-0 text-xs ${remaining < 20 ? 'text-red-400' : 'text-gray-600'}`}>
                    {remaining}
                </span>
            </div>

            <div className="border-t border-white/5 my-4" />

            {/* Error */}
            {error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="mb-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
                    <span>✓</span> Post created! Taking you home...
                </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-between gap-3">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-ghost btn-sm text-gray-500 hover:text-cyan-400 gap-2"
                >
                    <ImagePlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Photo</span>
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                <button
                    onClick={handleSubmit}
                    disabled={loading || success || (!caption.trim() && !image)}
                    className="btn bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-none hover:opacity-90 transition-opacity gap-2 rounded-xl px-6 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                        <><Send className="w-4 h-4" /> Post</>
                    )}
                </button>
            </div>
        </div>
    );
}
