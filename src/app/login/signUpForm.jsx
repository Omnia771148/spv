'use client';
import { useState } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function Home({ handleBacktoLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified");
          },
        }
      );
    }
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      setupRecaptcha();
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        appVerifier
      );
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      alert("OTP sent!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error sending OTP ❌");
    }
  };

  // Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await window.confirmationResult.confirm(otp);
      console.log("Phone verified user:", result.user);
      setOtpVerified(true);
      alert("Phone number verified ✅");
      const response = await axios.post('/api/users', { name, email, phone });
      window.location.href = "./";

    } catch (error) {
      
      alert("Invalid OTP ❌");
    }
  };

  // Final form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      alert("Please verify your phone number first!");
      return;
    }
    try {
      
      alert("sent");
    } catch (err) {
      console.error("Error in POST API:", err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Input Name</h1><br />
        <input type="text" onChange={(e) => setName(e.target.value)} /><br />

        <h1>Password</h1><br />
        <input type="password" onChange={(e) => setEmail(e.target.value)} /><br />

        {/* Phone number input */}
        <h1>Phone Number</h1><br />
        <input
          type="tel"
          placeholder="+91XXXXXXXXXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        /><br />

        {/* OTP logic */}
        {!otpSent ? (
          <button onClick={sendOtp}>Send OTP</button>
        ) : !otpVerified ? (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            /><br />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        ) : (
          <p>✅ Phone Verified</p>
        )}

        <br />
        <button onClick={handleBacktoLogin}>Back</button>
      </form>

      {/* Required for Firebase reCAPTCHA */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
