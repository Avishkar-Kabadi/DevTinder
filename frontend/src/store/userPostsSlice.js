import { createSlice } from "@reduxjs/toolkit";

const userPostsSlice = createSlice({
    name: "userPosts",
    initialState: [],
    reducers: {
        setUserPosts: (state, action) => {
            return action.payload;
        },
        addUserPost: (state, action) => {
            state.unshift(action.payload);
        },
        clearUserPosts: () => {
            return [];
        }
    }
});

export const { setUserPosts, addUserPost, clearUserPosts } = userPostsSlice.actions;
export default userPostsSlice.reducer;
