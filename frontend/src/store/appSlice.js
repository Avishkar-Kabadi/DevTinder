import { createSlice } from "@reduxjs/toolkit";


const appSlice = createSlice({
    name: "app",
    initialState: {
        isOnline: false,
    },
    reducers: {
        setOnlineStatus: (state, action) => {
            state.isOnline = Boolean(action.payload);
        },
    }
});


export const { setOnlineStatus } = appSlice.actions;
export default appSlice.reducer;