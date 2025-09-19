"use client"
import UserDropdown from "@/components/header/UserDropdown"
import { useAuth } from "@/context/AuthContext"
import { useSidebar } from "@/context/SidebarContext"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import type React from "react"
import { colors } from "@/colors"
import NotificationDropdown from "@/components/header/NotificationDropdown"

// Define the type for navigation items (same as sidebar)
type NavItem = {
  name: string
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

// Common navigation items for all roles
const commonNavItems: NavItem[] = []

// Super Admin-specific navigation items
const superAdminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard/superadmin",
  },
  {
    name: "Organizations",
    path: "/dashboard/superadmin/organizations",
  },
  {
    name: "Create Admin",
    path: "/dashboard/superadmin/addadmin",
  },
  {
    name: "View Admins",
    path: "/dashboard/superadmin/viewsuperadmin",
  },
]

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard/admin",
  },
  {
    name: "Projects",
    path: "/dashboard/admin/projects",
  },
  {
    name: "Managers",
    path: "/dashboard/admin/managers",
  },
  {
    name: "Teams",
    path: "/dashboard/admin/team/list",
  },
  {
    name: "Discussions",
    path: "/dashboard/teammember/discussions",
  },
]

// Manager-specific navigation items
const managerNavItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard/manager",
  },
  {
    name: "Projects",
    path: "/dashboard/manager/addproject",
  },
  {
    name: "Team Members",
    path: "/dashboard/admin/team/list",
  },
  {
    name: "Sprints",
    path: "/dashboard/manager/showsprints",
  },
  {
    name: "Communication",
    path: "/dashboard/manager/chat",
  },
  {
    name: "Discussions",
    path: "/dashboard/teammember/discussions",
  },
   {
    name: "Notes",
    path: "/dashboard/teammember/notes",
  },
]

// Employee-specific navigation items
const employeeNavItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard/teammember",
  },
  {
    name: "My Projects",
    path: "/dashboard/teammember/mytasks",
  },
  {
    name: "Discussions",
    path: "/dashboard/teammember/discussions",
  },
  {
    name: "Sprints",
    path: "/dashboard/teammember/sprints",
  },
  {
    name: "My Calendar",
    path: "/dashboard/teammember/calendertasks",
  },
  {
    name: "Communication",
    path: "/dashboard/manager/chat",
  },
  {
    name: "Notes",
    path: "/dashboard/teammember/notes",
  },
]

// Student-specific navigation items
const studentNavItems: NavItem[] = [
  {
    name: "Dashboard",
    path: "/dashboard/agent",
  },
  {
    name: "My Listings",
    path: "/dashboard/projects",
  },
  ...commonNavItems,
  {
    name: "My Contacts",
    path: "/dashboard/agent/mycontacts",
  },
  {
    name: "Profile",
    path: "/dashboard/account/profile",
  },
  {
    name: "Reminders",
    path: "/dashboard/agent/reminders",
  },
  {
    name: "Email Lists",
    path: "/dashboard/email-lists",
  },
  {
    name: "Email Campaigns",
    path: "/dashboard/email-campaigns",
  },
  {
    name: "Pipelines",
    path: "/dashboard/agent/pipeline",
  },
]

const AppHeader: React.FC = () => {
  const { user } = useAuth()
  const { isExpanded, isMobileOpen } = useSidebar()
  const pathname = usePathname()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const displayName = user ? user.name : "Guest"

  const sidebarWidth = isMobileOpen ? 0 : isExpanded ? 280 : 80
  const hasMoreSpace = !isExpanded && !isMobileOpen

  // Determine which navigation items to show based on user role
  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase()
      if (role === "superadmin") {
        setNavItems(superAdminNavItems)
      } else if (role === "admin") {
        setNavItems(adminNavItems)
      } else if (role === "manager" || role === "manger") {
        setNavItems(managerNavItems)
      } else if (role === "employee") {
        setNavItems(employeeNavItems)
      } else if (role === "broker" || role === "agent") {
        setNavItems(studentNavItems)
      } else {
        setNavItems(commonNavItems)
      }
    } else {
      setNavItems([])
    }
  }, [user])

  const isActive = useCallback((path: string) => path === pathname, [pathname])

  return (
   <header
  className={`
    fixed top-4 left-1/2 transform -translate-x-1/2 
    w-[95%] z-[99999] 
    shadow-md transition-all duration-500 ease-in-out
    backdrop-blur-md bg-[rgba(0,0,0,0.3)] text-white
    flex items-center justify-between px-4 py-3
    rounded-2xl
  `}
  style={{
    fontFamily:
      "'Inter', 'Segoe UI', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
  }}
>
      {/* Left - Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Image
          src="/images/logo/gigjives1.svg"
          alt="Gig Jives"
          width={133}
          height={31}
          priority
        />
      </div>

      {/* Middle - Dynamic Nav Items based on User Role */}
      <nav className="hidden lg:block flex-1 mx-8">
        <ul className="flex items-center justify-center gap-14 text-sm font-medium">
          {navItems.slice(0, 6).map((item, index) => (
            <li key={item.name}>
              {item.path ? (
                <Link
                  href={item.path}
                  className={`transition-all duration-200 ease-in-out hover:scale-105 ${
                    isActive(item.path)
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-full shadow-lg"
                      : "hover:text-blue-400 cursor-pointer"
                  }`}
                  style={
                    isActive(item.path)
                      ? {
                          background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
                        }
                      : {}
                  }
                >
                  {item.name}
                </Link>
              ) : (
                <span className="hover:text-blue-400 cursor-pointer">
                  {item.name}
                </span>
              )}
            </li>
          ))}
          
          {/* Show "More" dropdown if there are more than 6 items */}
          {navItems.length > 6 && (
            <li className="relative group">
              <button className="hover:text-blue-400 cursor-pointer flex items-center gap-1">
                More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <ul className="py-2">
                  {navItems.slice(6).map((item) => (
                    <li key={item.name}>
                      {item.path ? (
                        <Link
                          href={item.path}
                          className={`block px-4 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200 ${
                            isActive(item.path) ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500" : ""
                          }`}
                        >
                          {item.name}
                        </Link>
                      ) : (
                        <span className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer">
                          {item.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )}
        </ul>
      </nav>

      {/* Mobile Navigation Menu */}
      <nav className="lg:hidden">
        <div className="relative group">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Mobile Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
           <ul className="flex items-center justify-center gap-14 text-sm font-medium">
  {navItems.slice(0, 6).map((item, index) => (
    <li key={item.name}>
      {item.path ? (
        <Link
          href={item.path}
          className={`transition-all duration-200 ease-in-out hover:scale-105 flex items-center justify-center
            ${isActive(item.path)
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1.5 rounded-full shadow-lg"
              : "hover:text-blue-400 cursor-pointer"
            }`}
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0px",
            color: "rgba(255, 255, 255, 1)",
            textAlign: "center",
          }}
        >
          {item.name}
        </Link>
      ) : (
        <span
          className="flex items-center justify-center hover:text-blue-400 cursor-pointer"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0px",
            color: "rgba(255, 255, 255, 1)",
            textAlign: "center",
          }}
        >
          {item.name}
        </span>
      )}
    </li>
  ))}
</ul>

          </div>
        </div>
      </nav>

      {/* Right - Search, Notifications, User */}
     <div
  className={`flex items-center flex-shrink-0 transition-all duration-500 ease-in-out ${
    hasMoreSpace ? "gap-4 md:gap-5" : "gap-2 md:gap-3"
  }`}
>
  <button className="hover:scale-110 transition-transform duration-200 p-2 hover:bg-white/10 rounded-lg">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </button>

  {/* Rectangle 105 instead of notification icon */}
  <div
    className="w-10 h-10 relative"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Notification Dropdown Component */}
    <NotificationDropdown />
    <Image
      src="/images/notification.png"
      alt="Notifications"
      fill
      className="object-contain"
    />
  </div>

  {/* User Dropdown with white username */}
  <div
  className={`flex items-center gap-2 transition-all duration-500 ease-in-out ${
    hasMoreSpace ? "scale-110" : "scale-100"
  }`}
>


  {/* User Dropdown forced to white */}
  <div className="text-white">
    <UserDropdown />
  </div>
        </div>
          </div>
    </header>
  )
}

export default AppHeader