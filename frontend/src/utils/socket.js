// src/utils/socket.js

import { io } from "socket.io-client";
import { baseUrl } from "./constants";

export const socket = io(baseUrl, {
    withCredentials: true,
    autoConnect: false,
});

export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
        console.log("Attempting socket connection...");
    }
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
        console.log("Socket disconnected.");
    }
};