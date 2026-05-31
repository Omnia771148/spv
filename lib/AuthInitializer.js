"use client";
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from './features/userSlice';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthInitializer() {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("userName");
        const userPhone = localStorage.getItem("userPhone");
        const userEmail = localStorage.getItem("userEmail");

        // 1. Restore User Session
        if (userId) {
            dispatch(setUser({
                id: userId,
                name: userName,
                phone: userPhone,
                email: userEmail
            }));
        }

        // 2. Global Route Protection
        // Allow access to login, privacy, and root landing pages without auth
        const cleanPath = pathname ? pathname.split('?')[0].replace(/\/$/, '') || '/' : '/';
        const publicPaths = ['/login', '/privacy', '/'];
        if (publicPaths.includes(cleanPath)) {
            setChecked(true);
            return;
        }

        // For all other pages, require userId
        if (!userId) {
            console.warn("🔒 No User ID found, redirecting to login.");
            router.replace('/login');
        } else {
            setChecked(true);
        }
    }, [dispatch, router, pathname]);

    return null;
}
