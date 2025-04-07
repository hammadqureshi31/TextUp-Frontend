import { configureStore, current } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice";
import allUsersReducer from './slice/allUsersSlice';
import selectedChatReducer, { selectChat } from "./slice/selectedChat";
import messagesReducer from './slice/messagesSlice';
import chatHistoryReducer from './slice/chatHistorySlice';
import selectedGroupReducer from './slice/selectedGroup';
import callOfferReducer from './slice/callOffer';

export const store = configureStore({
    reducer:{
        currentUser: userReducer,
        allUsers: allUsersReducer,
        selectedChat: selectedChatReducer,
        selectedGroup: selectedGroupReducer,
        allMessages: messagesReducer,
        chatHistory: chatHistoryReducer,
        callOffer: callOfferReducer
    }
});
