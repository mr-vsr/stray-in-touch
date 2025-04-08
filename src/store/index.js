import { configureStore } from '@reduxjs/toolkit';
import formReducer from './slices/formSlice';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        form: formReducer,
        auth: authReducer
    }
}); 