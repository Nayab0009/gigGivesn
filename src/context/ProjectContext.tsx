"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type ProjectContextType = {
  activeTab: string;
  setActiveTab: (tab: "summary" | "tasks" | "sprints" | "calendar" | "notes" | "members" | "settings") => void;
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeTab, setActiveTab] = useState<
    "summary" | "tasks" | "sprints" | "calendar" | "notes" | "members" | "settings"
  >(() => {
    if (typeof window === 'undefined') return "summary";
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    return (tab as any) === 'sprints' ? 'sprints' :
           (tab as any) === 'calendar' ? 'calendar' :
           (tab as any) === 'members' ? 'members' :
           (tab as any) === 'tasks' ? 'tasks' :
           (tab as any) === 'settings' ? 'settings' : 'summary';
  });

  return (
    <ProjectContext.Provider
      value={{
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
