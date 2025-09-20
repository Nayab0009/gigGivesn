"use client"

import type React from "react"
import Header from "../../layout/AppHeader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // The header has top-4 (16px) + its height + some padding
  // Accounting for the header's actual position and spacing
  const headerHeight = 88 // Increased to account for top-4 positioning + header height

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      {/* Header */}
      <div className="relative z-40">
        <Header />
      </div>

      {/* Page content */}
      <main
        className="flex-1 p-4 md:p-6 transition-all duration-500 ease-in-out"
        style={{
          marginTop: `${headerHeight}px`,
          minHeight: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        <div className="w-full max-w-full">{children}</div>
      </main>
    </div>
  )
}