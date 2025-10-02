"use client";

import { ReactNode } from "react";

// Layout props for page wrappers, etc.
export interface LayoutProps {
  children: ReactNode;
}

// --- Project Management Types ---

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  email: string;
  status: "active" | "busy" | "offline";
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: "pending" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: string;
  estimatedHours: number;
}

export interface Team {
  id: string;
  name: string;
  members: User[];
  lead: string;
  department: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  budget: number;
  completion: number;
  team?: Team;
  tasks: Task[];
}
export type Sprint = {
  id: number;
  name: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: string;
  progress?: number;
};