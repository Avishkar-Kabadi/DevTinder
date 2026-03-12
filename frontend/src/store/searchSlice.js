import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
    name: "search",
    initialState: {}, // Stores key-value pairs: { "query1": [user1, user2], "query2": [...] }
    reducers: {
        cacheResults: (state, action) => {
            const { query, results } = action.payload;
            state[query] = results;
        },
        clearSearchCache: () => {
            return {};
        }
    }
});

export const { cacheResults, clearSearchCache } = searchSlice.actions;
export default searchSlice.reducer;
