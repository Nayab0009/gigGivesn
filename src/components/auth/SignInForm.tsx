"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import Checkbox from "@/components/form/input/Checkbox"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import { EyeCloseIcon, EyeIcon } from "@/icons"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { toast, ToastContainer, type ToastOptions } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { LogIn, CheckCircle } from "lucide-react"
import Image from "next/image"

// Define custom toast style type
interface CustomToastStyle extends Omit<ToastOptions, "icon"> {
  style?: React.CSSProperties
  progressStyle?: React.CSSProperties
  icon?: string
}

export default function SignInForm() {
  const router = useRouter()
  const { signin, error: authError, isAuthenticated, getRedirectPath } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [signInAttempted, setSignInAttempted] = useState(false)

  const errorToastStyle: CustomToastStyle = {
    style: {
      background: "#ffffff",
      color: "#dc2626",
      borderRadius: "12px",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      padding: "16px",
      fontWeight: "500",
      border: "1px solid #fee2e2",
    },
    progressStyle: {
      background: "#dc2626",
    },
    icon: "⚠️",
  }

  // Effect to handle redirection after successful authentication
  useEffect(() => {
    if (signInAttempted && isAuthenticated && !isSubmitting) {
      setShowSuccessOverlay(true)
      // Redirect after 1 second or immediately after authentication
      const redirectTimeout = setTimeout(() => {
        const redirectPath = getRedirectPath() || "/dashboard"
        router.push(redirectPath)
      }, 1000)

      return () => clearTimeout(redirectTimeout)
    }
  }, [isAuthenticated, signInAttempted, getRedirectPath, router, isSubmitting])

  const handleGoogleSignup = async () => {
    try {
      console.log("Signing up with Google")
      // Implement Google OAuth logic here
      toast.info(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Google Sign In</span>
          <span className="text-sm opacity-90">Redirecting to Google authentication...</span>
        </div>,
      )
      // Redirect to Google OAuth endpoint or use a library like next-auth
    } catch (error) {
      console.error("Google signup error:", error)
      toast.error(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Authentication Failed</span>
          <span className="text-sm opacity-90">Could not sign in with Google. Please try again.</span>
        </div>,
        errorToastStyle as ToastOptions,
      )
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Validate form
  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    try {
      // Set loading states
      setIsSubmitting(true)
      setSignInAttempted(true)

      // Clear any existing auth data before attempting login
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")

      console.log("Attempting signin with:", formData.email)

      // Authenticate the user - the useEffect will handle redirection
      await signin(formData.email, formData.password)

      // Check if authentication was successful
      console.log("Signin function completed. isAuthenticated:", isAuthenticated)
    } catch (error) {
      console.error("Signin failed:", error)
      // Reset the sign-in attempt flag if there was an error
      setSignInAttempted(false)
      // Show error toast
      toast.error(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Login Failed</span>
          <span className="text-sm opacity-90">Please check your credentials and try again.</span>
        </div>,
        errorToastStyle as ToastOptions,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full ">
      {/* Background image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/Rectangle%20105.png"
          alt="Background"
          fill
          priority
         
        />
      
      </div>

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        className="toast-container-custom"
      />

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl transform animate-scale-up border border-blue-100">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
              <p className="text-slate-600">You have successfully signed in.</p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
              </div>
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      )}

      {/* Centered Card */}
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-lg flex items-center justify-center">
          <div
            className="w-[600px] h-[510px] rounded-[22px] p-8 flex flex-col justify-between shadow-2xl text-white opacity-100 backdrop-blur-[24px] "
            style={{
              background: '#0000006D',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            {/* Logo */}
            <div className="flex flex-col items-start mb-6">
              <Image src="/images/logo/gigjives1.svg" alt="GigJives Logo" width={160} height={48} />
            </div>

            <h2
              className="font-montserrat font-medium text-[30px] leading-[38px] text-left text-white tracking-[0] mb-0"
              style={{ marginBottom: 0 }}
            >
              Log in to your account
            </h2>
            <p className="mt-2 text-left text-[#D5D7DA] font-montserrat font-normal text-[16px] leading-[24px] tracking-[0]">Welcome back! Please enter your details.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="email" className="mb-2 text-white font-montserrat font-medium text-[14px] leading-[20px] tracking-[0]">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="olivia@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  hint={errors.email}
                   className="w-full h-12 px-4 bg-[rgba(0,0,0,0.3)] text-white placeholder-white/60 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-blue-400/30 backdrop-blur-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 text-white font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="•••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    hint={errors.password}
                    className="w-full h-12 px-4 bg-[rgba(0,0,0,0.3)] text-white placeholder-white/60 rounded-lg border border-white/20 focus:border-blue-400 focus:ring-blue-400/30 backdrop-blur-[100px]"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember"
                  label="Remember me"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="text-[#0CA9F6] text-[12px]"
                />
                {/* <Link href="/forgot-password" className="text-sm text-[#0CA9F6] hover:text-blue-200">
                  Forgot Password
                </Link> */}
              </div>

              {authError && (
                <div className="p-4 text-sm text-red-200 bg-red-900/30 rounded-lg border border-red-700/40">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full h-12 font-semibold text-white rounded-lg bg-[#0CA9F6] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 shadow-lg shadow-blue-900/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Log in</span>
                )}
              </button>

              {/* <p className="text-center text-white/80 text-sm">
                Don’t have an account?{" "}
                <Link href="/signup" className="text-white font-semibold underline decoration-white/40 hover:decoration-white">
                  Sign up
                </Link>
              </p> */}
            </form>
          </div>
        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .toast-container-custom .Toastify__toast {
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .Toastify__toast-body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .Toastify__progress-bar {
          height: 3px;
          border-radius: 0 0 8px 8px;
        }
        .Toastify__close-button {
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        .Toastify__close-button:hover {
          opacity: 1;
        }

        /* Custom animations */
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes draw {
          0% { stroke-dasharray: 0 1000; }
          100% { stroke-dasharray: 1000 0; }
        }
        @keyframes draw-delayed {
          0%, 30% { stroke-dasharray: 0 1000; }
          100% { stroke-dasharray: 1000 0; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.3; }
        }

        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-up { animation: scale-up 0.4s ease-out; }
        .animate-bounce-gentle { animation: bounce-gentle 2s ease-in-out infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
  .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
  .animate-spin-slow { animation: spin-slow 20s linear infinite; }
  .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
  .animate-draw { animation: draw 4s ease-in-out infinite; }
  .animate-draw-delayed { animation: draw-delayed 6s ease-in-out infinite; }
  .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
