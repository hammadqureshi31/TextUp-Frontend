import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { backendPortURL } from "../../config";

export const getAllUsers = createAsyncThunk("allusers/getAllUsers", async ()=>{
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${backendPortURL}user/available-contacts`)
    return response.data;
})


const allUsersSlice = createSlice({
    name: 'allUsers',
    initialState:{
        isloading: false,
        data: null,
        isError: false
    },

    extraReducers: (builder)=>{
        builder
        .addCase(getAllUsers.pending, (state) => {
            state.isloading = true;
            state.isError = false;
          })
        .addCase(getAllUsers.fulfilled, (state, action)=>{
            state.isloading = false,
            state.data = action.payload
            // console.log(action.payload)
        })
        .addCase(getAllUsers.rejected, (state, action) => {
            console.error("Error:", action.error.message); // Log error details
            state.isloading = false;
            state.isError = true;
            state.data = null
          });
    }
})


export default allUsersSlice.reducer;