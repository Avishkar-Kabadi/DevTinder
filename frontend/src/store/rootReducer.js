
import { combineReducers } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import connectionReducer from "./connectionSlice";
import feedReducer from "./feedSlice";
import requestReducer from "./requestSlice";
import userReducer from "./userSlice";
import appSlice from "./appSlice";
import notificationReducer from "./notificationSlice";
import searchReducer from "./searchSlice";
import profilePostsReducer from "./profilePostsSlice";
import userPostsReducer from "./userPostsSlice";

const appReducer = combineReducers({
    app: appSlice,
    user: userReducer,
    connections: connectionReducer,
    feed: feedReducer,
    requests: requestReducer,
    notifications: notificationReducer,
    chat: chatReducer,
    search: searchReducer,
    profilePosts: profilePostsReducer,
    userPosts: userPostsReducer,
});

export default function rootReducer(state, action) {
    if (action.type === "auth/logout") {
        // Clear local storage when logging out
        localStorage.removeItem("devTinderState");
        // sourcery skip: dont-reassign-parameters
        state = undefined;
    }
    return appReducer(state, action);
}
