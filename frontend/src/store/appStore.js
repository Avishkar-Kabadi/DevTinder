import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

// Helper keys
const DEV_TINDER_STATE_KEY = "devTinderState";

// Load State from LocalStorage
const loadState = () => {
    try {
        const serializedState = localStorage.getItem(DEV_TINDER_STATE_KEY);
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error("Error loading state from localStorage", err);
        return undefined;
    }
};

// Save State to LocalStorage
const saveState = (state) => {
    try {
        const serializedState = JSON.stringify({
            // Only persist specific slices we want cached
            user: state.user,
            connections: state.connections,
            feed: state.feed,
            notifications: state.notifications,
        });
        localStorage.setItem(DEV_TINDER_STATE_KEY, serializedState);
    } catch (err) {
        console.error("Error saving state to localStorage", err);
    }
};

const preloadedState = loadState();

const appStore = configureStore({
    reducer: rootReducer,
    preloadedState,
});

// Subscribe to store changes to save state
appStore.subscribe(() => {
    saveState(appStore.getState());
});

export default appStore;
