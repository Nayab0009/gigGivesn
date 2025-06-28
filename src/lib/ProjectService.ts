import axiosInstance from "./axios";
export interface CreateProject {
    name: string,
    description: string,
    startDate: string,
    endDate: string,
}
export const createProject = async (project: CreateProject) => {
    const { data } = await axiosInstance.post('/projects', project);
    return data;
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