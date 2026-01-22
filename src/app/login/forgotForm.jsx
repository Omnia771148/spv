"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Loading from '../loading/page';

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
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto", position: 'relative' }}>

      {/* Config Error Banner */}
      {configError && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', padding: '15px', marginBottom: '20px', borderRadius: '8px', color: '#b91c1c', fontFamily: 'sans-serif' }}>
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

      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.8)',
          zIndex: 10,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Loading />
        </div>
      )}

      <h2>Update Password for Phone</h2>

      <div style={{ marginBottom: "10px" }}>
        <input
          type="tel"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            if (val.length <= 10) setPhone(val);
          }}
          style={{ padding: "8px", width: "100%", marginBottom: "5px", border: validationErrors.phone ? '1px solid red' : '1px solid #ccc' }}
        />
        {validationErrors.phone && <small style={{ color: 'red', display: 'block', marginBottom: '10px' }}>{validationErrors.phone}</small>}

        <input
          type="password"
          placeholder="Enter new password"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px", width: "100%" }}
        />
      </div>

      <div style={{ marginTop: "15px", marginBottom: "15px" }}>
        {!otpSent ? (
          <button onClick={sendOtp} disabled={loading} style={btnStyle}>
            Send OTP
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
            <button onClick={verifyOtp} disabled={loading} style={btnStyle}>
              Verify OTP
            </button>
          </>
        ) : (
          <span style={{ color: "green", fontWeight: "bold" }}>✅ Phone Verified</span>
        )}
      </div>

      <button
        onClick={handleUpdateEmail}
        disabled={!otpVerified || loading}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: otpVerified ? "#0070f3" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: otpVerified ? "pointer" : "not-allowed",
          fontWeight: "bold"
        }}
      >
        Update Password
      </button>

      {result && <p style={{ marginTop: "20px", fontWeight: "bold" }}>{result}</p>}

      {/* Recaptcha container must ALWAYS be present */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

const btnStyle = {
  padding: "8px 15px",
  cursor: "pointer",
  backgroundColor: "#eee",
  border: "1px solid #ccc",
  borderRadius: "4px"
};