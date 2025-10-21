"use client"

import type React from "react"
import Header from "../../layout/AppHeader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header - now scrolls with the page */}
      <div className="relative z-40">
        <Header />
      </div>

      {/* Page content - no margin-top needed since header is no longer fixed */}
      <main className="flex-1 p-4 md:p-[1.875rem] mt-[1.875rem]">
        <div className="w-full max-w-full">{children}</div>
      </main>
    </div>
  )
}