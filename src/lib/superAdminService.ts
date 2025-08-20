import axiosInstance from "./axios";
export interface AdminData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: string;
    industry: string;
    organizationId: string;
}
export const createadmin = async (data:AdminData) => {
    const response = await axiosInstance.post(`/user/superadmin`, data);
    return response.data;
}