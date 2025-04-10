import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { backendPortURL } from "../../config";

export const fetchAllMessages = createAsyncThunk(
  "allMessages/fetchAllMessages",
  async ({ newChatId, userId, mode, offset }) => {
    // console.log("Fetching messages for:", newChatId, userId, mode, offset);
    const response = await axios.get(
      `${backendPortURL}message?chatId=${newChatId}&userId=${userId}&mode=${mode}&offset=${offset}`
    );
    console.log(response);
    return response.data;
  }
);

const messageSlice = createSlice({
  name: "allMessages",
  initialState: {
    isloading: false,
    data: [],
    // sharedOffset: 0,
    isError: false,
    currentChatId: null, // Track current chat
  },
  reducers: {
    resetMessages: (state) => {
      state.data = []; 
      // state.isError = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMessages.pending, (state, action) => {
        // if (state.currentChatId !== action.meta.arg.newChatId) {
        //   state.data = []; // Clear messages when switching to a new chat
        //   state.currentChatId = action.meta.arg.newChatId;
        //   console.log("action.meta.arg.newChatId",action.meta.arg.newChatId)
        // }
        state.isloading = true;
        state.isError = false;
      })
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        state.isloading = false;
        state.data = [...state.data, ...action.payload]; 
        // state.sharedOffset = state.sharedOffset + 1;
        state.isError = false;
      })
      .addCase(fetchAllMessages.rejected, (state, action) => {
        console.error("Error fetching messages:", action.error.message);
        state.isloading = false;
        state.isError = true;
      });
  },
});

export const { resetMessages } = messageSlice.actions;
export default messageSlice.reducer;









// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import axios from "axios";
// import { backendPortURL } from "../../config";

// export const fetchAllMessages = createAsyncThunk(
//   "allMessages/fetchAllMessages",
//   async ({ newChatId, userId, mode, offset }) => {
//     console.log("Fetching messages for:", newChatId, userId, mode, offset);
//     const response = await axios.get(
//       `${backendPortURL}message?chatId=${newChatId}&userId=${userId}&mode=${mode}&offset=${offset}`
//     );
//     return response.data;
//   }
// );

// const messageSlice = createSlice({
//   name: "allMessages",
//   initialState: {
//     isloading: false,
//     data: [],
//     isError: false,
//     currentChatId: null, // Track current chat
//   },
//   reducers: {
//     resetMessages: (state) => {
//       state.data = []; // Clear messages when switching chat
//       state.currentChatId = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAllMessages.pending, (state, action) => {
//         if (state.currentChatId !== action.meta.arg.newChatId) {
//           state.data = []; // Clear messages when switching to a new chat
//           state.currentChatId = action.meta.arg.newChatId;
//           console.log("action.meta.arg.newChatId",action.meta.arg.newChatId)
//         }
//         state.isloading = true;
//         state.isError = false;
//       })
//       .addCase(fetchAllMessages.fulfilled, (state, action) => {
//         state.isloading = false;
//         state.data = [...state.data, ...action.payload]; 
//         state.isError = false;
//       })
//       .addCase(fetchAllMessages.rejected, (state, action) => {
//         console.error("Error fetching messages:", action.error.message);
//         state.isloading = false;
//         state.isError = true;
//       });
//   },
// });

// export const { resetMessages } = messageSlice.actions;
// export default messageSlice.reducer;
