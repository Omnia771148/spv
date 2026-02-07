'use client';
import { useState, useEffect } from 'react';

export default function GlobalServiceCheck() {
    const [isOutOfZone, setIsOutOfZone] = useState(false);

    useEffect(() => {
        // Only check on mount (page refresh or navigation)
        const checkStatus = () => {
            const status = localStorage.getItem("isServiceAvailable");
            setIsOutOfZone(status === "false");
        };

        checkStatus();

        // Listen for changes if localStorage is updated in another tab/component
        window.addEventListener('storage', checkStatus);
        return () => window.removeEventListener('storage', checkStatus);
    }, []);

    if (!isOutOfZone) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '25px',
            zIndex: 9999,
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px',
            maxWidth: '250px',
            animation: 'fadeIn 0.5s ease-in-out'
        }}>
            <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
            <span>Service Unavailable</span>
        </div>
    );
}
