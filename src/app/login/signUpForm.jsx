'use client';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Loading from '../loading/page';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './signup.css';
import ErrorPopup from './ErrorPopup';
import { showToast } from '../../toaster/page';

export default function Home({ handleBacktoLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [configError, setConfigError] = useState(null);
  const [popup, setPopup] = useState({ show: false, message: '', isSuccess: false, onConfirm: null });

  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    // Ensure window object exists
    if (typeof window === "undefined") return;

    // Attach to window to avoid React Strict Mode double-init issues
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-signup",
          {
            size: "invisible",
            callback: (response) => {
              console.log("reCAPTCHA verified");
            },
            "expired-callback": () => {
              console.log("reCAPTCHA expired");
            }
          }
        );
        recaptchaVerifierRef.current = window.recaptchaVerifier;
      } catch (err) {
        console.error("Recaptcha init error:", err);
      }
    } else {
      recaptchaVerifierRef.current = window.recaptchaVerifier;
    }

    return () => {
      // 1. Clear Firebase Recaptcha Instance
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {
          console.warn("Recaptcha clear error:", e);
        }
        window.recaptchaVerifier = null;
        recaptchaVerifierRef.current = null;
      }

      // 2. Aggressive DOM Cleanup: Remove residual Recaptcha iframes/containers from body
      // This is necessary because sometimes the invisible recaptcha leaves a transparent backdrop
      try {
        const badges = document.querySelectorAll('.grecaptcha-badge');
        badges.forEach(badge => badge.remove());

        const iframes = document.querySelectorAll('iframe[src*="google.com/recaptcha"]');
        iframes.forEach(iframe => {
          // Often wrapped in a div that is a direct child of body
          let current = iframe;
          while (current && current.parentElement !== document.body) {
            current = current.parentElement;
          }
          if (current) {
            current.remove();
          }
        });
      } catch (err) {
        console.error("Manual DOM cleanup failed:", err);
      }
    };
  }, []);

  const sendOtp = async (e) => {
    e.preventDefault();

    // 1. Mandatory Fields Validation
    const newErrors = {};
    if (!name) newErrors.name = true;
    if (!email) newErrors.email = true;
    if (!password) newErrors.password = true;
    if (!phone) newErrors.phone = true;
    if (!dateOfBirth) newErrors.dateOfBirth = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 2. Phone Validation (10 digits only)
    if (phone.length !== 10) {
      setValidationErrors(prev => ({ ...prev, phone: "Phone number must be exactly 10 digits." }));
      setErrors(prev => ({ ...prev, phone: true }));
      return;
    }

    // 3. Password Validation (8 chars, 1 capital, 1 special)
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setValidationErrors(prev => ({ ...prev, password: "Must have 8+ chars, 1 uppercase, 1 special char." }));
      setErrors(prev => ({ ...prev, password: true }));
      return;
    }

    // 4. Age Validation (18+)
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setValidationErrors(prev => ({ ...prev, dateOfBirth: "You must be at least 18 years old." }));
      setErrors(prev => ({ ...prev, dateOfBirth: true }));
      return;
    }

    setLoading(true);
    try {
      // 5. Check if user already exists in DB
      // 5. Check if user already exists in DB
      const res = await axios.get(`/api/users?phone=${phone}`);
      const userExists = res.data.length > 0;

      if (userExists) {
        setLoading(false);
        setValidationErrors(prev => ({ ...prev, phone: "User already exists with this mobile number." }));
        setErrors(prev => ({ ...prev, phone: true }));
        return;
      }

      console.log("DEBUG: Current Hostname is", window.location.hostname);
      const formattedPhone = `+91${phone}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current
      );

      window.confirmationResult = confirmationResult;
      setOtpSent(true);
      // setPopup({ show: true, message: "OTP sent successfully! 📩", isSuccess: true });
      showToast("OTP sent successfully! 📩", "success");
    } catch (error) {
      console.error("Error sending OTP:", error);
      if (error.code === 'auth/captcha-check-failed') {
        const hostname = window.location.hostname;
        setConfigError(hostname);
      } else if (error.code === 'auth/invalid-phone-number') {
        setPopup({ show: true, message: "Invalid phone number format. Please check.", isSuccess: false });
      } else if (error.code === 'auth/invalid-app-credential') {
        setPopup({ show: true, message: "Phone number invalid or try closing and reopening the application.", isSuccess: false });
      } else {
        setPopup({ show: true, message: "Error sending OTP: " + error.message, isSuccess: false });
      }

      // Force reset of recaptcha so user can try again
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
      setPopup({ show: true, message: "OTP Verified! Please accept terms to complete registration. ✅", isSuccess: true });
    } catch (error) {
      console.error("Verification/DB Error:", error);
      setPopup({ show: true, message: "Invalid OTP. Please try again. ❌", isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  // FINAL STEP: VERIFY OTP And SAVE TO DB
  const handleCreateAndRegister = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setPopup({ show: true, message: "You must accept the Terms & Conditions to proceed.", isSuccess: false });
      return;
    }

    setLoading(true);
    try {
      // 1. Verify OTP
      await window.confirmationResult.confirm(otp);

      // 2. Save to DB
      const cleanPhone = phone; // Already just numbers
      await axios.post('/api/users', { name, email, password, phone: cleanPhone, dateOfBirth });

      setPopup({
        show: true,
        message: "Account created successfully! Welcome aboard! 🎉",
        isSuccess: true,
        onConfirm: () => {
          if (handleBacktoLogin) handleBacktoLogin();
        }
      });
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        setPopup({ show: true, message: "Invalid OTP ❌", isSuccess: false });
      } else {
        console.error("Error:", error);
        setPopup({ show: true, message: "Registration failed. Please try again.", isSuccess: false });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Loading />}

      {/* Custom Popup */}
      {popup.show && (
        <ErrorPopup
          message={popup.message}
          isSuccess={popup.isSuccess}
          onClose={() => {
            if (popup.onConfirm) {
              popup.onConfirm();
            }
            setPopup({ ...popup, show: false, onConfirm: null });
          }}
        />
      )}

      {/* Config Error Banner */}
      {configError && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #ef4444', padding: '15px', margin: '20px', borderRadius: '8px', color: '#b91c1c', zIndex: 9999, position: 'relative', fontFamily: 'sans-serif' }}>
          <strong style={{ fontSize: '1.1rem' }}>⚠️ Configuration Required (Action Needed)</strong>
          <p className="mb-2 mt-2">
            Your current domain is <strong>{configError}</strong>, which is not authorized by Firebase.
          </p>
          <p>To fix this (Compulsory Step):</p>
          <ol className="pl-5 text-sm" style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Go to <strong>Firebase Console</strong> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized Domains</strong>.</li>
            <li>Click <strong>Add Domain</strong>.</li>
            <li>Enter EXACTLY this: <strong>{configError}</strong></li>
            <li>Click Add. Wait 10 seconds. Try again.</li>
          </ol>
          <p className="mt-2 text-xs" style={{ fontStyle: 'italic' }}>
            Note: Paying for Firebase does not skip this security step. It is mandatory for all projects.
          </p>
          <button onClick={() => setConfigError(null)} style={{ marginTop: '10px', padding: '5px 10px', border: '1px solid #b91c1c', background: 'transparent', color: '#b91c1c', borderRadius: '4px', cursor: 'pointer' }}>
            Close
          </button>
        </div>
      )}

      <div className="signup-container" style={{ display: loading ? 'none' : 'flex' }}>
        {/* Header Section */}
        <div className="signup-header">
          <h1 className="welcome-text">Welcome</h1>
          <p className="subtitle">
            Where you find perfect and delicious<br />
            food<br />
            At your door
          </p>
        </div>

        <div onClick={handleBacktoLogin} className="back-arrow-btn">
          <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 0 24 24" width="36px" fill="#333">
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </div>

        {/* Form Card */}
        <div className="signup-card">
          <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

            {/* User Name */}
            <div className="input-group-styled">
              <div className="input-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={errors.name ? "This field is mandatory" : "User name"}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: false }));
                }}
                value={name}
                className={`styled-input ${errors.name ? 'error-border' : ''}`}
                disabled={otpVerified}
              />
            </div>

            {/* Password */}
            <div className="input-group-styled">
              <div className="input-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3 3.1-3 1.71 0 3.1 1.29 3.1 3v2z" />
                </svg>
              </div>
              <input
                type="password"
                placeholder={errors.password ? "This field is mandatory" : "Password"}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: false }));
                  if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: "" }));
                }}
                value={password}
                className={`styled-input ${errors.password ? 'error-border' : ''}`}
                disabled={otpVerified}
              />
            </div>
            {validationErrors.password && <p className="validation-message">{validationErrors.password}</p>}

            {/* Email */}
            <div className="input-group-styled">
              <div className="input-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <input
                type="email"
                placeholder={errors.email ? "This field is mandatory" : "E-mail"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: false }));
                }}
                value={email}
                className={`styled-input ${errors.email ? 'error-border' : ''}`}
                disabled={otpVerified}
              />
            </div>

            {/* Phone Number */}
            <div className="input-group-styled">
              <div className="input-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
              </div>
              <input
                type="tel"
                placeholder={errors.phone ? "This field is mandatory" : "Phone number"}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, ''); // Allow only numbers
                  if (val.length <= 10) {
                    setPhone(val);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: false }));
                    if (validationErrors.phone) setValidationErrors(prev => ({ ...prev, phone: "" }));
                  }
                }}
                className={`styled-input ${errors.phone ? 'error-border' : ''}`}
                disabled={otpVerified}
              />
            </div>
            {validationErrors.phone && <p className="validation-message">{validationErrors.phone}</p>}

            {/* Date of Birth */}
            <div className="input-group-styled">
              <div className="input-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
              <DatePicker
                selected={dateOfBirth ? new Date(dateOfBirth) : null}
                onChange={(date) => {
                  setDateOfBirth(date ? date.toISOString().split('T')[0] : '');
                  if (errors.dateOfBirth) setErrors(prev => ({ ...prev, dateOfBirth: false }));
                  if (validationErrors.dateOfBirth) setValidationErrors(prev => ({ ...prev, dateOfBirth: "" }));
                }}
                placeholderText={errors.dateOfBirth ? "This field is mandatory" : "DD/MM/YYYY"}
                dateFormat="dd/MM/yyyy"
                className={`styled-input custom-datepicker-input ${errors.dateOfBirth ? 'error-border' : ''}`}
                disabled={otpVerified}
                wrapperClassName="w-100"
                strictParsing
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                popperPlacement="bottom-start"
                shouldCloseOnSelect={true}
              />
            </div>
            {validationErrors.dateOfBirth && <p className="validation-message">{validationErrors.dateOfBirth}</p>}

            {/* OTP Section - Appears after sending OTP, includes Terms */}
            {otpSent && (
              <>
                <div className="input-group-styled">
                  <div className="input-icon-wrapper">
                    <svg viewBox="0 0 24 24">
                      <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    onChange={(e) => setOtp(e.target.value)}
                    className="styled-input"
                  />
                </div>

                <div className="terms-section mt-2">
                  <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '5px' }}>
                    <p style={{ fontSize: '11px', color: '#666' }}>
                      By creating an account, you agree to our Terms & Conditions.
                    </p>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="termsCheck"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                    />
                    <label className="form-check-label fw-bold small" htmlFor="termsCheck">
                      I agree to the <a href="https://tandccustomer.vercel.app/" target="_blank" rel="noopener noreferrer">Terms</a>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Main Action Button */}
            {!otpSent ? (
              <div className="create-btn-container">
                <button onClick={sendOtp} className="create-btn">Verify</button>
              </div>
            ) : (
              <div className="create-btn-container">
                <button
                  onClick={handleCreateAndRegister}
                  className="create-btn"
                  disabled={!termsAccepted}
                  style={{ opacity: termsAccepted ? 1 : 0.6 }}
                >
                  Create
                </button>
              </div>
            )}

          </form>
        </div>


      </div>

      <div id="recaptcha-signup"></div>
    </div>
  );
}