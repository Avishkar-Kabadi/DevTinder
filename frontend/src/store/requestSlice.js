import { createSlice } from "@reduxjs/toolkit";


const requestSlice = createSlice({
    name: "requests",
    initialState: null,
    reducers: {
        addRequests: (state, action) => action.payload,
        removeReqests: () => null
    }
});

export const { addRequests, removeReqests } = requestSlice.actions;
export default requestSlice.reducer;