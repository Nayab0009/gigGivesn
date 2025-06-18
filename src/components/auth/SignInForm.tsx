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
      console.log("Authentication successful, preparing to redirect...")

      // Show custom success overlay
      setShowSuccessOverlay(true)

      // Redirect after a short delay to allow the success message to be seen
      const redirectTimeout = setTimeout(() => {
        const redirectPath = getRedirectPath() || "/dashboard"
        console.log("Redirecting to:", redirectPath)
        router.push(redirectPath)
      }, 2500)

      // Clean up timeout if component unmounts
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
    <div className="flex min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
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
        theme="light"
        className="toast-container-custom"
      />

      {/* Success Overlay */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl transform animate-scale-up border border-emerald-200">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
              <p className="text-slate-600">You have successfully signed in.</p>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-200"></div>
              </div>
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      )}

      {/* Left Side - Visual Design Elements */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Animated Background Patterns */}
        <div className="absolute inset-0">
          {/* Large geometric shapes */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-3xl rotate-12 animate-float"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-2xl -rotate-12 animate-float-delayed"></div>
          <div className="absolute bottom-40 left-32 w-28 h-28 bg-gradient-to-br from-cyan-400/20 to-emerald-500/20 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-20 right-20 w-36 h-36 bg-gradient-to-br from-emerald-500/20 to-teal-400/20 rounded-3xl rotate-45 animate-float"></div>

          {/* Medium geometric shapes */}
          <div className="absolute top-60 left-40 w-16 h-16 bg-gradient-to-br from-teal-300/30 to-emerald-400/30 rounded-xl rotate-45 animate-float-delayed"></div>
          <div className="absolute top-32 right-48 w-20 h-20 bg-gradient-to-br from-cyan-300/30 to-teal-400/30 rounded-2xl -rotate-12 animate-float-slow"></div>
          <div className="absolute bottom-60 left-48 w-18 h-18 bg-gradient-to-br from-emerald-300/30 to-cyan-400/30 rounded-full animate-float"></div>

          {/* Small decorative elements */}
          <div className="absolute top-80 right-40 w-8 h-8 bg-emerald-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-48 left-60 w-6 h-6 bg-teal-400/40 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-80 right-60 w-10 h-10 bg-cyan-400/40 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-48 left-56 w-4 h-4 bg-emerald-500/40 rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 grid-rows-12 h-full w-full gap-4 p-8">
            {Array.from({ length: 144 }).map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-sm opacity-20"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  animation: "fadeInOut 4s ease-in-out infinite",
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Central Logo Design */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="w-80 h-80 border-4 border-emerald-300/30 rounded-full animate-spin-slow"></div>

            {/* Middle ring */}
            <div className="absolute inset-8 border-2 border-teal-400/40 rounded-full animate-spin-reverse"></div>

            {/* Inner circle with logo */}
            <div className="absolute inset-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <div className="w-32 h-32 flex items-center justify-center">
                <Image
                  src="/images/logo/Gigjives-Logo-final.png"
                  alt="GigJives Logo"
                  width={120}
                  height={120}
                  className="object-contain drop-shadow-lg"
                />
              </div>
            </div>

            {/* Floating dots around logo */}
            <div className="absolute top-4 left-1/2 w-3 h-3 bg-white/60 rounded-full animate-bounce"></div>
            <div className="absolute bottom-4 left-1/2 w-3 h-3 bg-white/60 rounded-full animate-bounce delay-300"></div>
            <div className="absolute left-4 top-1/2 w-3 h-3 bg-white/60 rounded-full animate-bounce delay-500"></div>
            <div className="absolute right-4 top-1/2 w-3 h-3 bg-white/60 rounded-full animate-bounce delay-700"></div>
          </div>
        </div>

        {/* Flowing lines */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
            <path
              d="M0,300 Q200,100 400,300 T800,300"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              className="animate-draw"
            />
            <path
              d="M0,200 Q200,400 400,200 T800,200"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="none"
              className="animate-draw-delayed"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center py-8 px-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 p-2">
                  <Image
                    src="/images/logo/Gigjives-Logo-final.png"
                    alt="GigJives Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 text-center">Welcome Back</h2>
              <p className="text-slate-600 text-center">Sign in to continue your journey</p>
            </div>

            {/* Google Sign In Button */}
            <div className="mb-6">
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="group-hover:text-slate-800 transition-colors">Continue with Google</span>
              </button>
            </div>

            {/* OR Separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-slate-500 bg-white font-medium">OR</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email" className="mb-2 text-slate-700 font-medium">
                  Email Address
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  hint={errors.email}
                  className="w-full h-12 px-4 bg-white text-slate-900 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm placeholder-slate-400 transition-all duration-200"
                />
              </div>

              <div>
                <Label htmlFor="password" className="mb-2 text-slate-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    hint={errors.password}
                    className="w-full h-12 px-4 bg-white text-slate-900 rounded-xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 shadow-sm placeholder-slate-400 transition-all duration-200"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
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
                  className="text-slate-700"
                />

                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 font-medium transition-colors hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
              </div>

              {authError && (
                <div className="p-4 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">{authError}</div>
              )}

              <button
                type="submit"
                className="w-full h-12 font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 hover:shadow-lg hover:shadow-emerald-500/25 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
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
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Sign In to GigJives</span>
                  </>
                )}
              </button>

              <p className="text-sm text-center text-slate-600 mt-6">
                New to GigJives?{" "}
                <Link href="/signup" className="font-medium text-emerald-600 transition-colors hover:text-emerald-700">
                  Create an account
                </Link>
              </p>
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
