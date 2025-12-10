
import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import connectionReducer from "./connectionSlice";
import feedReducer from "./feedSlice";
import requestReducer from "./requestSlice";

const appReducer = combineReducers({
    user: userReducer,
    connections: connectionReducer,
    feed: feedReducer,
    requests: requestReducer
});

export default function rootReducer(state, action) {
    if (action.type === "auth/logout") {
// sourcery skip: dont-reassign-parameters
        state = undefined;
    }
    return appReducer(state, action);
}
