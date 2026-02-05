
import React from 'react';
import './error_popup.css';

export default function ErrorPopup({ message, onClose, isSuccess = false }) {
    if (!message) return null;

    return (
        <div className="error-popup-overlay">
            <div className="error-popup-card">
                <div className="error-icon-circle" style={{ backgroundColor: isSuccess ? '#34a853' : '#ea4335' }}>
                    <span className="error-icon-cross">{isSuccess ? '✓' : '×'}</span>
                </div>
                <p className="error-text" style={{ whiteSpace: 'pre-line' }}>{message}</p>
                <button className="error-retry-btn" onClick={onClose}>
                    {isSuccess ? 'Continue' : 'Try Again'}
                </button>
            </div>
        </div>
    );
}
