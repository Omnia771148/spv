"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "../loading/page";
import './contactus.css';

export default function Contactus() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple artificial delay to show the cool loader
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);
    if (loading) return <Loading />;

    return (
        <div className="contact-wrapper">
            {/* Header - Matching My Orders style */}
            <div className="orders-header">
                <button className="back-button-svg" onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div className="orders-header-pill">
                    <span className="header-icon"><i className="fa-solid fa-envelope"></i></span>
                    <h2>Contact Us</h2>
                </div>
            </div>

            {/* Contact Options Card */}
            <div className="contact-card">
                <div className="contact-list">



                    {/* Phone 2 - From original code +91 100 kept as secondary or remove if user implied specific design values? 
                            The user said "apply all the css for the missing also which are missing in the designe".
                            The original code had: +91 100, spv@gmail.com, insta, Facebook, Twitter.
                            I will include these as well using the same style.
                         */}

                    <button className="contact-item-btn" onClick={() => window.location.href = "tel:+91100"}>
                        <div className="contact-icon-box">
                            <i className="fa-solid fa-phone"></i>
                        </div>
                        <span>+91 100</span>
                    </button>

                    <button className="contact-item-btn" onClick={() => window.location.href = "mailto:spv@gmail.com"}>
                        <div className="contact-icon-box">
                            <i className="fa-solid fa-envelope"></i>
                        </div>
                        <span>spv@gmail.com</span>
                    </button>

                    {/* Socials */}
                    <button className="contact-item-btn" onClick={() => window.location.href = "/Profile"}>
                        <div className="contact-icon-box">
                            <i className="fa-brands fa-instagram"></i>
                        </div>
                        <span>Instagram</span>
                    </button>

                    <button className="contact-item-btn" onClick={() => window.location.href = "/Profile"}>
                        <div className="contact-icon-box">
                            <i className="fa-brands fa-facebook-f"></i>
                        </div>
                        <span>Facebook</span>
                    </button>

                    <button className="contact-item-btn" onClick={() => window.location.href = "/Profile"}>
                        <div className="contact-icon-box">
                            <i className="fa-brands fa-twitter"></i>
                        </div>
                        <span>Twitter</span>
                    </button>

                </div>
            </div>
        </div>
    )
}