import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Image, X, Sparkles, Send } from 'lucide-react';
import axios from 'axios';
import { baseUrl } from '../utils/constants';
import { addProfilePost } from '../store/profilePostsSlice';

const CreatePost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const user = useSelector(store => store.user);
    const dispatch = useDispatch();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('Image size should be less than 5MB');
                return;
            }
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) return;

        setIsSubmitting(true);
        setError('');

        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image);
        }

        try {
            const res = await axios.post(`${baseUrl}/api/posts/post`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            dispatch(addPost(res.data.post));

            // Allow parent component to react (e.g. closing a modal)
            if (onPostCreated) {
                onPostCreated(res.data.post);
            }

            // Reset form
            setContent('');
            removeImage();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-panel glow-border p-4 sm:p-5 rounded-2xl sm:rounded-3xl mb-8 animate-in mt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Avatar */}
                <div className="hidden sm:block w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10">
                    <img
                        src={user?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-1 min-w-0">
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full bg-transparent text-gray-100 placeholder:text-gray-500 text-base sm:text-lg resize-none outline-none custom-scrollbar pb-2"
                            rows={content.split('\n').length > 2 ? Math.min(content.split('\n').length, 5) : 3}
                            disabled={isSubmitting}
                        />

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative mt-3 mb-4 rounded-2xl overflow-hidden border border-white/10 group">
                                <img
                                    src={imagePreview}
                                    alt="Upload preview"
                                    className="max-h-[300px] w-auto mx-auto object-contain bg-black/40"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-400 text-sm mb-3 px-2 py-1 bg-red-400/10 rounded-lg inline-block">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between border-t border-white/10 pt-3 mt-2">
                            {/* Actions Left */}
                            <div className="flex gap-2">
                                <label className="btn btn-ghost btn-sm btn-circle text-cyan-400 hover:bg-cyan-400/10 cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleImageChange}
                                        ref={fileInputRef}
                                        disabled={isSubmitting}
                                    />
                                    <Image className="w-5 h-5" />
                                </label>
                                <button type="button" className="btn btn-ghost btn-sm btn-circle text-violet-400 hover:bg-violet-400/10" disabled>
                                    <Sparkles className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Actions Right */}
                            <button
                                type="submit"
                                disabled={isSubmitting || (!content.trim() && !image)}
                                className="btn-electric btn-sm px-6 rounded-xl flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <span className="loading loading-spinner w-4 h-4"></span>
                                ) : (
                                    <>
                                        <span>Post</span>
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
