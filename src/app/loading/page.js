'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div className="container text-center">
        {/* Minimalist & Premium Brand Presentation */}
        <div className="brand-header mb-4">
          <div className="brand-status-dot"></div>
          <h2 className="brand-title">SPV</h2>
        </div>

        {/* Ultra-lightweight Sleek Progress Bar */}
        <div className="loader-track">
          <div className="loader-glide"></div>
        </div>

        <div className="mt-4">
          <h5 className="loading-text">Wait for a Second...</h5>
          <p className="loading-subtext">Everything is getting ready for you</p>
        </div>

        <style>
          {`
            .brand-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
            }

            .brand-status-dot {
              width: 12px;
              height: 12px;
              background-color: #FF6B00;
              border-radius: 50%;
              animation: pulseGlow 2s infinite;
            }

            .brand-title {
              font-weight: 900;
              letter-spacing: 3px;
              color: #2D3436;
              margin: 0;
            }

            .loader-track {
              width: 180px;
              height: 4px;
              background-color: #F1F1F1;
              border-radius: 20px;
              margin: 0 auto;
              overflow: hidden;
              position: relative;
            }

            .loader-glide {
              width: 40%;
              height: 100%;
              background: linear-gradient(90deg, #FF6B00, #FF9F43);
              border-radius: 20px;
              position: absolute;
              animation: glideAlong 1.5s infinite ease-in-out;
            }

            @keyframes glideAlong {
              0% { left: -40%; width: 20%; }
              50% { width: 50%; }
              100% { left: 100%; width: 20%; }
            }

            @keyframes pulseGlow {
              0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.5); }
              70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(255, 107, 0, 0); }
              100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
            }

            .loading-text {
              font-weight: 700;
              color: #1A1A1A;
              margin-bottom: 2px;
            }

            .loading-subtext {
              color: #888;
              font-size: 0.9rem;
              font-weight: 500;
            }
          `}
        </style>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  }
};