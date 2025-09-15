import axiosInstance from "./axios";
export  const  getProjectsForManagers=async (managerId:string)=> {
    const { data } = await axiosInstance.get(`/projects/manager/all?managerId=${managerId}`)
    return data
}
export const createSprint = async (sprintData:any) => {
    try {
        const response = await axiosInstance.post(`/sprint`, sprintData);
        return response.data;
    }
    catch (error) { 
        console.error('Error Creating Sprint');
        throw error;
    }
}
export  const  getSprintsForManagers=async (managerId:string)=> {
    const { data } = await axiosInstance.get(`/sprint/manager/all?managerId=${managerId}`)
    return data
}
export const deleteSprint = async (sprintId: string) => {
    try {
        const response = await axiosInstance.delete(`/sprint/${sprintId}`);
        return response.data;
    } catch (error) {
        console.error('Error Deleting Sprint');
        throw error;
    }
}