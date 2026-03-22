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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const userId = localStorage.getItem("userId");
            if (!userId) {
                router.replace("/login");
                return;
            }

            try {
                const res = await fetch(`/api/users/${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (err) {
                console.error("Failed to fetch user data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        setLoading(true);

        // Allow the Loading component to render before blocking the main thread 
        // with storage clear commands and route navigation
        setTimeout(() => {
            // 1. Clear Redux State (Memory)
            dispatch(logoutUser());

            // 2. Clear Local Storage (Disk)
            localStorage.clear();

            // 3. Reset Location Prompt Flag (Session)
            sessionStorage.removeItem("isAppLoaded");

            // 4. Redirect
            router.replace("/");
        }, 800);
    };

    const handleDeleteAccount = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const confirmDelete = window.confirm(
            "⚠️ PERMANENT ACTION\n\nAre you sure you want to delete your account? This will permanently erase your order history and profile. This cannot be undone."
        );

        if (confirmDelete) {
            setLoading(true);
            try {
                const res = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                });

                if (res.ok) {
                    alert("Account Deleted Successfully. We're sorry to see you go.");
                    handleLogout();
                } else {
                    alert("Error deleting account. Please contact support.");
                    setLoading(false);
                }
            } catch (err) {
                console.error("Delete account error", err);
                alert("Server error. Please try again later.");
                setLoading(false);
            }
        }
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

            {/* User Profile Header Section */}
            <div className="user-profile-info-card">
                <div className="user-avatar-circle">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <i className="fas fa-user"></i>}
                </div>
                <div className="user-text-details">
                    <h1 className="user-display-name">{user?.name || "Welcome!"}</h1>
                    <p className="user-display-phone">
                        <i className="fas fa-phone-alt" style={{ transform: 'scaleX(-1)', display: 'inline-block' }}></i> {user?.phone || "Phone not set"}
                    </p>
                </div>
            </div>

            {/* Coins Section - Matching My Orders style */}
            <div className="coin-balance-card">
                <div className="coin-balance-info">
                    <div className="coin-icon-wrapper-large">
                        <i className="fas fa-coins"></i>
                    </div>
                    <div className="coin-details">
                        <span className="coin-title">Available Coins</span>
                        <span className="coin-amount">{user?.coins || 0}</span>
                    </div>
                </div>
                <div className="coin-shine"></div>
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

                {/* My Reviews */}
                <button className="custom-nav-btn" onClick={() => router.push("/MyReviews")}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-star btn-icon-left"></i>
                        <span className="btn-text">My Reviews</span>
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

                {/* Privacy Policy */}
                <button className="custom-nav-btn" onClick={() => router.push("/privacy")}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-user-shield btn-icon-left"></i>
                        <span className="btn-text">Privacy Policy</span>
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

                {/* Account Deletion - Google Play Requirement */}
                <div style={{ marginTop: '20px', padding: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginBottom: '10px' }}>
                        Need to close your account?
                    </p>
                    <button 
                        onClick={handleDeleteAccount}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: '1px solid #fecaca',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Permanently Delete Account
                    </button>
                </div>

            </div>
        </div>
    )
}