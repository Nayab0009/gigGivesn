"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import TermsAndConditionsModal from "./TermsAndConditionsModal"

import type React from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import Checkbox from "@/components/form/input/Checkbox"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import { useAuth } from "@/context/AuthContext"
import { toast, ToastContainer, type ToastOptions } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { UserPlus, Mail } from 'lucide-react'

// Update Role enum
export enum Role {
  MANAGER = "manager",
  TEAM_MEMBER = "team_member",
  USER = "user", // Add this if it's being used as default
}

// Define custom toast style type
interface CustomToastStyle extends Omit<ToastOptions, "icon"> {
  style?: React.CSSProperties
  progressStyle?: React.CSSProperties
  icon?: string
}

export default function SignUpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedRoleFromQuery = searchParams.get("role")
  const { error: authError, isLoading: authLoading } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: selectedRoleFromQuery || Role.USER,
  })
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: "",
    role: "", // Add this line
  })

  const [showTermsModal, setShowTermsModal] = useState(false)

  // Custom toast styles
  const successToastStyle: CustomToastStyle = {
    style: {
      background: "#ffffff",
      color: "#16a34a",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      padding: "16px",
      fontWeight: "500",
      border: "1px solid #dcfce7",
    },
    progressStyle: {
      background: "#16a34a",
    },
    icon: "🎉",
  }

  const errorToastStyle: CustomToastStyle = {
    style: {
      background: "#ffffff",
      color: "#dc2626",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
      padding: "16px",
      fontWeight: "500",
      border: "1px solid #fee2e2",
    },
    progressStyle: {
      background: "#dc2626",
    },
    icon: "⚠️",
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()

    // Validate form before setting isSubmitting
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)

      // Simulate auth processing
      setTimeout(() => {}, 2000)
    }, 2000)
  }

  useEffect(() => {
    if (selectedRoleFromQuery) {
      console.log(`Role selected: ${selectedRoleFromQuery}`) // Log selected role
      setFormData((prev) => ({
        ...prev,
        role: selectedRoleFromQuery,
      }))
    }
  }, [selectedRoleFromQuery])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
      isValid = false
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
      isValid = false
    }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
      isValid = false
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
      isValid = false
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    if (!isChecked) {
      newErrors.terms = "You must agree to the terms and conditions"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit called")
    e.preventDefault()

    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    console.log("Form validation passed, submitting...")
    setIsSubmitting(true)

    try {
      console.log("Form Data:", formData)
      console.log("Selected Role:", selectedRoleFromQuery)

      // Add this before the fetch call
      console.log("Sending data to API:", {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      })

      console.log("Starting fetch request to /api/signup")

      // Create the request body
      const requestBody = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }

      console.log("Request body:", JSON.stringify(requestBody))

      let response
      try {
        response = await fetch("/api/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        console.log("API Response status:", response.status)
        console.log("API Response headers:", Object.fromEntries([...response.headers.entries()]))
      } catch (fetchError) {
        console.error("Fetch error:", fetchError)
        throw fetchError
      }

      if (!response.ok) {
        try {
          const errorData = await response.json()
          console.error("Signup failed with error data:", errorData)
          toast.error(
            <div className="flex flex-col">
              <span className="text-lg font-medium mb-1">Signup Failed</span>
              <span className="text-sm opacity-90">{errorData.message || "Please try again later."}</span>
            </div>,
            errorToastStyle as ToastOptions,
          )
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError)
          toast.error(
            <div className="flex flex-col">
              <span className="text-lg font-medium mb-1">Signup Failed</span>
              <span className="text-sm opacity-90">Server returned an error. Please try again later.</span>
            </div>,
            errorToastStyle as ToastOptions,
          )
        }
        return
      }

      try {
        const data = await response.json()
        console.log("Signup successful, response data:", data)

        // Show success toast with custom styling
        toast.success(
          <div className="flex flex-col">
            <span className="text-lg font-medium mb-1">Account Created!</span>
            <span className="text-sm opacity-90">You&apos;ll be redirected to login in a moment.</span>
          </div>,
          successToastStyle as ToastOptions,
        )

        // Redirect after a short delay to allow the toast to be seen
        setTimeout(() => {
          router.push("/signin")
        }, 3000)
      } catch (jsonError) {
        console.error("Error parsing success response:", jsonError)
        // Still treat it as success if response was ok but JSON parsing failed
        toast.success(
          <div className="flex flex-col">
            <span className="text-lg font-medium mb-1">Account Created!</span>
            <span className="text-sm opacity-90">You&apos;ll be redirected to login in a moment.</span>
          </div>,
          successToastStyle as ToastOptions,
        )

        setTimeout(() => {
          router.push("/signin")
        }, 3000)
      }
    } catch (error: unknown) {
      console.error("Signup process failed with error:", error)
      let errorMessage = "Please try again later."

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast.error(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Signup Failed</span>
          <span className="text-sm opacity-90">{errorMessage}</span>
        </div>,
        errorToastStyle as ToastOptions,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      console.log("Signing up with Google")
      // Implement Google OAuth logic here
      toast.info(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Google Sign Up</span>
          <span className="text-sm opacity-90">Redirecting to Google authentication...</span>
        </div>,
      )
      // Redirect to Google OAuth endpoint or use a library like next-auth
    } catch (error) {
      console.error("Google signup error:", error)
      toast.error(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Authentication Failed</span>
          <span className="text-sm opacity-90">Could not sign up with Google. Please try again.</span>
        </div>,
        errorToastStyle as ToastOptions,
      )
    }
  }

  const handleOpenTermsModal = () => {
    // Check if first name and last name are filled
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error(
        <div className="flex flex-col">
          <span className="text-lg font-medium mb-1">Required Fields Missing</span>
          <span className="text-sm opacity-90">Please enter your first and last name before viewing the agreement.</span>
        </div>,
        errorToastStyle as ToastOptions
      )
      
      // Set errors for empty fields
      const newErrors = { ...errors }
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required to view the agreement"
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required to view the agreement"
      }
      setErrors(newErrors)
      
      return
    }
    
    // If both fields are filled, open the modal
    setShowTermsModal(true)
  }

  const handleAcceptTerms = () => {
    setIsChecked(true)
    setShowTermsModal(false)
    setErrors((prev) => ({ ...prev, terms: "" }))
  }

  // Add this common class for all inputs
  const commonInputClass = "w-full h-12 px-4 bg-white/5 text-white !rounded-lg border-white/20 focus:border-gray-400 focus:ring-gray-400 shadow-sm placeholder-gray-400"

  // For select dropdown
  const commonSelectClass = "w-full h-12 px-4 !bg-white text-gray-700 !rounded-lg border-white/20 focus:border-gray-400 focus:ring-gray-400 shadow-sm"

  return (
    <div className="flex min-h-screen w-full">
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

      {/* Full width form section */}
      <div className="w-full flex items-center justify-center bg-white min-h-screen py-8">
        <div className="w-full max-w-2xl px-8 sm:px-12 py-8 mx-4 sm:mx-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-md rounded-xl border border-white/20 shadow-xl transition-all duration-300 hover:shadow-2xl">
          <div className="mb-6 bg">
            {/* Simple centered title without animation */}
            <h1 className="mb-3 font-bold text-white text-2xl sm:text-3xl md:text-[28px] text-center">
              Project Management System
            </h1>
            <p className="text-base text-gray-100 mt-2 text-center">Enter your details to create your account</p>
            <div className="mt-4 mb-5 border-b border-white/20"></div>
          </div>

          <div className="space-y-5">
            {/* Google signup button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
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
              Sign up with Google
            </button>

            {/* OR divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Form - Now always visible */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit(e)
              }}
              className="space-y-4"
            >
              {/* Form fields grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="w-full">
                  <Label htmlFor="name" className="mb-1 text-gray-100 font-medium text-sm">
                    First Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    error={!!errors.firstName}
                    hint={errors.firstName}
                    className={commonInputClass}
                  />
                </div>
                {/* Last Name */}
                <div className="w-full">
                  <Label htmlFor="lastName" className="mb-1 text-gray-100 font-medium text-sm">
                    Last Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    error={!!errors.lastName}
                    hint={errors.lastName}
                    className={commonInputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="mb-1 text-gray-100 font-medium text-sm">
                  Email<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  error={!!errors.email}
                  hint={errors.email}
                  className={`${commonInputClass} min-w-[300px]`}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone" className="mb-1 text-gray-100 font-medium text-sm">
                  Phone Number<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  error={!!errors.phone}
                  hint={errors.phone}
                  className={`${commonInputClass} min-w-[300px]`}
                />
              </div>

              {/* Role Selection */}
              <div>
                <Label htmlFor="role" className="mb-1 text-gray-100 font-medium text-sm">
                  Select Role<span className="text-red-500">*</span>
                </Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={commonSelectClass}
                >
                  <option value="" disabled>Select your role</option>
                  <option value={Role.MANAGER}>Manager</option>
                  <option value={Role.TEAM_MEMBER}>Team Member</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="mb-1 text-gray-100 font-medium text-sm">
                  Password<span className="text-red-500">*</span>
                </Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  error={!!errors.password}
                  hint={errors.password}
                  className={commonInputClass}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="mb-1 text-gray-100 font-medium text-sm">
                  Confirm Password<span className="text-red-500">*</span>
                </Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  error={!!errors.confirmPassword}
                  hint={errors.confirmPassword}
                  className={commonInputClass}
                />
              </div>

              {/* Terms */}
              <div className="flex items-center">
                <Checkbox
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  className="h-4 w-4 text-teal-700 rounded focus:ring-teal-600 border-gray-300"
                />
                <label
                  className="ml-2 block text-sm text-gray-100 cursor-pointer"
                  onClick={() => {
                    if (!isChecked) {
                      handleOpenTermsModal()
                    } else {
                      setIsChecked(false)
                      setErrors((prev) => ({ ...prev, terms: "" }))
                    }
                  }}
                >
                  I agree to the{" "}
                  <span className="text-[#1e40af] underline">terms and conditions</span>
                </label>
              </div>
              {errors.terms && <p className="mt-1 text-xs text-red-500">{errors.terms}</p>}

              {authError && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{authError}</div>}

              {errors.role && !selectedRoleFromQuery && (
                <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">{errors.role}</div>
              )}

              <div className="pt-3 mt-3 flex justify-center">
                <button
                  type="submit"
                  className="w-64 h-12 font-medium text-white transition-all duration-300 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 hover:translate-y-1 hover:shadow-lg focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
                  disabled={isSubmitting || authLoading}
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
                      <span>Loading...</span>
                    </>
                  ) : authLoading ? (
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
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} />
                      <span>Sign Up</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          <p className="text-sm text-center text-gray-100 mt-4">
            Already have an account?{" "}
            <Link href="/signin" className="font-medium text-white transition-colors hover:text-white">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .toast-container-custom .Toastify__toast {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 16px;
          margin-bottom: 16px;
        }
        
        .Toastify__toast-body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .Toastify__progress-bar {
          height: 3px;
          border-radius: 0 0 4px 4px;
        }

        .Toastify__close-button {
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .Toastify__close-button:hover {
          opacity: 1;
        }

        /* Input and Select styling */
        input, select {
          background-color: white !important;
          color: #1f2937 !important;
        }

        input::placeholder, select::placeholder {
          color: #9ca3af !important;
          opacity: 1;
        }

        /* Card styling */
        .rounded-xl {
          border-radius: 1rem;
        }

        .shadow-lg {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }

        /* Form container hover effect */
        .bg-white.rounded-xl {
          transition: all 0.3s ease;
        }

        .bg-white.rounded-xl:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-2px);
        }

        /* Improve input field focus states */
        input:focus {
          box-shadow: 0 0 0 2px rgba(54, 96, 132, 0.2) !important;
        }

        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari and Opera */
        }

        /* Ensure content starts from the top */
        .items-start {
          align-items: flex-start;
        }
      `}</style>
    </div>
  )
}
