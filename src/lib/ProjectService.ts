import axiosInstance from "./axios";
export interface CreateProject {
    name: string,
    description: string,
    startDate: string,
    endDate: string,
}

export const createProject = async (project: FormData) => {
  const { data } = await axiosInstance.post("/projects", project, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data
}
export const getAllProjects=async () => {
    const { data } = await axiosInstance.get('/projects/all/dashboard');
    return data;
}
export const getProjectTeam = async (projectId: string) => {
    const data = axiosInstance.get(`/projects/${projectId}`);
    return data;
}   
export const updateProjectStatus = async (projectId: number|string, status: string) => {
    const { data } = await axiosInstance.patch(`/projects/${projectId}`, { status });
    return data;
}
export const deleteProject = async (projectId: number) => {
    const { data } = await axiosInstance.delete(`/projects/${projectId}`);
    return data;
}
export const updateProjectDetails = async (projectId: number|string) => {
    const { data } = await axiosInstance.patch(`/projects/${projectId}`);
    return data;
}

export const getProjectTaskCounts = async (projectId: string) => {
    const { data } = await axiosInstance.get(`/projects/task/count/${projectId}`);
    return data;
}

export const getProjectTaskPriorities = async (projectId: string) => {
    const { data } = await axiosInstance.get(`/projects/task/priority/${projectId}`);
    return data;
}

export interface MemberTaskCount {
    userId: number;
    userName: string;
    projectId: number;
    taskCount: string;
}

export const getProjectMemberTaskCounts = async (projectId: string) => {
    const { data } = await axiosInstance.get(`/tasks/member/project/count/${projectId}`);
    return data as MemberTaskCount[];
}

// Get all tasks for a project (GET /tasks/project/{id})
export interface ProjectTask {
    id: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    title: string;
    description: string | null;
    status: string; // e.g. "inprogress" | "completed" | "cancelled" | others
    comment: string | null;
    taskDate: string | null;
    ticketNumber: string | null;
    priority: string; // e.g. "low" | "medium" | "high"
    // Optional timing fields (backend may expose any of these)
    estimatedHours?: number; // preferred if provided as hours
    spentHours?: number;     // preferred if provided as hours
    estimatedTime?: number | string; // fallback: minutes or formatted string
    spentTime?: number | string;     // fallback: minutes or formatted string
    timeSpent?: number | string;     // alt naming
    taskFor?: {
        id: number;
        name: string;
        email?: string;
        role?: string;
        avatar?: string | null;
    } | null;
}

export const getProjectTasks = async (projectId: string) => {
    const { data } = await axiosInstance.get(`/tasks/project/${projectId}`)
    return data as ProjectTask[]
}