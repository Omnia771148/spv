'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './features/userSlice';

export default function AuthInitializer() {
    const dispatch = useDispatch();

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");
        const userPhone = localStorage.getItem("userPhone");
        const userEmail = localStorage.getItem("userEmail");

        if (userId) {
            dispatch(setUser({
                id: userId,
                name: userName,
                phone: userPhone,
                email: userEmail
            }));
        }
    }, [dispatch]);

    return null; // This component renders nothing
}
