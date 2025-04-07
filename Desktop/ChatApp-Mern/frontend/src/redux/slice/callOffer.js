import { createSlice } from "@reduxjs/toolkit";

const callofferSlice = createSlice({
  name: "callOffer",
  initialState: null,
  reducers: {
    setCallOffer: (state, action) => {
      console.log("callOffer",action.payload);
      return action.payload;
    },
  },
});


export const { setCallOffer } = callofferSlice.actions;
export default callofferSlice.reducer;
