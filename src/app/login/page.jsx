'use client';
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home({ handleFPClick, handleSignUp }) {
    const [users, setUsers] = useState([]);
    const [inputName, setInputName] = useState('');
    const [inputEmail, setInputEmail] = useState('');
    const [loading, setLoading] = useState(true); // Added loading state

    // 1. Check for existing session on load
    useEffect(() => {
        const loggedInUser = localStorage.getItem("userId");
        const loginTime = localStorage.getItem("loginTimestamp");

        if (loggedInUser && loginTime) {
            const currentTime = new Date().getTime();
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

            if (currentTime - loginTime < sevenDaysInMs) {
                window.location.href = "/mainRestorentList";
                return; 
            }
        }

        // If no user found or time expired, fetch users and show login page
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false); // Stop loading to show the login form
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
            localStorage.setItem("loginTimestamp", new Date().getTime().toString());

            alert("Login successful!");
            window.location.href = "/mainRestorentList";
        } else if (inputName === "" && inputEmail === "") {
            alert("Please fill in both fields.");
        } else {
            alert("Incorrect name or email.");
        }
    };

    // 2. Show a loading screen while checking status
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh', 
                fontSize: '20px' 
            }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // 3. Only if loading is false, show the Login Page
    return (
        <div style={{ padding: '20px' }}>
            <h2>Login</h2>
            
            <input
                type="text"
                placeholder="Enter Name"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
            /><br /><br />
            
            <input
                type="password"
                placeholder="Enter Password"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
            /><br /><br />
            
            <button onClick={handleCheck}>Sign In</button><br /><br />
            <button onClick={handleSignUp}>Sign Up</button><br /><br />
            <button onClick={handleFPClick}>Forgot Password</button>
        </div>
    );
}