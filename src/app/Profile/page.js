"use client"
import { useRouter } from "next/navigation";

import './profile.css';


export default function Profile() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("loginTimestamp");
        // We use replace to ensure history is clean and pathname is correct for hiding navbar
        router.replace("/");
    };

    return (
        <div className="profile-page-container">
            {/* Header with Back Button */}
            <div className="d-flex align-items-center mb-4">
                <i
                    className="fas fa-caret-left back-btn me-3"
                    onClick={() => router.back()}
                    style={{ fontSize: '2rem', color: '#ccc' }}
                ></i>
                {/* Spacer/Alignment could go here if needed, but image shows back arrow top left */}
            </div>

            {/* Profile Badge - Left Aligned */}
            <div className="mb-4">
                <div className="profile-header-badge">
                    <i className="fas fa-cog profile-header-icon"></i>
                    <span>Profile</span>
                </div>
            </div>

            {/* Menu Card */}
            <div className="profile-card">

                {/* Edit Profile */}
                <button className="custom-nav-btn" onClick={() => window.location.href = "/userdetails"}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-edit btn-icon-left"></i>
                        <span className="btn-text">Edit my profile</span>
                    </div>
                    <i className="fas fa-caret-right btn-arrow"></i>
                </button>

                {/* My Orders */}
                <button className="custom-nav-btn" onClick={() => window.location.href = "/finalorders"}>
                    <div className="d-flex align-items-center">
                        <i className="fas fa-box-open btn-icon-left"></i>
                        <span className="btn-text">My Orders</span>
                    </div>
                    <i className="fas fa-caret-right btn-arrow"></i>
                </button>

                {/* Contact Us */}
                <button className="custom-nav-btn" onClick={() => window.location.href = "/"}>
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