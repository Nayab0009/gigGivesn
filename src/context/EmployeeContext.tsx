"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type EmployeeContextType = {
  activeTab: string;
  setActiveTab: (tab: "summary" | "tasks" | "sprints" | "calendar" | "notes" | "members" | "settings") => void;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const useEmployeeContext = () => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<
    "summary" | "tasks" | "sprints" | "calendar" | "notes" | "members" | "settings"
  >(() => {
    if (typeof window === "undefined") return "sprints"
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    return (tab as any) === "calendar" ? "calendar" : (tab as any) === "members" ? "members" : "sprints"
  });

  return (
    <EmployeeContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};
