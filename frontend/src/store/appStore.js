import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";


const appStore = configureStore({
    reducer: rootReducer
});

export default appStore;

export const { dispatch } = appStore.dispatch;


