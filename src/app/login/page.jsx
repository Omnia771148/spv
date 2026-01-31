'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import './login.css';
// ✅ Import your custom Loading component
import Loading from '../loading/page';

export default function Home({ handleFPClick, handleSignUp }) {
    const [users, setUsers] = useState([]);
    const [inputName, setInputName] = useState('');
    const [inputEmail, setInputEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [showError, setShowError] = useState(false);

    // 1. Check for existing session on load
    useEffect(() => {
        const loggedInUser = localStorage.getItem("userId");
        const loginTime = localStorage.getItem("loginTimestamp");

        if (loggedInUser && loginTime) {
            const currentTime = new Date().getTime();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

            if (currentTime - Number(loginTime) < sevenDaysInMs) {
                // If ID is there but details are missing, try to fetch them quietly
                if (!localStorage.getItem("userPhone") || !localStorage.getItem("userName")) {
                    axios.get('/api/users')
                        .then(res => {
                            const found = res.data.find(u => u._id === loggedInUser);
                            if (found) {
                                localStorage.setItem("userPhone", found.phone || "");
                                localStorage.setItem("userName", found.name || "");
                                localStorage.setItem("userEmail", found.email || "");
                            }
                        })
                        .catch(err => console.error("Background fetch failed", err));
                }

                window.location.href = "/mainRestorentList";
                return;
            }
        }

        // If no user found or time expired, fetch users
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false); // Show the login form
            }
        };
        fetchUsers();
    }, []);

    // Check user credentials
    const handleCheck = () => {
        const matchedUser = users.find(
            (user) => user.phone === inputName && (user.password ? user.password === inputEmail : user.email === inputEmail)
        );

        if (matchedUser) {
            localStorage.setItem("userId", matchedUser._id);
            localStorage.setItem("userPhone", matchedUser.phone || ""); // Save Phone
            localStorage.setItem("userName", matchedUser.name || "");   // Save Name
            localStorage.setItem("userEmail", matchedUser.email || ""); // Save Email
            localStorage.setItem("loginTimestamp", new Date().getTime().toString());

            alert("Login successful!");
            window.location.href = "/mainRestorentList";
        } else if (inputName.length !== 10) {
            alert("Mobile number must be exactly 10 digits.");
        } else if (inputName === "" && inputEmail === "") {
            alert("Please fill in both fields.");
        } else {
            setShowError(true);
        }
    };

    // ✅ Use your custom Loading component with the spinning pizza
    if (loading) {
        return <Loading />;
    }

    return (
        <div className="login-container">
            {/* Bootstrap CDN for mobile compatibility/grid if needed elsewhere, though custom CSS handles mostly everything here */}


            <div className="hello-box">
                <h1 className="hello-text">Hello</h1>
            </div>

            <div className="form-wrapper">
                {/* Mobile Number Input (mapped to inputName as per logic) */}
                <div className="input-group-custom">
                    <div className="input-icon">
                        {/* Person Icon */}
                        <svg viewBox="0 0 24 24" className="icon-grey">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Mobile number"
                        value={inputName}
                        onChange={(e) => {
                            const val = e.target.value;
                            // Only allow numbers and max 10 digits
                            if (/^\d*$/.test(val) && val.length <= 10) {
                                setInputName(val);
                            }
                        }}
                        className="custom-input"
                    />
                </div>

                {/* Password Input (mapped to inputEmail as per logic) */}
                <div className="input-group-custom">
                    <div className="input-icon">
                        {/* Lock Icon - Red */}
                        <svg viewBox="0 0 24 24" className="icon-red">
                            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3 1.71 0 3.1 1.29 3.1 3v2z" />
                        </svg>
                    </div>
                    <input
                        type="password"
                        placeholder="Password"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        className="custom-input"
                    />
                </div>

                <div
                    className="forgot-text"
                    onClick={handleFPClick}
                >
                    Forget password ?
                </div>

                <button
                    className="login-btn-custom"
                    onClick={handleCheck}
                >
                    Login
                </button>
            </div>

            <div className="create-account-text">
                Don’t have account?
                <span
                    className="create-link"
                    onClick={handleSignUp}
                >
                    create
                </span>
            </div>

            {/* Error Popup UI */}
            {showError && (
                <div className="error-popup-overlay">
                    <div className="error-popup-card">
                        <div className="error-icon-circle">
                            <span className="error-icon-cross">✕</span>
                        </div>
                        <p className="error-text">
                            Username/Password are<br />incorrect please<br />Retry
                        </p>
                        <button className="error-retry-btn" onClick={() => setShowError(false)}>
                            Retry
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}