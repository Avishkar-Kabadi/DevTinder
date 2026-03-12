import { createSlice } from "@reduxjs/toolkit";


const feedSlice = createSlice({
    name: "feed",
    initialState: [],
    reducers: {
        addFeed: (state, action) => {
            return action.payload;
        },
        removeUserFeed: (state, action) => {
            const newArray = state.filter(f => f._id != action.payload);
            return newArray;
        },
        clearFeed: () => {
            return [];
        },
        updatePost: (state, action) => {
            const updatedPost = action.payload;
            if (!updatedPost || !updatedPost._id) return state;


            return state.map((p) =>
                p._id === updatedPost._id ? updatedPost : p
            );
        }
    }
});

export const { addFeed, clearFeed, updatePost, removeUserFeed } = feedSlice.actions;

export default feedSlice.reducer;