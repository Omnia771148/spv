"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Loading from '../loading/page';
import './signup.css';
import ErrorPopup from './ErrorPopup';
import { showToast } from '../../toaster/page';

export default function UpdateEmail({ handleBacktoLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(""); // Renamed from email to password
  const [result, setResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [popup, setPopup] = useState({ show: false, message: '', isSuccess: false });

  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    // Safety check for Auth
    if (!auth) {
      console.error("Firebase Auth not initialized");
      setPopup({ show: true, message: "System Error: Firebase Auth missing", isSuccess: false });
      return;
    }

    // Initialize Recaptcha
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-forgot", {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          }
        });
      }
      recaptchaVerifierRef.current = window.recaptchaVerifier;
    } catch (err) {
      console.error("Recaptcha Init Failed:", err);
    }

    return () => {
      // Cleanup
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) { console.error(e); }
        window.recaptchaVerifier = null;
      }
      recaptchaVerifierRef.current = null;

      // Remove badges
      document.querySelectorAll('.grecaptcha-badge').forEach(el => el.remove());
    };
  }, []);

  const sendOtp = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!phone) errors.phone = "Phone number is required";
    if (phone.length !== 10) errors.phone = "Enter valid 10-digit number";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!recaptchaVerifierRef.current) {
      setPopup({ show: true, message: "Recaptcha not initialized. Please refresh.", isSuccess: false });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current);

      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      showToast("OTP sent successfully! ✅", "success");
    } catch (error) {
      console.error("SMS Error:", error);
      setPopup({ show: true, message: "Error sending OTP. Please try again.", isSuccess: false });

      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) { }
        window.recaptchaVerifier = null;
        recaptchaVerifierRef.current = null;
        // Re-init logic would go here if extracted, but for now just let user refresh or rely on partial state
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setPopup({ show: true, message: "Enter OTP", isSuccess: false });

    setLoading(true);
    try {
      await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
      setPopup({ show: true, message: "Verified! ✅", isSuccess: true });
    } catch (error) {
      console.error("Verify Error:", error);
      setPopup({ show: true, message: "Invalid OTP ❌", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!otpVerified) return setPopup({ show: true, message: "Verify OTP first", isSuccess: false });
    if (!phone || !password) return setPopup({ show: true, message: "Enter phone and password", isSuccess: false });

    setLoading(true);
    let formattedPhone = phone.trim().replace(/\D/g, ''); // Keep only digits

    try {
      const res = await fetch("/api/check-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, password: password }),
      });
      const data = await res.json();

      if (data.exists) {
        setPopup({ show: true, message: "Password Updated! 🎉", isSuccess: true });
        setResult("Success");
      } else {
        setPopup({ show: true, message: "User not found ❌", isSuccess: false });
        setResult("User not found");
      }
    } catch (err) {
      console.error(err);
      setPopup({ show: true, message: "Server Error", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {loading && <Loading />}

      {popup.show && (
        <ErrorPopup
          message={popup.message}
          isSuccess={popup.isSuccess}
          onClose={() => setPopup({ ...popup, show: false })}
        />
      )}

      <div className="signup-container">
        <div onClick={handleBacktoLogin} className="back-arrow-btn">
          <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#333">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </div>

        <div className="signup-header" style={{ marginTop: '20px' }}>
          <h1 className="welcome-text">Forgot Password?</h1>
          <p className="subtitle">Recover your account</p>
        </div>

        <div className="signup-card">
          {/* Phone Input */}
          <div className="input-group-styled">
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '');
                if (v.length <= 10) setPhone(v);
              }}
              className={`styled-input ${validationErrors.phone ? 'error-border' : ''}`}
            />
          </div>

          {/* Password Input */}
          <div className="input-group-styled">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="styled-input"
            />
          </div>

          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            {!otpSent ? (
              <div className="create-btn-container">
                <button onClick={sendOtp} disabled={loading} className="create-btn">Send OTP</button>
              </div>
            ) : !otpVerified ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-group-styled">
                  <input type="text" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} className="styled-input" />
                </div>
                <div className="create-btn-container">
                  <button onClick={verifyOtp} disabled={loading} className="create-btn">Verify OTP</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', margin: '15px 0', color: 'green', fontWeight: 'bold' }}>✅ Phone Verified</div>
            )}
          </div>

          <div className="create-btn-container">
            <button
              onClick={handleUpdatePassword}
              disabled={!otpVerified || loading}
              className="create-btn"
              style={{ opacity: otpVerified ? 1 : 0.6, marginTop: '10px' }}
            >
              Reset Password
            </button>
          </div>

        </div>
      </div>
      <div id="recaptcha-forgot"></div>
    </div>
  );
}