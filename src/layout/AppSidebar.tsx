"use client"
import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSidebar } from "../context/SidebarContext"
import { useAuth } from "../context/AuthContext"
import {
  LayoutGrid,
  List,
  Users,
  FileText,
  User,
  Mail,
  Settings,
  Banknote,
  Wallet,
  UserPlus,
  Contact,
  ChevronLeft,
  ChevronRight,
  
} from "lucide-react"
import {
  ChevronDownIcon,
  EnvelopeListIcon,
  GridIcon,
  ListIcon,
  PaperPlaneIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index"
import SidebarWidget from "./SidebarWidget"

// Define the type for navigation items
type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

// Common navigation items for all roles
const commonNavItems: NavItem[] = []

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path:'/dashboard/admin',

  },  {
    name: "Projects",
    icon: <List size={20} />,
    path: "/dashboard/admin/commercial-listings",
  },  {
    name: "Managers",
    icon: <FileText size={20} />,
    path: "/dashboard/admin/mls-listings",
  },
  {
    icon: <Users size={20} />,
    name: "Teams",
    subItems: [
      { name: "Grid View", path: "/dashboard/admin/agents/grid", pro: false },
      { name: "List View", path: "/dashboard/admin/agents/list", pro: false }
    ]
  }
  
]

// Teacher-specific navigation items
const teacherNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Teacher Overview", path: "/dashboard/teacher", pro: false }],
  },
]

// Student-specific navigation items
const studentNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard/agent",
  },
  {
    name: "My Listings",
    icon: <ListIcon />,
    path: "/dashboard/projects",
  },
  ...commonNavItems,
  {
    name: "My Contacts",
    icon: <Contact />,
    path: "/dashboard/agent/mycontacts",
  },
  {
    name: "Profile",
    icon: <UserCircleIcon />,
    path: "/dashboard/account/profile",
  },
  {
    name: "Reminders",
    icon: <TableIcon />,
    path: "/dashboard/agent/reminders",
  },
  {
    name: "Email Lists",
    icon: <EnvelopeListIcon />,
    path: "/dashboard/email-lists",
  },
  {
    name: "Email Campaigns",
    icon: <PaperPlaneIcon />,
    path: "/dashboard/email-campaigns",
  },
  {
    name: "PipeLines Management",
    icon: <FileText />,
    path: "/dashboard/agent/pipeline",
  },
]

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar } = useSidebar()
  const { user } = useAuth()
  const pathname = usePathname()
  const [navItems, setNavItems] = useState<NavItem[]>([])

  // Determine which navigation items to show based on user role
  useEffect(() => {
    if (user) {
      const role = user.role.toLowerCase()
      if (role === "admin") {
        setNavItems(adminNavItems)
      } else if (role === "teacher") {
        setNavItems(teacherNavItems)
      } else if (role === "broker" || role === "agent") {
        setNavItems(studentNavItems)
      } else {
        // Default to common items if role is not recognized
        setNavItems(commonNavItems)
      }
    } else {
      // No user logged in, show minimal items
      setNavItems([])
    }
  }, [user])

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group bg-transparent transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-gray-800/60 shadow-lg border-l-4 border-gray-400 text-white"
                  : "text-gray-300 hover:bg-gray-800/40 hover:shadow-md hover:border-l-4 hover:border-gray-500/70 hover:text-white"
              } cursor-pointer rounded-lg p-3 border-l-4 border-transparent ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`transition-all duration-300 ease-in-out ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-white scale-110 drop-shadow-sm"
                    : "text-gray-300 group-hover:scale-105 group-hover:text-white"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isMobileOpen) && (
                <span
                  className={`menu-item-text font-medium text-sm tracking-wide transition-all duration-300 ease-in-out group-hover:font-semibold ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                >
                  {nav.name}
                </span>
              )}
              {(isExpanded || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-all duration-300 ease-in-out group-hover:scale-110 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "rotate-180 text-white"
                      : "text-gray-300 group-hover:text-white"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group bg-transparent transition-all duration-300 ease-in-out transform hover:scale-[1.02] rounded-lg p-3 border-l-4 ${
                  isActive(nav.path)
                    ? "bg-gray-800/60 shadow-lg border-gray-400 shadow-gray-900/30 text-white"
                    : "text-gray-300 hover:bg-gray-800/40 hover:shadow-md border-transparent hover:border-gray-500/70 hover:text-white"
                }`}
              >
                <span
                  className={`transition-all duration-300 ease-in-out ${
                    isActive(nav.path) 
                      ? "text-white scale-110 drop-shadow-sm" 
                      : "text-gray-300 group-hover:scale-105 group-hover:text-white"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span
                    className={`font-medium text-sm tracking-wide transition-all duration-300 ease-in-out group-hover:font-semibold ${
                      isActive(nav.path) 
                        ? "font-semibold text-white" 
                        : "text-gray-300 group-hover:text-white"
                    }`}
                  >
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el
              }}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
                opacity: openSubmenu?.type === menuType && openSubmenu?.index === index ? 1 : 0,
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item transition-all duration-300 ease-in-out hover:scale-[1.01] font-medium text-sm tracking-wide block p-2 rounded-md ${
                        isActive(subItem.path)
                          ? "bg-gray-800/70 text-white shadow-md border-l-2 border-gray-400"
                          : "text-gray-400 hover:bg-gray-800/50 hover:text-white hover:pl-4 border-l-2 border-transparent hover:border-gray-500/70"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto transition-all duration-300 ease-in-out hover:scale-105 px-2 py-1 rounded-full text-xs font-semibold ${
                              isActive(subItem.path) 
                                ? "bg-gray-600 text-gray-100" 
                                : "bg-gray-700 text-gray-200"
                            }`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto transition-all duration-300 ease-in-out hover:scale-105 px-2 py-1 rounded-full text-xs font-semibold ${
                              isActive(subItem.path) 
                                ? "bg-gray-600 text-gray-100" 
                                : "bg-gray-700 text-gray-200"
                            }`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  )

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others"
    index: number
  } | null>(null)
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({})
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isActive = useCallback((path: string) => path === pathname, [pathname])

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false
    ;["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : []
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              })
              submenuMatched = true
            }
          })
        }
      })
    })

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null)
    }
  }, [pathname, isActive, navItems])

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }))
      }
    }
  }, [openSubmenu])

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null
      }
      return { type: menuType, index }
    })
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden transition-opacity duration-300 ease-in-out backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 shadow-2xl backdrop-blur-sm
          transition-all duration-300 ease-in-out transform
          ${isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: `linear-gradient(180deg, 
            #1a1a1a 0%, 
            #2d2d2d 25%, 
            #1f1f1f 50%, 
            #2a2a2a 75%, 
            #0f0f0f 100%
          )`,
        }}
      >
        {/* Header with Logo and Toggle Button */}
        <div
          className={`flex items-center backdrop-blur-md border-b-2 border-gray-700/40 transition-all duration-300 ease-in-out ${
            !isExpanded && !isMobileOpen ? "justify-center px-4 py-3" : "justify-between px-6 py-3"
          }`}
          style={{
            background: `linear-gradient(135deg, 
              rgba(15, 15, 15, 0.95) 0%, 
              rgba(26, 26, 26, 0.95) 50%, 
              rgba(10, 10, 10, 0.95) 100%
            )`,
          }}
        >
          {/* Logo - Only show when expanded */}
          {(isExpanded || isMobileOpen) && (
            <Link href="/" className="transition-transform duration-300 ease-in-out hover:scale-105">
              <Image
                className="transition-opacity duration-300 ease-in-out hover:opacity-90 drop-shadow-lg"
                src="/images/logo/lemaraLogo.png"
                alt="Logo"
                width={140}
                height={30}
                style={{
                  filter: 'brightness(1.4) contrast(1.2) saturate(0.8)',
                }}
              />
            </Link>
          )}

          {/* Beautiful Toggle Button - Always visible, centered when collapsed */}
          <button
            onClick={toggleSidebar}
            className={`group relative flex items-center justify-center rounded-xl text-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 ${
              !isExpanded && !isMobileOpen ? "w-11 h-11" : "w-9 h-9"
            }`}
            style={{
              background: `linear-gradient(135deg, 
                #404040 0%, 
                #2d2d2d 50%, 
                #1a1a1a 100%
              )`,
            }}
            aria-label="Toggle Sidebar"
          >
            {/* Background glow effect */}
            <div 
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out" 
              style={{
                background: `linear-gradient(135deg, 
                  rgba(255, 255, 255, 0.15) 0%, 
                  rgba(255, 255, 255, 0.08) 100%
                )`,
              }}
            />

            {/* Icon with smooth rotation */}
            <div className="relative z-10 transition-transform duration-300 ease-in-out">
              {isExpanded || isMobileOpen ? (
                <ChevronLeft size={18} className="transform group-hover:scale-110 transition-transform duration-200 drop-shadow-sm text-gray-200 group-hover:text-white" />
              ) : (
                <ChevronRight size={20} className="transform group-hover:scale-110 transition-transform duration-200 drop-shadow-sm text-gray-200 group-hover:text-white" />
              )}
            </div>

            {/* Ripple effect on click */}
            <div className="absolute inset-0 rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gray-500/30 transform scale-0 group-active:scale-100 transition-transform duration-200 ease-out rounded-xl" />
            </div>

            {/* Subtle pulse animation when collapsed */}
            {!isExpanded && !isMobileOpen && (
              <div className="absolute inset-0 rounded-xl border-2 border-gray-600/20 animate-pulse opacity-40" />
            )}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar px-5" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#404040 transparent',
        }}>
          <nav className="mb-6">
            <div className="flex flex-col gap-4">
              <div className="pt-4">{renderMenuItems(navItems, "main")}</div>
            </div>
          </nav>
          {(isExpanded || isMobileOpen) && (
            <div className="mt-auto">
              <SidebarWidget />
            </div>
          )}
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-600/50 to-transparent"></div>
      </aside>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .no-scrollbar::-webkit-scrollbar-track {
          background: rgba(64, 64, 64, 0.1);
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(64, 64, 64, 0.5);
          border-radius: 3px;
        }
        .no-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(64, 64, 64, 0.7);
        }
      `}</style>
    </>
  )
}

export default AppSidebar