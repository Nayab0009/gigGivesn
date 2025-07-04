import { error } from "console";
import axiosInstance from "./axios";
export const deleteEmployee = async (teamId: string) => {
    const response = axiosInstance.delete(`/user/${teamId}`)
    return response;
}
export const ShowEmployee = async (role: string): Promise<any> => {
    try {
        const response = await axiosInstance.get('/user', { params: { role: role } });
        return response;
    }
    catch (error){
        console.log("Error fetching users",error)
    }
    
}