"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Loading from '../loading/page';
import './signup.css';

export default function UpdateEmail() {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const recaptchaVerifierRef = useRef(null);

  // Helper to safely initialize Recaptcha
  const initRecaptcha = () => {
    if (typeof window === "undefined") return null;

    const container = document.getElementById("recaptcha-container");
    if (!container) {
      console.error("Recaptcha container not found in DOM");
      return null;
    }

    // Clear existing instance if any
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Error clearing old recaptcha:", e);
      }
      window.recaptchaVerifier = null;
    }

    // Create new instance
    try {
      const verifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA verified");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired, resetting...");
            // If expired, clear it so we re-init next time
            if (window.recaptchaVerifier) {
              try { window.recaptchaVerifier.clear(); } catch (e) { }
              window.recaptchaVerifier = null;
              recaptchaVerifierRef.current = null;
            }
          }
        }
      );

      window.recaptchaVerifier = verifier;
      recaptchaVerifierRef.current = verifier;
      return verifier;
    } catch (err) {
      console.error("Recaptcha Init Error:", err);
      return null;
    }
  };

  useEffect(() => {
    // Init on mount
    initRecaptcha();

    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (e) { }
        window.recaptchaVerifier = null;
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const sendOtp = async (e) => {
    if (e) e.preventDefault();

    // Validation
    const errors = {};
    if (!phone) errors.phone = "Phone number is required";
    if (phone.length !== 10) errors.phone = "Phone valid 10-digit number";

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Ensure we have a valid verifier
    let verifier = recaptchaVerifierRef.current;
    if (!verifier) {
      console.log("Verifier missing, attempting re-init...");
      verifier = initRecaptcha();
      if (!verifier) {
        alert("System Error: Could not initialize Recaptcha. Please refresh the page.");
        return;
      }
    }

    setLoading(true);
    try {
      const formattedPhone = `+91${phone}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        verifier
      );

      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      alert("OTP sent! ✅");
    } catch (error) {
      console.error("SMS Error:", error);

      if (error.code === 'auth/captcha-check-failed') {
        const hostname = window.location.hostname;
        setConfigError(hostname);
      } else if (error.code === 'auth/invalid-phone-number') {
        alert("Invalid phone number format.");
      } else if (error.code === 'auth/invalid-app-credential') {
        alert(`Security Error: The request was blocked by Firebase.\n\nPossible Causes:\n1. Domain mismatch (Authorized Domains).\n2. Using HTTP instead of HTTPS on a remote IP.\n3. Broken reCAPTCHA token.\n\nTry refreshing the page.`);
      } else if (error.code === 'auth/internal-error') {
        alert("Firebase Internal Error. This often happens if the Recaptcha is stale.\n\nWe are resetting the system. Please try clicking 'Send OTP' again.");
        // Force reset
        if (window.recaptchaVerifier) {
          try { window.recaptchaVerifier.clear(); } catch (e) { }
          window.recaptchaVerifier = null;
          recaptchaVerifierRef.current = null;
        }
        initRecaptcha();
      } else {
        alert(`Error sending OTP: ${error.message}`);
      }
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
    if (!phone || !email) return alert("Enter phone and password");

    setLoading(true);
    let formattedPhone = phone.trim().replace(/\s+/g, '');
    if (!formattedPhone.startsWith("+91")) {
      formattedPhone = "+91" + formattedPhone;
    }

    try {
      const res = await fetch("/api/check-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // 'email' state is actually storing the new password based on input placeholder
        body: JSON.stringify({ phone: formattedPhone, email }),
      });

      const data = await res.json();

      if (data.exists) {
        setResult("Password Updated Successfully 🎉");
        alert("Password Updated Successfully 🎉");
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.8)',
          zIndex: 50, // Increased to cover icons (z-index 10)
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '30px' // Match card radius
        }}>
          <Loading />
        </div>
      )}

      {/* Config Error Banner */}
      {configError && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', padding: '15px', margin: '20px', borderRadius: '8px', color: '#b91c1c', zIndex: 9999, position: 'relative', fontFamily: 'sans-serif', maxWidth: '500px' }}>
          <strong style={{ fontSize: '1.1rem' }}>⚠️ Configuration Required</strong>
          <p className="mb-2 mt-2">
            Your current domain is <strong>{configError}</strong>, which is not authorized by Firebase.
          </p>
          <p>Compulsory Fix:</p>
          <ol className="pl-5 text-sm" style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Go to <strong>Firebase Console</strong> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized Domains</strong>.</li>
            <li>Click <strong>Add Domain</strong>.</li>
            <li>Enter: <strong>{configError}</strong></li>
            <li>Click Add. Wait 10 seconds. Try again.</li>
          </ol>
          <button onClick={() => setConfigError(null)} style={{ marginTop: '10px', padding: '5px 10px', border: '1px solid #b91c1c', background: 'transparent', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      )}

      <div className="signup-container">
        {/* Header Section */}
        <div className="signup-header">
          <h1 className="welcome-text">Forgot Password?</h1>
          <p className="subtitle">
            No worries! Enter your phone number<br />
            to recover your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="signup-card">
          <div className="input-group-styled">
            <div className="input-icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setPhone(val);
              }}
              className={`styled-input ${validationErrors.phone ? 'error-border' : ''}`}
            />
          </div>
          {validationErrors.phone && <p className="validation-message" style={{ marginTop: '-10px' }}>{validationErrors.phone}</p>}

          <div className="input-group-styled">
            <div className="input-icon-wrapper">
              <svg viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3 1.71 0 3.1 1.29 3.1 3v2z" />
              </svg>
            </div>
            <input
              type="password"
              placeholder="New Password"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="styled-input"
            />
          </div>

          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            {!otpSent ? (
              <div className="create-btn-container">
                <button onClick={sendOtp} disabled={loading} className="create-btn">
                  Send OTP
                </button>
              </div>
            ) : !otpVerified ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="input-group-styled">
                  <div className="input-icon-wrapper">
                    <svg viewBox="0 0 24 24">
                      <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="styled-input"
                  />
                </div>
                <div className="create-btn-container">
                  <button onClick={verifyOtp} disabled={loading} className="create-btn">
                    Verify OTP
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', margin: '15px 0' }}>
                <span style={{ color: "green", fontWeight: "bold", fontSize: '1.1rem' }}>✅ Phone Verified</span>
              </div>
            )}
          </div>

          <div className="create-btn-container">
            <button
              onClick={handleUpdateEmail}
              disabled={!otpVerified || loading}
              className="create-btn"
              style={{
                opacity: otpVerified ? 1 : 0.6,
                cursor: otpVerified ? "pointer" : "not-allowed",
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                marginTop: '10px'
              }}
            >
              Reset Password
            </button>
          </div>

          {result && <p style={{ marginTop: "10px", fontWeight: "bold", textAlign: 'center' }}>{result}</p>}
        </div>

        <div onClick={() => window.location.href = './login'} className="back-link">
          Back to Login
        </div>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}