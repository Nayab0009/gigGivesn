"use client";

import React from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProjectProvider } from '@/context/ProjectContext';
import { EmployeeProvider } from '@/context/EmployeeContext';
  
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <ProjectProvider>
          <EmployeeProvider>
            {children}
          </EmployeeProvider>
          </ProjectProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
