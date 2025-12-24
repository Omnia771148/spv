"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export default function UpdateEmail() {
  const [phone, setPhone] = useState("+91");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use a Ref to store the verifier safely across re-renders
  const verifierRef = useRef(null);

  // Setup reCAPTCHA with safe cleanup logic
  const setupRecaptcha = () => {
    const container = document.getElementById("recaptcha-container");
    if (!container) return;

    // Safe cleanup to avoid "auth/internal-error" on a destroyed verifier
    if (verifierRef.current) {
      try {
        verifierRef.current.clear();
      } catch (e) {
        console.warn("reCAPTCHA cleanup suppressed:", e.message);
      }
      verifierRef.current = null;
      container.innerHTML = ""; // Reset the DOM for a fresh start
    }

    try {
      verifierRef.current = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => { console.log("reCAPTCHA verified"); },
          "expired-callback": () => { setupRecaptcha(); }
        }
      );
    } catch (err) {
      console.error("reCAPTCHA Init Error:", err);
    }
  };

  const sendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone || phone.trim().length < 10) return alert("Enter valid phone number");

    setLoading(true);
    try {
      setupRecaptcha();
      
      // Clean phone: Remove spaces and ensure +91 prefix
      let formattedPhone = phone.trim().replace(/\s+/g, "");
      if (!formattedPhone.startsWith("+91")) {
        formattedPhone = "+91" + formattedPhone;
      }

      // Render the verifier explicitly
      await verifierRef.current.render();

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifierRef.current
      );
      
      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      alert("OTP sent! ✅");
    } catch (error) {
      console.error("SMS Error:", error);
      alert(`Error sending OTP: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otp) return alert("Please enter the OTP");
    
    setLoading(true);
    try {
      await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
      alert("Phone number verified ✅");
    } catch (error) {
      console.error("OTP Verification Error:", error);
      alert("Invalid OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!otpVerified) {
      return alert("Please verify your phone number with OTP first!");
    }
    if (!phone || !email) return alert("Enter phone and email");

    setLoading(true);
    // Remove all spaces and ensure only one +91 exists
    let formattedPhone = phone.trim().replace(/\s+/g, ''); 
    if (!formattedPhone.startsWith("+91")) {
      formattedPhone = "+91" + formattedPhone;
    }

    try {
      const res = await fetch("/api/check-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, email }),
      });

      const data = await res.json();

      if (data.exists) {
        setResult("Password Added Successfully 🎉");
      } else {
        setResult("User not found ❌");
      }
    } catch (err) {
      console.error("Update Error:", err);
      setResult("Error updating password ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>Update Password for Phone</h2>
      
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />

        <input
          type="email"
          placeholder="Enter new password"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px", width: "100%" }}
        />
      </div>

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        {!otpSent ? (
          <button onClick={sendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : !otpVerified ? (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ padding: "8px", marginRight: "10px" }}
            />
            <button onClick={verifyOtp} disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        ) : (
          <span style={{ color: "green", fontWeight: "bold" }}>✅ Phone Verified</span>
        )}
      </div>

      <button 
        onClick={handleUpdateEmail} 
        disabled={!otpVerified || loading}
        style={{ width: "100%", padding: "10px", backgroundColor: otpVerified ? "#0070f3" : "#ccc", color: "white", border: "none", borderRadius: "5px", cursor: otpVerified ? "pointer" : "not-allowed" }}
      >
        {loading ? "Processing..." : "Update Password"}
      </button>

      {result && <p style={{ marginTop: "15px", fontWeight: "bold" }}>{result}</p>}

      {/* This container must exist for reCAPTCHA to work */}
      <div id="recaptcha-container"></div>
    </div>
  );
}