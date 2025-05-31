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
      { name: "Grid View", path: "/dashboard/admin/team/grid", pro: false },
      { name: "List View", path: "/dashboard/admin/team/list", pro: false }
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
              <ul className="mt-2 space-y-2 ml-12">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item transition-all duration-300 ease-in-out hover:scale-[1.02] font-medium text-base tracking-wide block py-3 px-4 rounded-lg ${
                        isActive(subItem.path)
                          ? "bg-gray-800/70 text-white shadow-md border-l-2 border-gray-400"
                          : "text-gray-400 hover:bg-gray-800/50 hover:text-white hover:pl-6 border-l-2 border-transparent hover:border-gray-500/70"
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
          transition-all duration-300 ease-in-out transform w-[300px]
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
        {/* Header with Logo */}
        <div className="flex items-center justify-center px-6 py-4 backdrop-blur-md border-b-2 border-gray-700/40">
          <Link href="/" className="transition-transform duration-300 ease-in-out hover:scale-105">
            <Image
              className="transition-opacity duration-300 ease-in-out hover:opacity-90 drop-shadow-lg"
              src="/images/logo/lemaraLogo.png"
              alt="Logo"
              width={160}
              height={35}
              style={{
                filter: 'brightness(1.4) contrast(1.2) saturate(0.8)',
              }}
            />
          </Link>
        </div>

        {/* Updated menu items styling */}
        <nav className="flex flex-col overflow-y-auto px-4 py-6">
          <ul className="flex flex-col gap-3">
            {navItems.map((nav, index) => (
              <li key={nav.name}>
                {nav.path ? (
                  <Link
                    href={nav.path}
                    className={`menu-item group flex items-center gap-3 p-4 text-lg rounded-xl transition-all duration-300 ${
                      isActive(nav.path)
                        ? "bg-gray-800/60 text-white shadow-lg border-l-4 border-gray-400"
                        : "text-gray-300 hover:bg-gray-800/40 hover:text-white border-l-4 border-transparent hover:border-gray-500/70"
                    }`}
                  >
                    <span className="text-2xl">{nav.icon}</span>
                    <span className="font-medium">{nav.name}</span>
                  </Link>
                ) : (
                  nav.subItems && (
                    <div>
                      <button
                        onClick={() => handleSubmenuToggle(index, "main")}
                        className={`menu-item group flex items-center justify-between p-4 text-lg rounded-xl transition-all duration-300 ${
                          openSubmenu?.type === "main" && openSubmenu?.index === index
                            ? "bg-gray-800/60 text-white shadow-lg border-l-4 border-gray-400"
                            : "text-gray-300 hover:bg-gray-800/40 hover:text-white border-l-4 border-transparent hover:border-gray-500/70"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{nav.icon}</span>
                          <span className="font-medium">{nav.name}</span>
                        </div>
                        <ChevronDownIcon
                          className={`w-5 h-5 transition-all duration-300 ease-in-out ${
                            openSubmenu?.type === "main" && openSubmenu?.index === index
                              ? "rotate-180 text-white"
                              : "text-gray-300 group-hover:text-white"
                          }`}
                        />
                      </button>
                      {openSubmenu?.type === "main" && openSubmenu?.index === index && (
                        <div
                          ref={(el) => {
                            subMenuRefs.current[`main-${index}`] = el
                          }}
                          className="overflow-hidden transition-all duration-300 ease-in-out"
                          style={{
                            height:
                              openSubmenu?.type === "main" && openSubmenu?.index === index
                                ? `${subMenuHeight[`main-${index}`]}px`
                                : "0px",
                            opacity: openSubmenu?.type === "main" && openSubmenu?.index === index ? 1 : 0,
                          }}
                        >
                          <ul className="mt-2 space-y-2 ml-12">
                            {nav.subItems.map((subItem) => (
                              <li key={subItem.name}>
                                <Link
                                  href={subItem.path}
                                  className={`menu-dropdown-item transition-all duration-300 ease-in-out hover:scale-[1.02] font-medium text-base tracking-wide block py-3 px-4 rounded-lg ${
                                    isActive(subItem.path)
                                      ? "bg-gray-800/70 text-white shadow-md border-l-2 border-gray-400"
                                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white hover:pl-6 border-l-2 border-transparent hover:border-gray-500/70"
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
                    </div>
                  )
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* ...existing widget code... */}
      </aside>

      {/* ...existing styles... */}
    </>
  )
}

export default AppSidebar