import { useClerk, useAuth, useSignUp,useSignIn, useUser, useSession } from "@clerk/clerk-react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useCallback } from "react"
import { FcGoogle } from "react-icons/fc";
import {FaSpinner} from "react-icons/fa";

const SignUpPage = () => {
  const { signUp, isLoaded } = useSignUp()
  const { signOut, setActive } = useClerk()
  const { session } = useSession()
  const { isSignedIn, getToken, userId } = useAuth()
  const {signIn} = useSignIn()
  const { user } = useUser()
  const [username, setUsername] = useState("")
  const [emailAddress, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [showVerification, setShowVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({})
  const navigate_to = useNavigate()

  useEffect(() => {
    const authState = { 
      isSignedIn, 
      userId, 
      hasUser: !!user,
      hasSession: !!session
    }
    console.log("Auth state:", authState)
    setDebugInfo(authState)
  }, [isSignedIn, userId, user, session])

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const handleAutoSignOut = async () => {
        try {
          await signOut();
          console.log("Auto-signed out on sign-up page.");
        } catch (err) {
          console.error("Auto sign-out error:", err);
        }
      };
      handleAutoSignOut();
    }
  }, [isLoaded, isSignedIn, signOut]);


const handleGoogleSignUp = useCallback(async () => {
    if (!isLoaded) return;

    setIsGoogleLoading(true);
    try {
      // Sign out first as fallback
      await signOut();

      // Reset Turnstile
      if (window.turnstile) {
        window.turnstile.reset();
      }

      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso", // Your callback URL
        redirectUrlComplete: "/home", // Where to go after success
      });
    } catch (error) {
      console.error("Google SignUp Error:", error);
      if (error.message?.includes("already signed in")) {
        alert("You were already signed in. Signed out—please try again.");
      } else {
        alert("Google sign-up failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isLoaded, signOut, signUp]);


  const validateForm = () => {
    if (!username.trim()) {
      alert("Username is required")
      return false
    }
    if (!emailAddress.trim()) {
      alert("Email is required")
      return false
    }
    if (!password.trim()) {
      alert("Password is required")
      return false
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long")
      return false
    }
    return true
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!isLoaded || !validateForm()) return

    setIsLoading(true)
    try {
      await signOut()

      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      })

      setShowVerification(true)
      alert("Verification code sent to your email.")
    } catch (err) {
      console.error("SignUp error:", err)
      alert(err.errors?.[0]?.message || "Signup failed")
    } finally {
      setIsLoading(false)
    }
  }

const handleVerify = async () => {
  if (!isLoaded || !verificationCode.trim()) {
    alert("Please enter the verification code");
    return;
  }

  setIsVerifying(true);

  try {
    console.log("Starting email verification...");

    const result = await signUp.attemptEmailAddressVerification({
      code: verificationCode,
    });

    console.log("Verification result:", result);

    if (result.status === "complete") {
      // Set the session directly
      await setActive({ session: result.createdSessionId });

      // Get token and Clerk user ID
      const token = await getToken();
      const clerkId = result.createdUserId;

      
      if (!token || !clerkId) {
        throw new Error("Session was set but no token or user ID found.");
      }

      alert("Signup successful!");
      navigate_to('/home')
    } else {
      console.error("Verification incomplete:", result);
      alert("Verification incomplete. Please try again.");
    }
  } catch (err) {
    console.error("Verification error:", err);

    if (err.errors?.length > 0) {
      alert(err.errors[0].message);
    } else if (err.message) {
      alert(err.message);
    } else {
      alert("Verification failed. Please try again.");
    }
  } finally {
    setIsVerifying(false);
  }
};

return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900">
    <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">
        Welcome to Containr!
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Create your account to get started
      </p>

      <form onSubmit={handleSignUp} className="space-y-5">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Gand Masti"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || showVerification}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="gantmasti@gmail.com"
            value={emailAddress}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || showVerification}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || showVerification}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            required
            minLength={8}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 8 characters
          </p>
        </div>

        {/* Verification */}
        {showVerification && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Enter Verification Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              disabled={isVerifying}
              className="w-full px-4 py-2 bg-white border border-blue-400 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
            <button
              onClick={handleVerify}
              disabled={isVerifying || !verificationCode.trim()}
              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 rounded-lg font-medium shadow-md transition"
            >
              {isVerifying ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        )}

        {/* Signup */}
        {!showVerification && (
          <>
            <div id="clerk-captcha" />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg shadow-md transition"
            >
              {isLoading ? "Creating Account..." : "Sign Up →"}
            </button>
          </>
        )}
      </form>
      
     <div className="flex flex-col items-center gap-4 w-full">
          {/* Divider with "or" */}
          <div className="flex items-center w-full mt-3">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

                {/* Google Button */}
            <button
              onClick={handleGoogleSignUp}
              disabled={isGoogleLoading}
              className={`flex items-center justify-center gap-3 w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2 font-medium shadow-sm transition 
                ${isGoogleLoading ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-gray-100"}`}
            >
              {isGoogleLoading ? (
                <>
                  <FaSpinner className="h-5 w-5 animate-spin" />
                  Almost there…
                </>
              ) : (
                <>
                  <FcGoogle size={22} />
                  Continue with Google
                </>
              )}
            </button>      
       </div>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button
          className="text-blue-600 hover:underline font-medium"
          disabled={isLoading || isVerifying}
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
)
}

export default SignUpPage
