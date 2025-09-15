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
    const { data } = await axiosInstance.get('/projects');
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