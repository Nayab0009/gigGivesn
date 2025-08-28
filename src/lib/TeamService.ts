import { error } from "console";
import axiosInstance from "./axios";
export const deleteEmployee = async (teamId: string) => {
    const response = axiosInstance.delete(`/user/${teamId}`)
    return response;
}
    export const ShowEmployee = async (role: string): Promise<any> => {
        try {
            const response = axiosInstance.get('/user', { params: { role: role } });
            return response;
        }
        catch (error){
            console.log("Error fetching users",error)
        }
        
    }
    export const ShowEmployeeTasks = async () => {
    try {
        const response = await axiosInstance.get('/projects/employee/all')
        return Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.log("Error fetching users", error)
        throw error
    }
}

export const FetchEmployeeProjectTasks = async (userId: number, projectId: number) => {
    try {
        const response = await axiosInstance.post('/tasks/user/all', { userId, projectId })
        return Array.isArray(response.data) ? response.data : []
    } catch (error) {
        console.log('Error fetching tasks', error)
        throw error
    }
}
export const fetchEmployeeAllTasks=async()=>{
    try {
        const response = await axiosInstance.get(`/tasks/user/all`)
        return response.data;
    }
    catch(error){
        console.log("Error fetching users",error)
    }
}
export const updateTeamMember = async (teamId:string,data:any) => {
    try {
        const response = await axiosInstance.patch(`/user/${teamId}`, data);
        return response.data;
    }
    catch (error) {
        console.log("Error fetching users", error)
    }
}