
import { combineReducers } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice";
import connectionReducer from "./connectionSlice";
import feedReducer from "./feedSlice";
import requestReducer from "./requestSlice";
import userReducer from "./userSlice";
import appSlice from "./appSlice";

const appReducer = combineReducers({
    app: appSlice,
    user: userReducer,
    connections: connectionReducer,
    feed: feedReducer,
    requests: requestReducer,
    chat: chatReducer,
});

export default function rootReducer(state, action) {
    if (action.type === "auth/logout") {
        // sourcery skip: dont-reassign-parameters
        state = undefined;
    }
    return appReducer(state, action);
}
