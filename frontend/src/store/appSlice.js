import { createSlice } from "@reduxjs/toolkit";


const appSlice = createSlice({
    name: "app",
    initialState: {
        isOnline: false,
    },
    reducers: {
        setOnlineStatus: (state, action) => {
            state.isOnline = !state.isOnline;
        },
    }
});


export const { setOnlineStatus } = appSlice.actions;
export default appSlice.reducer;