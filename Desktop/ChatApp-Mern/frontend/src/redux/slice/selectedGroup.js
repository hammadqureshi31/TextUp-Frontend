import { createSlice } from "@reduxjs/toolkit";

const selectedGroupSlice = createSlice({
  name: "selectedGroup",
  initialState: null,
  reducers: {
    selectGroup: (state, action) => {
      console.log(action.payload)
      return action.payload; 
    },
  },
});

export const { selectGroup } = selectedGroupSlice.actions;
export default selectedGroupSlice.reducer;
