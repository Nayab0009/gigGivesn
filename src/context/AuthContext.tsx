"use client"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authenticateUser } from "../lib/authService"

// Define our types
interface User {
  id: number
  email: string
  name: string
  role: string
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  signin: (email: string, password: string) => Promise<void>
  signup: (userData: SignupData) => Promise<void>
  signout: () => void
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  getRedirectPath: () => string
}

interface SignupData {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
}

const ROLE_DASHBOARD_PATHS: Record<string, string> = {
  admin: "/dashboard/admin",
  manager: "/dashboard/manager",
  employee: "/dashboard/teammember",
  superadmin: "/dashboard/superadmin",
  default: "/dashboard",
}

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    const currentTime = Date.now() / 1000
    return payload.exp < currentTime
  } catch (error) {
    console.error("Error parsing token:", error)
    return true
  }
}

const validateStoredAuth = (): { isValid: boolean; user: User | null } => {
  const storedUser = localStorage.getItem("user")
  const storedToken = localStorage.getItem("authToken")

  if (!storedUser || !storedToken) {
    return { isValid: false, user: null }
  }

  if (!storedToken.startsWith("mock-token-") && isTokenExpired(storedToken)) {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    return { isValid: false, user: null }
  }

  try {
    const user = JSON.parse(storedUser)
    return { isValid: true, user }
  } catch (error) {
    console.error("Error parsing stored user:", error)
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    return { isValid: false, user: null }
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = () => {
      const { isValid, user: validatedUser } = validateStoredAuth()
      const storedToken = localStorage.getItem("authToken")

      if (isValid && validatedUser) {
        setUser(validatedUser)
        setToken(storedToken)
        console.log("Valid session found:", validatedUser)
      } else {
        console.log("No valid session found")
        setUser(null)
        setToken(null)
      }

      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const getRedirectPath = () => {
    if (!user) return "/signin"
    const normalizedRole = user.role.toLowerCase()
    return ROLE_DASHBOARD_PATHS[normalizedRole] || ROLE_DASHBOARD_PATHS.default
  }

  const signin = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!email || !password) {
        throw new Error("Email and password are required")
      }

      if (email === "superadmin@gmail.com" && password === "Super@123") {
        const superAdminUser: User = {
          id: 0,
          email,
          name: "Super Admin",
          role: "superadmin",
        }

        const token = `mock-token-superadmin`
        localStorage.setItem("authToken", token)
        localStorage.setItem("user", JSON.stringify(superAdminUser))
        setUser(superAdminUser)
        setToken(token)

        console.log("Signed in as Superadmin:", superAdminUser)
        return // 🚀 Exit early so API is not called
      }

      try {
        const authenticatedUser = await authenticateUser(email, password)

        if (authenticatedUser) {
          const { password, ...userWithoutPassword } = authenticatedUser

          const userObj = {
            id: userWithoutPassword.id,
            email: userWithoutPassword.email,
            name: userWithoutPassword.name,
            role: userWithoutPassword.role.toLowerCase(),
            phone: userWithoutPassword.phone,
            address: userWithoutPassword.address,
          }
          localStorage.setItem("user", JSON.stringify(userObj))
          setUser(userObj)
          const apiToken = localStorage.getItem("authToken")
          setToken(apiToken)
          console.log("Signed in via API:", userObj)
        } else {
          setError("Invalid credentials. Please check your email and password.")
        }
      } catch (apiError) {
        console.error("API authentication error:", apiError)
        setError("Authentication service is unavailable. Please try again later.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
      console.error("Signin error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (userData: SignupData) => {
    try {
      setIsLoading(true)
      setError(null)
      if (!userData.email || !userData.password || !userData.role) {
        throw new Error("Email, password, and role are required")
      }

      const newUser = {
        id: Date.now(),
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role.toLowerCase(),
      }

      const token = `user-token-${Date.now()}`
      localStorage.setItem("authToken", token)
      localStorage.setItem("user", JSON.stringify(newUser))

      setUser(newUser)
      setToken(token)
      console.log("Signed up as:", newUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
      console.error("Signup error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const signout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    console.log("Signed out and cleared all auth data")
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        signin,
        signup,
        signout,
        isAuthenticated,
        isLoading,
        error,
        getRedirectPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
