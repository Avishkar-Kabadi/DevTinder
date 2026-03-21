import appStore from "../store/appStore";
import {
    setLastMessage,
    setNewMessage, setNotifications, setOnlineUsers
} from "../store/chatSlice";
import { addNotification } from "../store/notificationSlice";
import { socket } from "./socket";
import { decodeMessage } from "./messageEncoder";

let initialized = false;

const initGlobalSocketListeners = () => {
    if (initialized) return;
    initialized = true;



    const handleNotification = (message) => {
        appStore.dispatch(setLastMessage({ message: message.message }));
        appStore.dispatch(setNewMessage({ message: message.message }));
        appStore.dispatch(setNotifications(message));

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
                const title = `New message from ${message.sender}`;
                const body = decodeMessage(message.message.text);
                new Notification(title, {
                    body: body,
                    icon: message.photoUrl || 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
                });
            } catch (err) {
                console.error("OS Notification Error:", err);
            }
        }
    };

    const handleSystemNotification = (notif) => {
        appStore.dispatch(addNotification(notif));
        
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('New Notification', {
                body: notif.message,
                icon: 'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
            });
        }
    };

    socket.on("newMessageNotification", handleNotification);
    socket.on("newNotification", handleSystemNotification);
    socket.on("onlineUsers", (users) => appStore.dispatch(setOnlineUsers(users)));

    return () => {
        socket.off("newMessageNotification", handleNotification);
        socket.off("newNotification", handleSystemNotification);
        socket.off("onlineUsers");
        initialized = false;
    };
};

export { initGlobalSocketListeners };

