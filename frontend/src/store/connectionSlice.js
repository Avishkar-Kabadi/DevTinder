import { createSlice } from "@reduxjs/toolkit";


const connectionSlice = createSlice({
    name: "connections",
    initialState: null,
    reducers: {
        addConnections: (state, action) => action.payload,
        removeConnection: (state, action) => {
            const newArray = state.filter(c => c._id != action.payload);
            return newArray; 
        }

    }
});

export const { addConnections, removeConnection } = connectionSlice.actions;

export default connectionSlice.reducer;