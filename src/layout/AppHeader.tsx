"use client"
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton"
import UserDropdown from "@/components/header/UserDropdown"
import { useAuth } from "@/context/AuthContext"
import { useSidebar } from "@/context/SidebarContext"
import type React from "react"
import { useEffect, useState } from "react"

const AppHeader: React.FC = () => {
  const { user } = useAuth()
  const { isExpanded, isMobileOpen } = useSidebar()
  const displayName = user ? user.name : "Guest"

  const [prevScrollPos, setPrevScrollPos] = useState(0)
  const [visible, setVisible] = useState(true)

  // Calculate sidebar width for header positioning - Updated widths
  const sidebarWidth = isMobileOpen ? 0 : isExpanded ? 280 : 80

  // Determine if sidebar is in expanded mode (more space available when collapsed)
  const hasMoreSpace = !isExpanded && !isMobileOpen

  // Normalize the user role for logic
  const userRole = user?.role?.toLowerCase() || "guest"

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset
      setVisible((prevScrollPos > currentScrollPos && prevScrollPos - currentScrollPos > 70) || currentScrollPos < 10)
      setPrevScrollPos(currentScrollPos)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [prevScrollPos, visible])

  // --- LIGHT BACKGROUND with emerald accent ---
  return (
    <header
      className={`
        fixed top-0 z-[99999] 
        shadow-lg border-b border-emerald-100 transition-all duration-500 ease-in-out
        backdrop-blur-sm bg-white/95
        ${visible ? "" : "transform -translate-y-full"}
      `}
      style={{
        left: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`,
        fontFamily: "'Inter', 'Segoe UI', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        className={`flex items-center justify-between px-4 md:px-8 transition-all duration-500 ease-in-out ${
          hasMoreSpace ? "py-3" : "py-2"
        }`}
      >
        {/* Left - Brand Name and Welcome */}
        <div className="flex items-center gap-8 md:gap-12">
          <div className="hidden md:block">
            <div
              className={`
                font-semibold text-slate-700 tracking-wide drop-shadow-sm
                transition-all duration-500 ease-in-out
                ${hasMoreSpace ? "text-2xl" : "text-xl"}
              `}
            >
              <span
                className={`
                  font-light text-slate-500 transition-all duration-500 ease-in-out
                  ${hasMoreSpace ? "text-xl" : "text-lg"}
                `}
              >
                Welcome
              </span>
              <span
                className={`
                  ml-2 font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent 
                  drop-shadow-lg transition-all duration-500 ease-in-out
                  ${hasMoreSpace ? "text-2xl" : "text-xl"}
                `}
                style={{
                  textShadow: "0 0 8px rgba(16, 185, 129, 0.15)",
                }}
              >
                {displayName}
              </span>
            </div>
          </div>
        </div>

        {/* Right - Actions */}
        <div
          className={`flex items-center transition-all duration-500 ease-in-out ${
            hasMoreSpace ? "gap-4 md:gap-5" : "gap-2 md:gap-3"
          }`}
        >
          {/* Theme Toggle - Always visible */}
          {/* <div className={`transition-all duration-500 ease-in-out ${hasMoreSpace ? "scale-110" : "scale-100"}`}>
            <ThemeToggleButton />
          </div> */}

          {/* User Dropdown - Always visible */}
          <div className={`transition-all duration-500 ease-in-out ${hasMoreSpace ? "scale-110" : "scale-100"}`}>
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Welcome Message */}
      <div className={`md:hidden px-4 transition-all duration-500 ease-in-out ${hasMoreSpace ? "pb-3" : "pb-2"}`}>
        <div className="text-center">
          <span
            className={`
              font-light text-slate-500 transition-all duration-500 ease-in-out
              ${hasMoreSpace ? "text-base" : "text-sm"}
            `}
          >
            Welcome
          </span>
          <span
            className={`
              ml-1 font-black bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-500 bg-clip-text text-transparent 
              drop-shadow-lg transition-all duration-500 ease-in-out
              ${hasMoreSpace ? "text-xl" : "text-lg"}
            `}
            style={{
              textShadow: "0 0 8px rgba(16, 185, 129, 0.15)",
            }}
          >
            {displayName}
          </span>
        </div>
      </div>

      {/* Subtle bottom divider effect with emerald accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
    </header>
  )
}

export default AppHeader
