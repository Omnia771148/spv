'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Loading() {
  return (
    <div style={styles.overlay}>
      <div className="container text-center">
        {/* Logo Brand Presentation */}
        <div className="brand-header mb-4">
          <img
            src="/spv-logo.png"
            alt="SPV Logo"
            className="brand-logo"
          />
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
            }

            .brand-logo {
              width: 120px;
              height: 120px;
              object-fit: contain;
            }

            .loader-track {
              width: 180px;
              height: 4px;
              background-color: #E8E2D0;
              border-radius: 20px;
              margin: 0 auto;
              overflow: hidden;
              position: relative;
            }

            .loader-glide {
              width: 40%;
              height: 100%;
              background: linear-gradient(90deg, #B5A070, #D4C08A);
              border-radius: 20px;
              position: absolute;
              animation: glideAlong 1.5s infinite ease-in-out;
            }

            @keyframes glideAlong {
              0% { left: -40%; width: 20%; }
              50% { width: 50%; }
              100% { left: 100%; width: 20%; }
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
    backgroundColor: '#F8F5EB',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999,
  }
};