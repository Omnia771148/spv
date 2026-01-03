'use client';
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { auth } from "../../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// ✅ Import your custom Loading component
import Loading from '../loading/page'; 

export default function Home({ handleBacktoLogin }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState("+91");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  // ✅ Added loading state
  const [loading, setLoading] = useState(false);
  
  // NEW STATE FOR TERMS
  const [termsAccepted, setTermsAccepted] = useState(false);

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
    if (!phone) return alert("Please enter a phone number");

    setLoading(true); // ✅ Start loading
    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      
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
  const handleFinalRegister = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return alert("You must accept the Terms & Conditions to proceed.");
    
    setLoading(true);
    try {
      const cleanPhone = phone.replace("+91", "").trim();
      await axios.post('/api/users', { name, email: password, phone: cleanPhone });
      
      alert("Account created successfully! ✅");
      window.location.href = "./";
    } catch (error) {
      console.error("Database Error:", error);
      alert("Database error ❌");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show Spinning Pizza Loading Screen
  if (loading) {
    return <Loading />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={(e) => e.preventDefault()}>
        <h1>Name</h1>
        <input type="text" onChange={(e) => setName(e.target.value)} className="form-control mb-2" /><br />

        <h1>Password</h1>
        <input type="password" onChange={(e) => setPassword(e.target.value)} className="form-control mb-2" /><br />

        <h1>Phone Number</h1>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-control mb-2" /><br />

        {!otpSent ? (
          <button onClick={sendOtp} className="btn btn-primary w-100">Send OTP</button>
        ) : !otpVerified ? (
          <>
            <input type="text" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} className="form-control mb-2" /><br />
            <button onClick={verifyOtp} className="btn btn-success w-100">Verify OTP</button>
          </>
        ) : (
          <div className="mt-4 p-3 border rounded bg-light">
            <p className="text-success fw-bold">✅ Phone Verified</p>
            <hr />
            <h5 className="fw-bold">11 . Acceptance of Terms & Conditions</h5>
            <p style={{ fontSize: '12px', color: '#666' }}>
              By registering, accessing, or using the platform, the Customer acknowledges that they have read, understood, and agreed to be bound by these Terms & Conditions, including all policies, guidelines, and amendments published on the Platform. Continued use of the Platform constitutes acceptance of any updated or modified Terms & Conditions. The Customer represents and warrants that they are legally capable of entering into a binding agreement and that all information provided during registration is accurate and complete. If the Customer does not agree to these Terms & Conditions, they must discontinue using the Platform immediately.
            </p>
            <div className="form-check">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="termsCheck" 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)} 
              />
              <label className="form-check-label fw-bold" htmlFor="termsCheck">
                I agree to the <a href="https://tandccustomer.vercel.app/" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
              </label>              
            </div>
            <button 
              onClick={handleFinalRegister} 
              className="btn btn-primary w-100 mt-3"
              disabled={!termsAccepted}
            >
              Create Account
            </button>
          </div>
        )}
        <br />
        <button onClick={handleBacktoLogin} className="btn btn-link mt-2">Back to Login</button>
      </form>
      
      <div id="recaptcha-container"></div>
    </div>
  );
}