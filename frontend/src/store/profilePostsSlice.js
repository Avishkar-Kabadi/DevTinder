import { createSlice } from "@reduxjs/toolkit";

const profilePostsSlice = createSlice({
    name: "profilePosts",
    initialState: [],
    reducers: {
        setProfilePosts: (state, action) => {
            return action.payload;
        },
        addProfilePost: (state, action) => {
            state.unshift(action.payload);
        },
        clearProfilePosts: () => {
            return [];
        }
    }
});

export const { setProfilePosts, addProfilePost, clearProfilePosts } = profilePostsSlice.actions;
export default profilePostsSlice.reducer;
