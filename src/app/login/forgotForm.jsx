"use client";
import { useState } from "react";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function UpdateEmail() {
  const [phone, setPhone] = useState("+91"); 
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

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
    if (e) e.preventDefault();
    if (!phone) return alert("Please enter phone number");
    
    try {
      setupRecaptcha();
      // Clean phone for Firebase
      const formattedPhone = phone.trim().startsWith("+91") ? phone.trim() : `+91${phone.trim()}`;
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

  const verifyOtp = async (e) => {
    if (e) e.preventDefault();
    try {
      const result = await window.confirmationResult.confirm(otp);
      console.log("Phone verified user:", result.user);
      setOtpVerified(true);
      alert("Phone number verified ✅");
    } catch (error) {
      alert("Invalid OTP ❌");
    }
  };

  const handleUpdateEmail = async () => {
    if (!otpVerified) {
      return alert("Please verify your phone number with OTP first!");
    }
    if (!phone || !email) return alert("Enter phone and email");

    // --- FIX STARTS HERE ---
    // Remove all spaces and ensure only one +91 exists
    let formattedPhone = phone.trim().replace(/\s+/g, ''); 
    if (!formattedPhone.startsWith("+91")) {
      formattedPhone = "+91" + formattedPhone;
    }
    // --- FIX ENDS HERE ---

    try {
      const res = await fetch("/api/check-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, email }),
      });

      const data = await res.json();

      if (data.exists) {
        setResult("Password Added Successfully");
      } else {
        setResult("User not found ❌");
      }
    } catch (err) {
      console.error(err);
      setResult("Error updating email ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Update Email for Phone</h2>
      
      <input
        type="text"
        placeholder="Enter phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ padding: "5px", marginRight: "10px" }}
      />

      <input
        type="email"
        placeholder="Enter new password"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "5px", marginRight: "10px" }}
      />

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        {!otpSent ? (
          <button onClick={sendOtp}>Send OTP</button>
        ) : !otpVerified ? (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ padding: "5px", marginRight: "10px" }}
            />
            <button onClick={verifyOtp}>Verify OTP</button>
          </>
        ) : (
          <span style={{ color: "green", fontWeight: "bold" }}>✅ Phone Verified</span>
        )}
      </div>

      <button onClick={handleUpdateEmail}>
        Update Password
      </button>

      {result && <p>{result}</p>}

      <div id="recaptcha-container"></div>
    </div>
  );
}