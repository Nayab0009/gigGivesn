"use client"

import type React from "react"
import Header from "../../layout/AppHeader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerHeight = 72 // adjust based on your AppHeader height

  return (
    <div className="min-h-screen w-full dark:bg-gray-900 flex flex-col relative">
      {/* Header */}
      <div className="relative z-40">
        <Header />
      </div>

      {/* Page content */}
      <main
        className="flex-1 p-4 md:p-6  transition-all duration-500 ease-in-out"
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
