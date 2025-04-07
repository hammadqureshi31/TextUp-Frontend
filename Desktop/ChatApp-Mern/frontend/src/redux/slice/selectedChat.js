import { createSlice } from "@reduxjs/toolkit"; 

const selectedChatSlice = createSlice({
  name: "selectedChat",
  initialState: null,
  reducers: {
    selectChat: (state, action) => {
      console.log(action.payload)
      return action.payload; 
    },
  },
});

export const { selectChat } = selectedChatSlice.actions;
export default selectedChatSlice.reducer;
