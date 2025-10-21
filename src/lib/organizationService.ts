import axiosInstance from "./axios";
export const getOrganizations = async () => {
  const response = await axiosInstance.get("/user/Organization");
  return response.data;
}