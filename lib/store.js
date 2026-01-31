import { configureStore } from '@reduxjs/toolkit';
import restaurantReducer from './features/restaurantSlice';
import userReducer from './features/userSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            restaurants: restaurantReducer,
            user: userReducer,
        },
    });
};
