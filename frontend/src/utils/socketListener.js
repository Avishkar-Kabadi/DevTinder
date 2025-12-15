import appStore from "../store/appStore";
import {
    setLastMessage,
    setNewMessage,
    setNotifications
} from "../store/chatSlice";
import { socket } from "./socket";

let initialized = false;

const initGlobalSocketListeners = () => {
    if (initialized) return;
    initialized = true;


    const handleNotification = (message) => {
        appStore.dispatch(setLastMessage({ message: message.message }));
        appStore.dispatch(setNewMessage({ message: message.message }));
        appStore.dispatch(setNotifications(message));
    };

    socket.on("newMessageNotification", handleNotification);

    return () => {
        socket.off("newMessageNotification", handleNotification);
        initialized = false;
    };
};

export { initGlobalSocketListeners };

