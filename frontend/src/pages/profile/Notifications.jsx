import React, { useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setNotifications, markAllAsRead } from '../../store/notificationSlice';
import { baseUrl } from '../../utils/constants';
import { Heart, UserPlus, MessageCircle, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
};

const getNotificationDetails = (type) => {
    switch (type) {
        case 'request_received': return { icon: <UserPlus className="w-5 h-5 text-primary" />, text: "sent you a connection request." };
        case 'request_accepted': return { icon: <UserCheck className="w-5 h-5 text-success" />, text: "accepted your connection request." };
        case 'like': return { icon: <Heart className="w-5 h-5 text-error fill-error" />, text: "liked your post." };
        case 'comment': return { icon: <MessageCircle className="w-5 h-5 text-info fill-info" />, text: "commented on your post:" };
        default: return { icon: <MessageCircle className="w-5 h-5 text-base-content/50" />, text: "interacted with you." };
    }
};

export default function Notifications() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const notifications = useSelector(state => state.notifications);

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(baseUrl + "/api/notifications", { withCredentials: true });
            dispatch(setNotifications(res.data.notifications));
        } catch (error) {
            console.error("Fetch notifications failed", error);
        }
    };

    const markAsRead = async () => {
        try {
            await axios.post(baseUrl + "/api/notifications/mark-read", {}, { withCredentials: true });
            dispatch(markAllAsRead());
        } catch (error) {
            console.error("Mark read failed", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const timeoutId = setTimeout(() => {
            if (notifications?.some(n => !n.isRead)) {
                markAsRead();
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, []);

    if (!notifications) return <div className="p-8 text-center text-base-content/50">Loading notifications...</div>;

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
                <div className="w-20 h-20 bg-base-200 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-10 h-10 text-base-content/30" />
                </div>
                <h2 className="text-xl font-semibold mb-2">No Notifications Yet</h2>
                <p className="text-base-content/60 max-w-sm">When someone likes a post, sends a request, or comments, it will show up here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto w-full pb-20 md:pb-6">
            <div className="sticky top-0 bg-base-100/90 backdrop-blur-md z-10 p-4 border-b border-base-200">
                <h1 className="text-2xl font-bold">Notifications</h1>
            </div>

            <div className="flex flex-col">
                {notifications.map((notif) => {
                    const { icon, text } = getNotificationDetails(notif.type);
                    const isUnread = !notif.isRead;
                    return (
                        <div
                            key={notif._id}
                            onClick={() => { if (notif.sender?._id) navigate(`/profile/${notif.sender._id}`, { state: { user: notif.sender }}); }}
                            className={`flex gap-4 p-4 border-b border-base-200 cursor-pointer transition-colors duration-200 hover:bg-base-200/50 ${isUnread ? 'bg-primary/5' : ''}`}
                        >
                            <div className="relative shrink-0 w-12 h-12">
                                <img src={notif.sender?.photoUrl || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} className="w-full h-full rounded-full object-cover border border-base-300" alt="Avatar" />
                                <div className="absolute -bottom-1 -right-1 bg-base-100 p-0.5 rounded-full shadow-sm">{icon}</div>
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <p className="text-sm leading-snug">
                                    <span className="font-semibold text-base-content mr-1">{notif.sender?.firstName} {notif.sender?.lastName}</span>
                                    <span className="text-base-content/80">{text}</span>
                                    {notif.type === 'comment' && notif.content && (
                                        <span className="block mt-1 text-base-content/70 italic line-clamp-2 border-l-2 border-base-300 pl-2">"{notif.content}"</span>
                                    )}
                                </p>
                                <span className="text-xs text-base-content/50 mt-1">{timeAgo(notif.createdAt)}</span>
                            </div>

                            {isUnread && (
                                <div className="shrink-0 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
