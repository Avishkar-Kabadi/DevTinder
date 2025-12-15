import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chat",
    initialState: {
        conversations: [],
        newMessage: [],
        activeConversationId: null,
        notifications: null,
    },
    reducers: {


        setConversations: (state, action) => {
            state.conversations = action.payload;
        },

        setLastMessage: (state, action) => {
            const { message } = action.payload;
            const convIndex = state.conversations.findIndex(c => c._id === message?.conversationId);
            if (convIndex !== -1) {
                state.conversations[convIndex].lastMessage = message;
                const updatedConv = state.conversations.splice(convIndex, 1)[0];
                state.conversations.unshift(updatedConv);
            }
        },

        setNewMessage: (state, action) => {
            const { message } = action.payload;

            const activeId = state.activeConversationId?.toString();
            const incomingId = message?.conversationId?.toString();

            if (activeId !== incomingId) {
                state.newMessage.push(message);
            }
        },

        clearNewMessage: (state, action) => {
            const { conversationId } = action.payload;
            state.newMessage = state.newMessage.filter(
                (msg) => msg.conversationId !== conversationId
            );
        },


        setNotifications: (state, action) => {
            state.notifications = action.payload;
        },

        removeNotifications: (state, action) => {
            state.notifications = null;
        },







        setActiveConversationId: (state, action) => {
            state.activeConversationId = action.payload;
        },
        removeActiveConversationId: (state) => {
            state.activeConversationId = null;
        }

    },
});

export const {



    setActiveConversationId,
    removeActiveConversationId,

    setNotifications,
    removeNotifications,

    setConversations,
    setLastMessage,
    setNewMessage,
    clearNewMessage,
} = chatSlice.actions;

export default chatSlice.reducer;