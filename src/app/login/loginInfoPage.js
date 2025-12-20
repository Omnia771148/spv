'use client';
import { useState } from "react";
import TotalForm from "./uI";


const LoginInfoPage = () => {
    const [showLoginForm, setShowLoginForm] = useState(true);
    const [showFPform, setShowFPform] = useState(false);
    const [showSignUpForm, setShowSignUpForm] = useState(false);
    

    const handleFPClick = () => {
        setShowFPform(true);
        setShowLoginForm(false);
        setShowSignUpForm(false);
    };

    const handleBacktoLogin=()=>{
        setShowFPform(false);
        setShowLoginForm(true);
        setShowSignUpForm(false);
    };
    
    const handleSignUp=()=>{
        setShowFPform(false);
        setShowLoginForm(false);
        setShowSignUpForm(true);
    };

    return(
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

