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
export const updateSprint = async (sprintData:any, sprintId:string) => {
    try {
        const response = await axiosInstance.patch(`/sprint/${sprintId}`, sprintData);
        return response.data;
    }
    catch (error) { 
        console.error('Error Updating Sprint');
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

export const deleteTask  = async (taksId : number) => {
    try {
        const response = await axiosInstance.delete(`/tasks/${taksId}`);
        return response.data;
    } catch (error) {
        console.error('Error Deleting Sprint');
        throw error;
    }
}
export const updateTask = async (taksId: number) => {
    try {
        const response = await axiosInstance.patch(`/tasks/${taksId}`);
        return response.data;
    } catch (error) {
        console.error('Error Deleting Sprint');
        throw error;
    }
}