"use client";

import AppHeader from "@/layout/AppHeader";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Full-width Header */}
      <AppHeader />

      {/* Page Content */}
<div className="flex-1 p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6 pt-20">
        {children}
      </div>
    </div>
  );
}
