import appStore from "../store/appStore";
import { setOnlineStatus } from "../store/appSlice";
import { io } from "socket.io-client";
import { baseUrl } from "./constants";

export const socket = io(baseUrl, {
    withCredentials: true,
    autoConnect: false,
});

socket.on("connect", () => {
    appStore.dispatch(setOnlineStatus());
});

socket.on("disconnect", () => {
    appStore.dispatch(setOnlineStatus());
});

export const connectSocket = (userId) => {
    if (!userId) return;

    if (!socket.connected) {
        socket.auth = { userId };
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
