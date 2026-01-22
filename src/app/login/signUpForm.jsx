'use client';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Loading from '../loading/page';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './signup.css';

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

  const recaptchaVerifierRef = useRef(null);

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

    setLoading(true); // ✅ Start loading
    try {
      const formattedPhone = `+91${phone}`;

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
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Start loading
    try {
      const result = await window.confirmationResult.confirm(otp);
      setOtpVerified(true);
      alert("OTP Verified! Please accept terms to complete registration.");
    } catch (error) {
      console.error("Verification/DB Error:", error);
      alert("Invalid OTP ❌");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  // FINAL STEP: DATABASE SAVE
  // FINAL STEP: VERIFY OTP And SAVE TO DB
  const handleCreateAndRegister = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return alert("You must accept the Terms & Conditions to proceed.");

    setLoading(true);
    try {
      // 1. Verify OTP
      await window.confirmationResult.confirm(otp);

      // 2. Save to DB
      // 2. Save to DB
      const cleanPhone = phone; // Already just numbers
      await axios.post('/api/users', { name, email, password, phone: cleanPhone, dateOfBirth });

      alert("Account created successfully! ✅");
      window.location.href = "./";
    } catch (error) {
      if (error.code === 'auth/invalid-verification-code') {
        // Expected error for wrong OTP, suppress console noise
        alert("Invalid OTP ❌");
      } else {
        console.error("Error:", error);
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Loading />}

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
                placeholderText={errors.dateOfBirth ? "This field is mandatory" : "DD/MM/YEAR"}
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

        <div onClick={handleBacktoLogin} className="back-link">
          Back to Login
        </div>
      </div>

      <div id="recaptcha-container"></div>
    </div>
  );
}