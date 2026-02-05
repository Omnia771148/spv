'use client';
import { useState, useEffect } from "react";
import TotalForm from "./uI";


const LoginInfoPage = () => {
    const [showLoginForm, setShowLoginForm] = useState(true);
    const [showFPform, setShowFPform] = useState(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);

    // Sync state with URL hash to support mobile back gesture
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash === '#forgot') {
                setShowFPform(true);
                setShowLoginForm(false);
                setShowSignUpForm(false);
            } else if (hash === '#signup') {
                setShowSignUpForm(true);
                setShowLoginForm(false);
                setShowFPform(false);
            } else {
                // Default / Empty hash -> Login Form
                setShowLoginForm(true);
                setShowFPform(false);
                setShowSignUpForm(false);
            }
        };

        // Run on mount to handle direct links or reloads
        handleHashChange();

        // Listen for back/forward navigation
        window.addEventListener('popstate', handleHashChange);
        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('popstate', handleHashChange);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const handleFPClick = () => {
        // Push hash to history so back button works
        window.location.hash = 'forgot';
    };

    const handleSignUp = () => {
        // Push hash to history so back button works
        window.location.hash = 'signup';
    };

    const handleBacktoLogin = () => {
        // Helper to clear hash. 
        // If we have a hash, going back invokes the listener to change state.
        if (window.location.hash === '#forgot' || window.location.hash === '#signup') {
            window.history.back();
        } else {
            // Fallback for safety
            window.location.hash = '';
            setShowLoginForm(true);
            setShowFPform(false);
            setShowSignUpForm(false);
        }
    };

    return (
        <TotalForm
            ShowLoginForm={showLoginForm}
            ShowFPform={showFPform}
            ShowSignUpForm={showSignUpForm}

            handleFPClick={handleFPClick}
            handleBacktoLogin={handleBacktoLogin}
            handleSignUp={handleSignUp}

        />
    )

};
export { LoginInfoPage };
