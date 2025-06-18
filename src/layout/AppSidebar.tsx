"use client"
import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "../context/SidebarContext"
import { useAuth } from "../context/AuthContext"
import { LayoutGrid, List, Users, FileText, ChevronLeft, ChevronRight, ChevronDown, Layers } from 'lucide-react'
import {
  GridIcon,
  ListIcon,
  PaperPlaneIcon,
  TableIcon,
  UserCircleIcon,
  EnvelopeListIcon,
} from "../icons/index"

// Define the type for navigation items
type NavItem = {
  name: string
  icon: React.ReactNode
  path?: string
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[]
}

// Add interface for SubItem type
interface SubItem {
  name: string
  path: string
  pro?: boolean
  new?: boolean
}

// Common navigation items for all roles
const commonNavItems: NavItem[] = []

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path: "/dashboard/admin",
  },
  {
    name: "Projects",
    icon: <List size={20} />,
    path: "/dashboard/admin/projects",
  },
  {
    name: "Managers",
    icon: <FileText size={20} />,
    path: "/dashboard/admin/managers",
  },
  {
    icon: <Users size={20} />,
    name: "Teams",
    subItems: [
      { name: "Grid View", path: "/dashboard/admin/team/grid", pro: false },
      { name: "List View", path: "/dashboard/admin/team/list", pro: false },
    ],
  },
]

// Manager-specific navigation items
const managerNavItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path: "/dashboard/manager",
  },
  {
    name: "Projects",
    icon: <List size={20} />,
    path: "/dashboard/manager/addproject",
  },
  {
    name: "Team Members",
    icon: <Users size={20} />,
    path: "/dashboard/admin/addemployee",
  },
]

// Employee-specific navigation items (NEW)
const employeeNavItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path: "/dashboard/teammember",
  },
  {
    name: "My Tasks",
    icon: <ListIcon />,
    path: "/dashboard/teammember/mytasks",
  },

]

// Student-specific navigation items (unchanged)
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
    icon: <UserCircleIcon />,
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

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group w-full transition-all duration-200 ease-in-out ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                  : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-emerald-50 hover:text-emerald-700"
              } cursor-pointer rounded-xl p-3 flex items-center gap-3 ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`transition-all duration-200 ease-in-out flex-shrink-0 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-white"
                    : "text-slate-500 group-hover:text-emerald-600"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isMobileOpen) && (
                <>
                  <span
                    className={`font-medium text-sm flex-1 text-left transition-all duration-200 ease-in-out ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "text-white"
                        : "text-slate-700 group-hover:text-emerald-700"
                    }`}
                  >
                    {nav.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-all duration-200 ease-in-out flex-shrink-0 ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "rotate-180 text-white"
                        : "text-slate-400 group-hover:text-emerald-600"
                    }`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group transition-all duration-200 ease-in-out rounded-xl p-3 flex items-center gap-3 ${
                  isActive(nav.path)
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-emerald-50 hover:text-emerald-700"
                } ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span
                  className={`transition-all duration-200 ease-in-out flex-shrink-0 ${
                    isActive(nav.path) ? "text-white" : "text-slate-500 group-hover:text-emerald-600"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span
                    className={`font-medium text-sm transition-all duration-200 ease-in-out ${
                      isActive(nav.path) ? "text-white" : "text-slate-700 group-hover:text-emerald-700"
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
              <ul className="mt-2 space-y-1 ml-8">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item transition-all duration-200 ease-in-out font-medium text-sm block py-2.5 px-3 rounded-lg flex items-center justify-between ${
                        isActive(subItem.path)
                          ? "bg-emerald-100 text-emerald-700 border-l-2 border-emerald-500"
                          : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600 border-l-2 border-transparent hover:border-emerald-300"
                      }`}
                    >
                      <span>{subItem.name}</span>
                      <div className="flex items-center gap-1">
                        {subItem.new && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                            pro
                          </span>
                        )}
                      </div>
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
    <div className="relative">
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ease-in-out backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 bg-white border-r border-slate-200 shadow-xl
          transition-all duration-300 ease-in-out transform
          ${isExpanded || isMobileOpen ? "w-[320px]" : "w-[90px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header with Logo and Toggle Button */}
        <div
          className={`flex items-center bg-gradient-to-r from-emerald-600 to-teal-700 border-b border-emerald-500/20 transition-all duration-300 ease-in-out ${
            !isExpanded && !isMobileOpen ? "justify-center px-4 py-4" : "justify-between px-6 py-4"
          }`}
        >
          {/* Logo - Only show when expanded */}
          {(isExpanded || isMobileOpen) && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5src/app/dashboard/admin/commercial-listings text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">GiGJives</h1>
            </div>
          )}

          {/* Collapsed Logo */}
          {!isExpanded && !isMobileOpen && (
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Toggle Button */}
          {(isExpanded || isMobileOpen) && (
            <button
              onClick={toggleSidebar}
              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/30"
              aria-label="Toggle Sidebar"
            >
              <ChevronLeft size={16} className="transition-transform duration-200" />
            </button>
          )}
        </div>

        {/* Sidebar Content */}
        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex-1 p-5">
            <div className="space-y-2">{renderMenuItems(navItems, "main")}</div>
          </nav>

          {/* Footer */}
          <div className="p-5 border-t border-slate-200">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-50 to-emerald-50">
              {isExpanded || isMobileOpen ? (
                <>
                  <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-slate-500 truncate capitalize">{user?.role || "Member"}</p>
                  </div>
                </>
              ) : (
                <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expand Button for Collapsed State */}
        {!isExpanded && !isMobileOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 w-6 h-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label="Expand Sidebar"
          >
            <ChevronRight size={12} />
          </button>
        )}
      </aside>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .no-scrollbar::-webkit-scrollbar-track {
          background: rgba(148, 163, 184, 0.1);
        }
        .no-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .no-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  )
}

export default AppSidebar
