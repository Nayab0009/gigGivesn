import axiosInstance from "./axios";
export const deleteEmployee = async (teamId: string) => {
    const response = axiosInstance.delete(`/user/${teamId}`)
    return response;
}