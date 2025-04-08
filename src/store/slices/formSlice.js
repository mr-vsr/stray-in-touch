import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    success: false
};

export const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setSuccess: (state, action) => {
            state.success = action.payload;
        }
    }
});

export const { setSuccess } = formSlice.actions;
export default formSlice.reducer; 