import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { backendPortURL } from '../../config';

export const fetchUserDetails = createAsyncThunk('currentUser/fetchUserDetails', async()=>{
    axios.defaults.withCredentials = true;
    const response = await axios.get(`${backendPortURL}user/me`)
    return response.data; 
})


const userSlice = createSlice({
    name: 'currentUser',
    initialState:{
        isloading: false,
        data: null,
        isError: false
    },

    extraReducers: (builder)=>{
        builder
        .addCase(fetchUserDetails.pending, (state) => {
            state.isloading = true;
            state.isError = false;
          })
        .addCase(fetchUserDetails.fulfilled, (state, action)=>{
            state.isloading = false,
            state.data = action.payload
            // console.log(action.payload)
        })
        .addCase(fetchUserDetails.rejected, (state, action) => {
            console.error("Error:", action.error.message); // Log error details
            state.isloading = false;
            state.isError = true;
            state.data = null
          });
    }
})

export default userSlice.reducer;