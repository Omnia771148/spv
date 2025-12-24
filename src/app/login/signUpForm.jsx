'use client';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function Home({ handleBacktoLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // ✅ Use password, not email
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  
  // ✅ Ref prevents the "null reading style" error by keeping a stable reference
  const recaptchaVerifierRef = useRef(null);

  // ✅ Initialize reCAPTCHA only once when the page loads
  useEffect(() => {
    if (typeof window !== "undefined" && !recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => console.log("reCAPTCHA verified"),
          }
        );
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    }
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      
      // ✅ Use the ref instead of window variable
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        recaptchaVerifierRef.current
      );
      
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      alert("OTP sent!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Error: Check if phone number is correct or refresh page.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
      alert("Phone verified! Saving to database...");

      // ✅ Clean phone for MongoDB (removes +91 for searching)
      const cleanPhone = phone.replace("+91", "").trim();

      // ✅ Send password as 'email' only if your DB model requires that field name
      await axios.post('/api/users', { name, email: password, phone: cleanPhone });
      
      window.location.href = "./";
    } catch (error) {
      alert("Invalid OTP or Database error ❌");
    }
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <h1>Name</h1>
        <input type="text" onChange={(e) => setName(e.target.value)} /><br />

        <h1>Password</h1>
        <input type="password" onChange={(e) => setPassword(e.target.value)} /><br />

        <h1>Phone Number</h1>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /><br />

        {!otpSent ? (
          <button onClick={sendOtp}>Send OTP</button>
        ) : !otpVerified ? (
          <>
            <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} /><br />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        ) : (
          <p>✅ Verified</p>
        )}
        <br />
        <button onClick={handleBacktoLogin}>Back</button>
      </form>
      
      {/* ✅ Keep this OUTSIDE any conditional rendering */}
      <div id="recaptcha-container"></div>
    </div>
  );
}