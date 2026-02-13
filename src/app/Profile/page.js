"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logoutUser } from "lib/features/userSlice";
import Loading from "../loading/page";

import './profile.css';


export default function Profile() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple artificial delay to show the cool loader
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        // 1. Clear Redux State (Memory)
        dispatch(logoutUser());

        // 2. Clear Local Storage (Disk)
        localStorage.clear();

        // 3. Reset Location Prompt Flag (Session)
        sessionStorage.removeItem("isAppLoaded");

        // 3. Redirect
        // We use replace to ensure history is clean and pathname is correct for hiding navbar
        router.replace("/");
    };

    if (loading) return <Loading />;

    return (
        <div className="profile-page-container">




            {/* Header - Matching My Orders style */}
            <div className="orders-header">
                <button className="back-button-svg" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="orders-header-pill">
                    <span className="header-icon"><i className="fas fa-cog"></i></span>
                    <h2>Profile</h2>
                </div>
            </div>

            {/* Menu Card */}
            <div className="profile-card">

                {/* Edit Profile */}
                <button className="custom-nav-btn" onClick={() => router.push("/userdetails")}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-edit btn-icon-left"></i>
                        <span className="btn-text">My Profile</span>
                    </div>
                    <i className="fas fa-caret-right btn-arrow"></i>
                </button>

                {/* My Orders */}
                <button className="custom-nav-btn" onClick={() => router.push("/finalorders")}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-box-open btn-icon-left"></i>
                        <span className="btn-text">My Orders</span>
                    </div>
                    <i className="fas fa-caret-right btn-arrow"></i>
                </button>

                {/* Contact Us */}
                <button className="custom-nav-btn" onClick={() => router.push("/contactus")}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-envelope btn-icon-left"></i>
                        <span className="btn-text">Contact Us</span>
                    </div>
                    <i className="fas fa-caret-right btn-arrow"></i>
                </button>

                {/* Logout - Added to maintain functionality */}
                <button className="custom-nav-btn" onClick={handleLogout}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-sign-out-alt btn-icon-left text-danger"></i>
                        <span className="btn-text text-danger">Logout</span>
                    </div>
                    <i className="fas fa-caret-right btn-arrow text-danger"></i>
                </button>

            </div>
        </div>
    )
}