import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
    name: "notifications",
    initialState: [],
    reducers: {
        setNotifications: (state, action) => {
            return action.payload;
        },
        addNotification: (state, action) => {
            // Add new notification to the beginning of the array
            state.unshift(action.payload);
        },
        markAllAsRead: (state) => {
            state.forEach(notif => notif.isRead = true);
        },
        clearNotifications: () => {
            return [];
        }
    }
});

export const { setNotifications, addNotification, markAllAsRead, clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer;
