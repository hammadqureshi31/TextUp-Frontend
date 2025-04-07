// import { createSlice } from "@reduxjs/toolkit";

// let temp = []

// const chatHistorySlice = createSlice({
//   name: "chatHistory",
//   initialState: [],
//   reducers: {
//     history: (state, action) => {
//       temp.push(state.splice(0,-1))
//       state.push(action.payload); 
//       // console.log("History in store", state);
//     },
//   },
// });

// export const { history } = chatHistorySlice.actions;
// export default chatHistorySlice.reducer;



import { createSlice } from "@reduxjs/toolkit";

const chatHistorySlice = createSlice({
  name: "chatHistory",
  initialState: null, 
  reducers: {
    history: (state, action) => {
      return action.payload; 
    },
  },
});

export const { history } = chatHistorySlice.actions;
export default chatHistorySlice.reducer;
