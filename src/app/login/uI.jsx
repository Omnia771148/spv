import LoginForm from './LoginForm';
import ForgotForm from './forgotForm'
import SignUpForm from './signUpForm'


export default function TotalForm({ ShowLoginForm, ShowFPform, ShowSignUpForm, handleFPClick, handleBacktoLogin, handleSignUp }) {

    return (
        <div>

            {ShowLoginForm && <LoginForm handleFPClick={handleFPClick} handleSignUp={handleSignUp} ></LoginForm>}
            {ShowFPform && <ForgotForm handleBacktoLogin={handleBacktoLogin} ></ForgotForm>}
            {ShowSignUpForm && <SignUpForm handleBacktoLogin={handleBacktoLogin}  ></SignUpForm>}


        </div>
    )
};