import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { AlertCircle, ChevronRight, Lock } from "lucide-react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from "amazon-cognito-identity-js";

// Initialize Cognito User Pool
// Safe fallback if env variables aren't provided
const poolData = {
  UserPoolId: import.meta.env.VITE_APP_AWS_COGNITO_USER_POOL_ID || "us-east-1_dummy",
  ClientId: import.meta.env.VITE_APP_AWS_COGNITO_CLIENT_ID || "dummyclientid"
};
const userPool = new CognitoUserPool(poolData);

export default function AmazonLoginPage({ onLoginSuccess, onLogoClick }: { onLoginSuccess: () => void, onLogoClick: () => void }) {
  const { login } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "otp">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Fallback if AWS credentials aren't set up yet
    if (poolData.UserPoolId === "us-east-1_dummy") {
      console.warn("Mocking AWS Cognito because VITE_APP_AWS_COGNITO_USER_POOL_ID is missing from .env");
      setTimeout(() => {
        setIsLoading(false);
        if (mode === "signin") {
          if (!email || !password) return setError("Enter credentials");
          login(email.split("@")[0] || "User");
          onLoginSuccess();
        } else if (mode === "signup") {
          if (!name || !email || !password) return setError("Fill all fields");
          setMode("otp");
        } else if (mode === "otp") {
          login(name || email.split("@")[0] || "User");
          onLoginSuccess();
        }
      }, 800);
      return;
    }

    if (mode === "signin") {
      if (!email || !password) {
        setError("Enter your email and password");
        setIsLoading(false);
        return;
      }

      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const userData = { Username: email, Pool: userPool };
      const cognitoUserObj = new CognitoUser(userData);

      cognitoUserObj.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          setIsLoading(false);
          // Get user details to grab name
          cognitoUserObj.getUserAttributes((err, attributes) => {
            let userName = email.split("@")[0];
            if (attributes) {
              const nameAttr = attributes.find(a => a.getName() === "name");
              if (nameAttr) userName = nameAttr.getValue();
            }
            login(userName);
            onLoginSuccess();
          });
        },
        onFailure: (err) => {
          setIsLoading(false);
          setError(err.message || "Failed to sign in. Check your credentials.");
        },
      });

    } else if (mode === "signup") {
      if (!name || !email || !password) {
        setError("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const attributeList = [
        new CognitoUserAttribute({ Name: "name", Value: name }),
        new CognitoUserAttribute({ Name: "email", Value: email }),
      ];

      userPool.signUp(email, password, attributeList, [], (err, result) => {
        setIsLoading(false);
        if (err) {
          setError(err.message || "Failed to sign up.");
          return;
        }
        if (result && result.user) {
          setCognitoUser(result.user);
        }
        setMode("otp");
      });

    } else if (mode === "otp") {
      if (otp.length < 6) {
        setError("Invalid OTP format.");
        setIsLoading(false);
        return;
      }

      let targetUser = cognitoUser;
      if (!targetUser) {
        targetUser = new CognitoUser({ Username: email, Pool: userPool });
      }

      targetUser.confirmRegistration(otp, true, (err, result) => {
        setIsLoading(false);
        if (err) {
          setError(err.message || "Failed to verify OTP.");
          return;
        }
        login(name || email.split("@")[0] || "User");
        onLoginSuccess();
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center pt-8 pb-16 font-sans">
      <div className="mb-6 cursor-pointer" onClick={onLogoClick}>
        <div style={{
          backgroundImage: "url('https://m.media-amazon.com/images/G/31/gno/sprites/nav-sprite-global-1x-hm-dsk-reorg.png')",
          backgroundPosition: "-10px -51px",
          width: "97px",
          height: "30px",
          backgroundRepeat: "no-repeat",
          filter: "invert(1) hue-rotate(180deg) brightness(0) contrast(1.5)" // make it dark
        }} />
      </div>

      {error && (
        <div className="w-[350px] mb-4 border border-[#c40000] rounded-[3px] flex items-start gap-4 p-4 shadow-sm relative">
          <AlertCircle size={24} className="text-[#c40000]" />
          <div>
            <h4 className="text-[#c40000] text-sm font-bold m-0">There was a problem</h4>
            <span className="text-[13px] leading-snug">{error}</span>
          </div>
        </div>
      )}

      {mode === "signin" && (
        <div className="w-[350px] border border-[#ddd] rounded-[4px] p-[20px] pb-6 mb-[22px]">
          <h1 className="text-[28px] font-normal mb-[10px] leading-[1.2]">Sign in</h1>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-[10px]">
              <label className="font-bold text-[13px] block mb-[2px]">Email or mobile phone number</label>
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#a6a6a6] rounded-[3px] py-[3px] px-[7px] text-[13px] h-[31px] focus:outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
              />
            </div>

            <div className="mb-[14px]">
              <div className="flex justify-between items-center mb-[2px]">
                <label className="font-bold text-[13px] block">Password</label>
                <a href="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline text-[13px]">Forgot your password?</a>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#a6a6a6] rounded-[3px] py-[3px] px-[7px] text-[13px] h-[31px] focus:outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#f0c14b] border border-[#a88734] rounded-[3px] py-[5px] text-[13px] h-[29px] font-normal shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] hover:bg-[#f4d078] active:bg-[#f0c14b] active:shadow-[0_1px_3px_rgba(0,0,0,0.2)_inset]"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-[12px] mt-4 leading-relaxed tracking-normal">
            By continuing, you agree to Amazon's <a href="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">Conditions of Use</a> and <a href="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">Privacy Notice</a>.
          </p>

          <div className="mt-4 pt-4 border-t border-[#e7e7e7]">
             <a href="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline text-[13px] flex items-center group">
               <ChevronRight size={14} className="text-gray-500 group-hover:text-gray-700 font-bold" /> Need help?
             </a>
          </div>

          {/* AWS Mock Label */}
          <div className="mt-6 pt-4 border-t border-[#e7e7e7] flex items-center gap-2">
             <Lock size={14} className="text-gray-500" />
             <span className="text-[11px] text-gray-500">Secured by AWS Cognito</span>
          </div>
        </div>
      )}

      {mode === "signin" && (
        <div className="w-[350px] flex flex-col items-center">
          <div className="w-full relative flex items-center justify-center mb-3">
             <div className="absolute w-full h-[1px] bg-[#e7e7e7]"></div>
             <span className="bg-white px-2 text-[12px] text-[#767676] relative z-10">New to Amazon?</span>
          </div>
          <button 
            onClick={() => { setMode("signup"); setError(""); }}
            className="w-full bg-[#e7e9ec] border border-[#adb1b8] rounded-[3px] py-[5px] text-[13px] h-[29px] shadow-[0_1px_0_rgba(255,255,255,0.6)_inset] hover:bg-[#e3e6e8]"
          >
            Create your Amazon account
          </button>
        </div>
      )}

      {mode === "signup" && (
         <div className="w-[350px] border border-[#ddd] rounded-[4px] p-[20px] pb-6 mb-[22px]">
         <h1 className="text-[28px] font-normal mb-[10px] leading-[1.2]">Create account</h1>
         
         <form onSubmit={handleSubmit}>
           <div className="mb-[10px]">
             <label className="font-bold text-[13px] block mb-[2px]">Your name</label>
             <input 
               type="text" 
               placeholder="First and last name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               className="w-full border border-[#a6a6a6] rounded-[3px] py-[3px] px-[7px] text-[13px] h-[31px] focus:outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow placeholder:text-gray-400"
             />
           </div>

           <div className="mb-[10px]">
             <label className="font-bold text-[13px] block mb-[2px]">Mobile number or email</label>
             <input 
               type="text" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full border border-[#a6a6a6] rounded-[3px] py-[3px] px-[7px] text-[13px] h-[31px] focus:outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
             />
           </div>

           <div className="mb-[14px]">
             <label className="font-bold text-[13px] block mb-[2px]">Password</label>
             <input 
               type="password" 
               placeholder="At least 6 characters"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full border border-[#a6a6a6] rounded-[3px] py-[3px] px-[7px] text-[13px] h-[31px] focus:outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow placeholder:text-gray-400"
             />
             <div className="text-[11px] flex gap-1 mt-1 font-medium">
               <AlertCircle size={14} className="text-blue-500" />
               Passwords must be at least 6 characters.
             </div>
           </div>

           <p className="text-[12px] font-normal mb-4">
             To verify your number, we will send you a text message with a temporary code. Message and data rates may apply.
           </p>

           <button 
             type="submit" 
             disabled={isLoading}
             className="w-full bg-[#f0c14b] border border-[#a88734] rounded-[3px] py-[5px] text-[13px] h-[29px] font-normal shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] hover:bg-[#f4d078] active:bg-[#f0c14b] active:shadow-[0_1px_3px_rgba(0,0,0,0.2)_inset]"
           >
             {isLoading ? "Verifying..." : "Verify mobile number"}
           </button>
         </form>

         {/* AWS Mock Label */}
         <div className="mt-8 pt-4 border-t border-[#e7e7e7] flex items-center gap-2">
            <Lock size={14} className="text-gray-500" />
            <span className="text-[11px] text-gray-500">Secured by AWS Cognito</span>
         </div>
         
         <div className="mt-4 pt-4 border-t border-[#e7e7e7]">
            <p className="text-[13px]">
              Already have an account? <span onClick={() => { setMode("signin"); setError(""); }} className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">Sign in <ChevronRight size={14} className="inline text-gray-400 -ml-1"/></span>
            </p>
         </div>
       </div>
      )}

      {mode === "otp" && (
        <div className="w-[350px] border border-[#ddd] rounded-[4px] p-[20px] pb-6 mb-[22px]">
          <h1 className="text-[28px] font-normal mb-[10px] leading-[1.2]">Verify email address</h1>
          <p className="text-[13px] mb-4">
            To verify your email, we've sent a One Time Password (OTP) to <span className="font-bold">{email}</span> <span className="text-[#0066c0] hover:text-[#c45500] hover:underline cursor-pointer">(Change)</span>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-[14px]">
               <label className="font-bold text-[13px] block mb-[2px]">Enter OTP</label>
               <input 
                 type="text" 
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 className="w-full border border-[#a6a6a6] rounded-[3px] py-[3px] px-[7px] text-[13px] h-[31px] focus:outline-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] transition-shadow"
               />
            </div>
            <button 
               type="submit" 
               disabled={isLoading}
               className="w-full bg-[#f0c14b] border border-[#a88734] rounded-[3px] py-[5px] text-[13px] h-[29px] font-normal shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] hover:bg-[#f4d078] active:bg-[#f0c14b] active:shadow-[0_1px_3px_rgba(0,0,0,0.2)_inset]"
             >
               {isLoading ? "Creating account..." : "Create your Amazon account"}
             </button>
          </form>

          <p className="text-[13px] mt-4 text-center">
             <a href="#" className="text-[#0066c0] hover:text-[#c45500] hover:underline">Resend OTP</a>
          </p>

           {/* AWS Mock Label */}
           <div className="mt-8 pt-4 border-t border-[#e7e7e7] flex items-center gap-2">
            <Lock size={14} className="text-gray-500" />
            <span className="text-[11px] text-gray-500">Secured by AWS Cognito</span>
         </div>
        </div>
      )}

      <div className="w-[350px] mt-4 flex flex-col items-center border-t border-transparent pt-6 border-gradient relative shadow-[0_-1px_0_rgba(0,0,0,0.05)_inset]">
         <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#d5d5d5] to-transparent"></div>
         <div className="flex gap-6 text-[11px] text-[#0066c0] mb-2">
            <a href="#" className="hover:underline hover:text-[#c45500]">Conditions of Use</a>
            <a href="#" className="hover:underline hover:text-[#c45500]">Privacy Notice</a>
            <a href="#" className="hover:underline hover:text-[#c45500]">Help</a>
         </div>
         <span className="text-[11px] text-[#767676]">© 1996-2023, Amazon.com, Inc. or its affiliates</span>
      </div>
    </div>
  );
}
