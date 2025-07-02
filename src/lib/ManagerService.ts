import axiosInstance from "./axios";
export const deleteManager = async (managerId: string) => {
    const response = axiosInstance.delete(`/user/${managerId}`)
    return response;
}
export const updateManager = async (managerId: string,data:any) => {
    const response = axiosInstance.patch(`/user/${managerId}`, data);
    return response;
}