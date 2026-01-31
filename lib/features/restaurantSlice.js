import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Thunk to fetch all restaurant statuses
export const fetchRestaurantStatuses = createAsyncThunk(
    'restaurants/fetchStatuses',
    async () => {
        const response = await axios.get('/api/restaurants/all-status');
        return response.data; // Expecting { "restId1": true, "restId2": false }
    }
);

// Thunk to fetch all item (button) statuses
export const fetchItemStatuses = createAsyncThunk(
    'restaurants/fetchItemStatuses',
    async () => {
        const response = await axios.get('/api/button-status');
        // Convert array [{buttonId: 1, isActive: true}, ...] to map {1: true, ...}
        const data = response.data;
        const statusMap = {};
        if (Array.isArray(data)) {
            data.forEach(item => {
                statusMap[item.buttonId] = item.isActive;
            });
        }
        return statusMap;
    }
);

const restaurantSlice = createSlice({
    name: 'restaurants',
    initialState: {
        statusMap: {}, // For Restaurants (Open/Close)
        itemStatusMap: {}, // For Items (Active/Inactive)
        loading: false,
        itemLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Restaurant Statuses
            .addCase(fetchRestaurantStatuses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchRestaurantStatuses.fulfilled, (state, action) => {
                state.loading = false;
                state.statusMap = action.payload;
            })
            .addCase(fetchRestaurantStatuses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            // Item Statuses
            .addCase(fetchItemStatuses.pending, (state) => {
                state.itemLoading = true;
            })
            .addCase(fetchItemStatuses.fulfilled, (state, action) => {
                state.itemLoading = false;
                state.itemStatusMap = action.payload;
            })
            .addCase(fetchItemStatuses.rejected, (state, action) => {
                state.itemLoading = false;
                // state.error = action.error.message; // Optional: separate error handling
            });
    },
});

export const selectRestaurantStatus = (state, restaurantId) => state.restaurants.statusMap[restaurantId];
export const selectAllStatuses = (state) => state.restaurants.statusMap;
export const selectRestaurantLoading = (state) => state.restaurants.loading;

export const selectAllItemStatuses = (state) => state.restaurants.itemStatusMap;
export const selectItemLoading = (state) => state.restaurants.itemLoading;

export default restaurantSlice.reducer;
