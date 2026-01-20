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
            (user) => user.phone === inputName && user.email === inputEmail
        );

        if (matchedUser) {
            localStorage.setItem("userId", matchedUser._id);
            localStorage.setItem("userPhone", matchedUser.phone || ""); // Save Phone
            localStorage.setItem("userName", matchedUser.name || "");   // Save Name
            localStorage.setItem("userEmail", matchedUser.email || ""); // Save Email
            localStorage.setItem("loginTimestamp", new Date().getTime().toString());

            alert("Login successful!");
            window.location.href = "/mainRestorentList";
        } else if (inputName === "" && inputEmail === "") {
            alert("Please fill in both fields.");
        } else {
            alert("Incorrect name or email.");
        }
    };

    // ✅ Use your custom Loading component with the spinning pizza
    if (loading) {
        return <Loading />;
    }

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="header-pill">
                    <h1 className="hello-text">Hello</h1>
                </div>

                <div className="inputs-container">
                    <div className="input-group">
                        <span className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#a0a0a0">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Mobile number"
                            value={inputName}
                            onChange={(e) => setInputName(e.target.value)}
                            className="custom-input"
                        />
                    </div>

                    <div className="input-group">
                        <span className="input-icon password-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#e74c3c">
                                <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3 3.1-3s3.1 1.29 3.1 3v2H8.9V6z" />
                            </svg>
                        </span>
                        <input
                            type="password"
                            placeholder="Password"
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                            className="custom-input"
                        />
                    </div>

                    <button onClick={handleFPClick} className="forgot-password-link">
                        Forget password ?
                    </button>
                </div>

                <button onClick={handleCheck} className="login-btn">
                    Login
                </button>

                <div className="signup-text">
                    Don't have account?
                    <button onClick={handleSignUp} className="signup-link">
                        create
                    </button>
                </div>
            </div>
        </div>
    );
}