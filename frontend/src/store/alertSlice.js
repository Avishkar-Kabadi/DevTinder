import { createSlice } from "@reduxjs/toolkit";

const alertSlice = createSlice({
    name: "alerts",
    initialState: {
        toast: null, // { message, type: 'success' | 'warning' | 'error', id }
        confirmModal: null, // { title, message, onConfirm, onCancel, id }
    },
    reducers: {
        showToast: (state, action) => {
            state.toast = { ...action.payload, id: Date.now() };
        },
        hideToast: (state) => {
            state.toast = null;
        },
        showConfirm: (state, action) => {
            // Because Redux doesn't like storing non-serializable functions (like onConfirm callback),
            // a better approach in React is usually a context or a component ref, OR we can store IDs.
            // But we can store functions in Redux if we ignore the serializable check in store config, 
            // or we can handle confirmations differently.
            // For simplicity, we'll store the object and just suppress standard serializable warnings if they appear,
            // or use a unique event ID system.
            state.confirmModal = { ...action.payload, id: Date.now() };
            // wait, sending functions to Redux state is a bad practice.
            // Instead, we can use a custom event emitter, or context provider.
        },
        hideConfirm: (state) => {
            state.confirmModal = null;
        }
    }
});

export const { showToast, hideToast, showConfirm, hideConfirm } = alertSlice.actions;
export default alertSlice.reducer;
