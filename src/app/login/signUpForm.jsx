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
      
      const cleanPhone = phone.replace("+91", "").trim();

      // ✅ Database Save
      await axios.post('/api/users', { name, email: password, phone: cleanPhone });
      
      alert("Account created successfully! ✅");
      window.location.href = "./";
    } catch (error) {
      console.error("Verification/DB Error:", error);
      alert("Invalid OTP or Database error ❌");
    } finally {
      setLoading(false); // ✅ Stop loading
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
          <p className="text-success fw-bold">✅ Verified</p>
        )}
        <br />
        <button onClick={handleBacktoLogin} className="btn btn-link mt-2">Back to Login</button>
      </form>
      
      <div id="recaptcha-container"></div>
    </div>
  );
}