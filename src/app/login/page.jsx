'use client';
import { useState, useEffect } from "react";
import axios from "axios";

export default function Home({ handleFPClick, handleSignUp }) {
    const [users, setUsers] = useState([]);
    const [inputName, setInputName] = useState('');
    const [inputEmail, setInputEmail] = useState('');

    // Fetch users from backend when component loads
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get('/api/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Error fetching users:", err);
            }
        };
        fetchUsers();
    }, []);

    // Check user credentials
    const handleCheck = () => {
        // Find matching user
        const matchedUser = users.find(
            (user) => user.phone === inputName && user.email === inputEmail
        );

        if (matchedUser) {
            // Store user ID in localStorage
            localStorage.setItem("userId", matchedUser._id); // or user.id depending on your DB
            alert("Login successful!");
            window.location.href = "/mainRestorentList";
        } else if (inputName === "" && inputEmail === "") {
            alert("Please fill in both fields.");
        } else {
            alert("Incorrect name or email.");
        }
    };

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
