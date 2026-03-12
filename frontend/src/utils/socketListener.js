import appStore from "../store/appStore";
import {
    setLastMessage,
    setNewMessage,setNotifications
} from "../store/chatSlice";
import { addNotification } from "../store/notificationSlice";
import { socket } from "./socket";

let initialized = false;

const initGlobalSocketListeners = () => {
    if (initialized) return;
    initialized = true;



    const handleNotification = (message) => {
        appStore.dispatch(setLastMessage({ message: message.message }));
        appStore.dispatch(setNewMessage({ message: message.message }));
        appStore.dispatch(setNotifications(message))
    };

    const handleSystemNotification = (notif) => {
        appStore.dispatch(addNotification(notif));
    };

    socket.on("newMessageNotification", handleNotification);
    socket.on("newNotification", handleSystemNotification);

    return () => {
        socket.off("newMessageNotification", handleNotification);
        socket.off("newNotification", handleSystemNotification);
        initialized = false;
    };
};

export { initGlobalSocketListeners };

