import Home from './page';
import ForgotForm from './forgotForm'
import SignUpForm from './signUpForm'


export default function TotalForm({ShowLoginForm,ShowFPform,ShowSignUpForm,handleFPClick,handleBacktoLogin,handleSignUp}){

    return(
        <div>
      
           {ShowLoginForm && <Home handleFPClick={handleFPClick} handleSignUp={handleSignUp} ></Home>}
           {ShowFPform && <ForgotForm handleBacktoLogin={handleBacktoLogin} ></ForgotForm>}
           {ShowSignUpForm && <SignUpForm handleBacktoLogin={handleBacktoLogin}  ></SignUpForm>}


        </div>
    )
};