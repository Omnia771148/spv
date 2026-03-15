'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
    const router = useRouter();

    const styles = {
        container: {
            padding: '20px',
            backgroundColor: '#F8F5EB',
            minHeight: '100vh',
            fontFamily: "'Poppins', sans-serif",
            color: '#333',
            lineHeight: '1.6',
            paddingBottom: '40px',
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '30px',
            gap: '15px',
            position: 'sticky',
            top: 0,
            backgroundColor: '#F8F5EB',
            padding: '10px 0',
            zIndex: 10,
        },
        backButton: {
            border: 'none',
            background: 'white',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
        },
        titleContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: 0,
        },
        subtitle: {
            fontSize: '0.8rem',
            color: '#666',
        },
        card: {
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.02)',
        },
        sectionHeading: {
            fontSize: '1.2rem',
            fontWeight: '600',
            marginBottom: '15px',
            color: '#e63946',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        text: {
            fontSize: '0.95rem',
            color: '#444',
            marginBottom: '15px',
        },
        tableWrapper: {
            overflowX: 'auto',
            marginBottom: '20px',
            borderRadius: '12px',
            border: '1px solid #eee',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
        },
        th: {
            backgroundColor: '#f9f9f9',
            padding: '12px',
            textAlign: 'left',
            fontWeight: '600',
            borderBottom: '2px solid #eee',
        },
        td: {
            padding: '12px',
            borderBottom: '1px solid #eee',
        },
        highlightBox: {
            backgroundColor: '#fff5f5',
            padding: '15px',
            borderRadius: '12px',
            borderLeft: '4px solid #e63946',
            marginTop: '10px',
            fontSize: '0.9rem',
        },
        list: {
            paddingLeft: '20px',
            fontSize: '0.95rem',
            color: '#444',
        },
        listItem: {
            marginBottom: '10px',
        },
        footer: {
            textAlign: 'center',
            marginTop: '40px',
            padding: '20px',
            borderTop: '1px solid #ddd',
        },
        commitment: {
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111',
            fontStyle: 'italic',
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button style={styles.backButton} onClick={() => router.back()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <div style={styles.titleContainer}>
                    <h1 style={styles.title}>Privacy Policy</h1>
                    <span style={styles.subtitle}>Food Delivery Application — Kurnool</span>
                </div>
            </div>

            {/* Intro Card */}
            <div style={styles.card}>
                <p style={{ ...styles.text, fontWeight: 'bold' }}>Last Updated: 15 March 2026</p>
                <p style={styles.text}>
                    Your privacy is important to us. This Privacy Policy explains how our application collects, uses, and protects your information when you use our services. By using our app, you agree to the terms described in this document.
                </p>
            </div>

            {/* Section 1: Information Collection */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>1. Information We Collect</h2>
                <p style={styles.text}>We collect the following categories of personal data when you register and use our application:</p>
                
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Data Type</th>
                                <th style={styles.th}>Specific Items</th>
                                <th style={styles.th}>Purpose</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={styles.td}><strong>Personal Info</strong></td>
                                <td style={styles.td}>Name, Phone, Email, Date of Birth</td>
                                <td style={styles.td}>Account creation & identity verification</td>
                            </tr>
                            <tr>
                                <td style={styles.td}><strong>Delivery Details</strong></td>
                                <td style={styles.td}>Flat No, Street, Landmark, Saved Labels</td>
                                <td style={styles.td}>Accurate delivery routing to your doorstep</td>
                            </tr>
                            <tr>
                                <td style={styles.td}><strong>Location Data</strong></td>
                                <td style={styles.td}>Precise GPS Coordinates (Lat/Lng)</td>
                                <td style={styles.td}>Kurnool service area check & distance calculation</td>
                            </tr>
                            <tr>
                                <td style={styles.td}><strong>Financial Info</strong></td>
                                <td style={styles.td}>Razorpay Transaction IDs</td>
                                <td style={styles.td}>Secure payment validation</td>
                            </tr>
                            <tr>
                                <td style={styles.td}><strong>System Data</strong></td>
                                <td style={styles.td}>Coins Balance, Block Status</td>
                                <td style={styles.td}>Loyalty rewards and app security management</td>
                            </tr>
                            <tr>
                                <td style={styles.td}><strong>Feedback Data</strong></td>
                                <td style={styles.td}>Restaurant & Delivery Boy Reviews</td>
                                <td style={styles.td}>Improving service quality and accountability</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style={styles.highlightBox}>
                    <strong>Why do we collect Date of Birth?</strong><br/>
                    Your date of birth is used to verify your age eligibility and personalise your account experience. It is never shared with third-party advertisers.
                </div>
            </div>

            {/* Section 2: How We Use Your Data */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>2. How We Use Your Data</h2>
                <p style={styles.text}>We use the information collected strictly for the following purposes:</p>
                <ul style={styles.list}>
                    <li style={styles.listItem}><strong>Account Management:</strong> To create, maintain, and authenticate your user account using Firebase Phone OTP.</li>
                    <li style={styles.listItem}><strong>Order Processing:</strong> To process, deliver, and track your food orders accurately and efficiently.</li>
                    <li style={styles.listItem}><strong>Service Area Verification:</strong> Upon opening the app, your GPS coordinates are checked against our Kurnool polygon boundary.</li>
                    <li style={styles.listItem}><strong>Delivery Distance Calculation:</strong> Your GPS location and the restaurant location are used to calculate the exact delivery distance.</li>
                    <li style={styles.listItem}><strong>Payment Processing:</strong> Razorpay secrets are used to verify the legitimacy of each transaction before finalising your order.</li>
                    <li style={styles.listItem}><strong>Session Management:</strong> A login timestamp is stored locally so that you remain logged in for up to 30 days.</li>
                    <li style={styles.listItem}><strong>Customer Support:</strong> Your contact details may be used to respond to support queries and send service updates.</li>
                    <li style={styles.listItem}><strong>Loyalty Rewards:</strong> A Coins balance is maintained on your profile and may be applied as discounts or loyalty rewards.</li>
                </ul>
            </div>

            {/* Section 3: Data Security */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>3. Data Security & Storage</h2>
                <ul style={styles.list}>
                    <li style={styles.listItem}>All data is securely stored in MongoDB databases hosted on Vercel's professional cloud infrastructure.</li>
                    <li style={styles.listItem}>Passwords and sensitive information are encrypted at rest.</li>
                    <li style={styles.listItem}>All data transmitted between your device and our servers is encrypted in transit using HTTPS (TLS).</li>
                    <li style={styles.listItem}>We do not sell, rent, or share your personal data with third-party advertisers under any circumstances.</li>
                </ul>

                <div style={{...styles.highlightBox, borderLeftColor: '#2b9348', backgroundColor: '#f0fff4' }}>
                    <strong>Play Store Data Safety Note</strong><br/>
                    Is data encrypted in transit? <strong>YES</strong> — all communication uses HTTPS via Vercel's secure hosting. <br/>
                    Can users request deletion? <strong>YES</strong> — through Profile Settings or via the Contact Us section in the app.
                </div>
            </div>

            {/* Section 4: Third-Party Services */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>4. Third-Party Services</h2>
                <p style={styles.text}>Our application integrates with the following trusted third-party providers:</p>
                <ul style={styles.list}>
                    <li style={styles.listItem}><strong>Firebase (Google):</strong> Provides phone number OTP authentication. Phone numbers are processed by Firebase in accordance with Google's Privacy Policy.</li>
                    <li style={styles.listItem}><strong>Razorpay:</strong> Handles all payment transactions. Financial data such as card numbers is managed directly by Razorpay and is never stored on our servers.</li>
                    <li style={styles.listItem}><strong>Google Maps / Geolocation API:</strong> Used for address verification and distance calculation.</li>
                </ul>
            </div>

            {/* Section 5: Data Retention */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>5. Data Retention</h2>
                <ul style={styles.list}>
                    <li style={styles.listItem}>Order history is retained to allow you to view past purchases and for our internal revenue records.</li>
                    <li style={styles.listItem}>Your session data (login timestamp) is automatically cleared after 30 days of inactivity.</li>
                    <li style={styles.listItem}>Upon account deletion, all personal data is removed from our systems within 30 days.</li>
                </ul>
            </div>

            {/* Section 6: User Rights */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>6. Your Rights</h2>
                <ul style={styles.list}>
                    <li style={styles.listItem}><strong>Access:</strong> You may request a copy of the personal data we hold about you.</li>
                    <li style={styles.listItem}><strong>Correction:</strong> You may update your personal information via your Profile settings.</li>
                    <li style={styles.listItem}><strong>Deletion:</strong> You may request that your account and all associated data be permanently deleted.</li>
                    <li style={styles.listItem}><strong>Restriction:</strong> You may request that we restrict how we use your data.</li>
                </ul>
            </div>

            {/* Section 7, 8, 9 */}
            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>7. Children's Privacy</h2>
                <p style={styles.text}>Our application is not intended for use by individuals under the age of 18. If you believe a child has provided us with personal information, please contact us immediately.</p>
            </div>

            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>8. Changes to This Policy</h2>
                <p style={styles.text}>We may update this Privacy Policy from time to time. Continued use of the application after changes constitutes your acceptance of the revised policy.</p>
            </div>

            <div style={styles.card}>
                <h2 style={styles.sectionHeading}>9. Contact Us</h2>
                <p style={styles.text}>If you have any questions or requests, please reach out to us through:</p>
                <ul style={styles.list}>
                    <li style={styles.listItem}><strong>In-App:</strong> Navigate to the 'Contact Us' section.</li>
                    <li style={styles.listItem}><strong>Email:</strong> Available in the app's Help & Support section.</li>
                </ul>
            </div>

            <div style={styles.footer}>
                <p style={styles.commitment}>"Our Commitment: We are committed to handling your data responsibly, transparently, and in accordance with applicable data protection regulations. Your trust is the foundation of our service."</p>
                <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '15px' }}>© {new Date().getFullYear()} Food Delivery Application. Kurnool, Andhra Pradesh.</p>
            </div>
        </div>
    );
}
