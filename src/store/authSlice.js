import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    success: false,
    isLoggedIn: false,
    userData: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        Login: (state, action) => {
            state.isLoggedIn = action.payload.isLoggedIn;
            state.userData = action.payload.userData;
        },
        Logout: (state) => {
            state.isLoggedIn = false;
            state.userData = null;
        },
        isSuccess: (state,action) => {
            state.success = action.payload.success;
        },
    }
})

export const { Login, Logout, isSuccess, isProgress } = authSlice.actions;
export default authSlice.reducer;