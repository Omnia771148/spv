import { createSlice } from '@reduxjs/toolkit';

// Initial state, trying to read from localStorage if possible (safe for SSR)
// Note: In Next.js App Router, we'll initialize this in a Client Component (AuthProvider) 
// to avoid hydration mismatch, so we start null or empty here.
const initialState = {
    userInfo: null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            // action.payload should be the user object (id, name, phone, etc.)
            state.userInfo = action.payload;
            state.isAuthenticated = true;
            // We can also sync to localStorage here if we want to be doubly sure,
            // but usually the calling component handles side-effects.
            // For Redux purity, let's keep it simple.
        },
        logoutUser: (state) => {
            state.userInfo = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, logoutUser } = userSlice.actions;

export const selectUser = (state) => state.user.userInfo;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;

export default userSlice.reducer;
