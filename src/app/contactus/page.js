"use client"
import React from 'react';
import './contactus.css';

export default function Contactus() {
    return (
        <div className="contact-wrapper">
            <div className="container d-flex flex-column align-items-center">

                <div className="w-100" style={{ maxWidth: '400px' }}>
                    {/* Header Section */}
                    <div className="page-title">
                        <div className="title-badge">
                            <span className="title-icon"><i className="fa-solid fa-envelope"></i></span>
                            Contact Us
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
            </div>
        </div>
    )
}