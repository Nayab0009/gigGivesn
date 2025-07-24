"use client"
import type React from "react"
import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSidebar } from "../context/SidebarContext"
import { useAuth } from "../context/AuthContext"
import { LayoutGrid, Notebook , Users, FileText, ChevronLeft, ChevronRight, ChevronDown, Calendar ,Building,Timer,MessageCircle ,Folder ,UserPlus  ,MessagesSquare  } from "lucide-react"
import { GridIcon, ListIcon, PaperPlaneIcon, TableIcon, UserCircleIcon, EnvelopeListIcon } from "../icons/index"
import { colors } from "@/colors"

// Add this constant for consistent mobile width
const SIDEBAR_WIDTH_MOBILE = "280px"

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

// Super Admin-specific navigation items
const superAdminNavItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path: "/dashboard/superadmin",
  },
  {
    name: "Organizations",
    icon: <Building size={20} />,
    path: "/dashboard/superadmin/organizations",
  },
  {
    name: "Create Admin",
    icon: <UserPlus size={20} />,
    path: "/dashboard/superadmin/addadmin",
  },
]

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
  {
    icon: <LayoutGrid size={20} />,
    name: "Dashboard",
    path: "/dashboard/admin",
  },
  {
    name: "Projects",
    icon: <Folder size={20} />,
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
    path: "/dashboard/admin/team/list",
  },
   {
    name: "Discussions",
    icon: <MessagesSquare />,
    path: "/dashboard/teammember/discussions",

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
    icon: <Folder size={20} />,
    path: "/dashboard/manager/addproject",
  },
  {
    name: " Team Members",
    icon: <Users size={20} />,
    path: "/dashboard/admin/team/list",
  },
  {
    name: " Sprints",
    icon: <Timer  size={20} />,
    path: "/dashboard/manager/showsprints",
  },
  {
    name: " Chats",
    icon: <MessageCircle  size={20} />,
    path: "/dashboard/manager/chat",
  },
   {
    name: "Discussions",
    icon: <MessagesSquare />,
    path: "/dashboard/teammember/discussions",

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
    name: "My Projects",
    icon: <ListIcon />,
    path: "/dashboard/teammember/mytasks",

  },
  {
    name: "Discussions",
    icon: <MessagesSquare />,
    path: "/dashboard/teammember/discussions",

  },
  {
    name: "My Calender",
    icon: <Calendar  />,
    path: "/dashboard/teammember/calendertasks",

  },
   {
    name: " Chats",
    icon: <MessageCircle  size={20} />,
    path: "/dashboard/manager/chat",
  },
   {
    name: " Notes",
    icon: <Notebook  size={20} />,
    path: "/dashboard/teammember/notes",
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

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group w-full transition-all duration-200 ease-in-out ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "text-white shadow-lg"
                  : "text-slate-600 hover:text-blue-700"
              } cursor-pointer rounded-xl p-3 flex items-center gap-3 ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
              style={openSubmenu?.type === menuType && openSubmenu?.index === index ? { background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` } : {}}
            >
              <span
                className={`transition-all duration-200 ease-in-out flex-shrink-0 ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-white"
                    : "text-slate-500 group-hover:text-blue-700"
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
                        : "text-slate-700 group-hover:text-blue-700"
                    }`}
                  >
                    {nav.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-all duration-200 ease-in-out flex-shrink-0 ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "rotate-180 text-white"
                        : "text-slate-400 group-hover:text-blue-700"
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
                    ? "text-white shadow-lg"
                    : "text-slate-600 hover:text-blue-700"
                } ${!isExpanded ? "lg:justify-center" : "lg:justify-start"}`}
                style={isActive(nav.path) ? { background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` } : {}}
              >
                <span
                  className={`transition-all duration-200 ease-in-out flex-shrink-0 ${
                    isActive(nav.path) ? "text-white" : "text-slate-500 group-hover:text-blue-700"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span
                    className={`font-medium text-sm transition-all duration-200 ease-in-out ${
                      isActive(nav.path) ? "text-white" : "text-slate-700 group-hover:text-blue-700"
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
                          ? "bg-blue-100 text-blue-700 border-l-2 border-blue-500"
                          : "text-slate-600 hover:bg-slate-50 hover:text-blue-600 border-l-2 border-transparent hover:border-blue-300"
                      }`}
                    >
                      <span>{subItem.name}</span>
                      <div className="flex items-center gap-1">
                        {subItem.new && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
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
          ${isExpanded || isMobileOpen ? "w-[280px]" : "w-[80px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header with Logo and Toggle Button */}
        <div
          className={`flex items-center bg-white border-b border-slate-200 transition-all duration-300 ease-in-out ${
            !isExpanded && !isMobileOpen ? "justify-center px-4 py-4" : "justify-between px-6 py-4"
          }`}
        >
          {/* Logo - Only show when expanded */}
          {(isExpanded || isMobileOpen) && (
            <div className="flex items-center gap-3 w-full">
              <div className="w-full h-16 flex items-center justify-center rounded-lg p-2">
                <Image
                  src="/images/logo/giggives_logo.png"
                  alt="GigJives Logo"
                  width={200}
                  height={60}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>
          )}

          {/* Collapsed Logo */}
          {!isExpanded && !isMobileOpen && (
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/images/logo/giggives_logo.png"
                alt="GigJives Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
          )}

          {/* Toggle Button */}
          {(isExpanded || isMobileOpen) && (
            <button
              onClick={toggleSidebar}
              className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300"
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
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: colors.accent.hex }}>
              {isExpanded || isMobileOpen ? (
                <>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` }}>
                    <span className="text-white text-sm font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: colors.primary.hex }}>{user?.name || "User"}</p>
                    <p className="text-xs truncate capitalize" style={{ color: colors.secondary.hex }}>{user?.role || "Member"}</p>
                  </div>
                </>
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center mx-auto" style={{ background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})` }}>
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
            className="absolute -right-3 top-20 w-6 h-6 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none"
            style={{ background: colors.primary.hex }}
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