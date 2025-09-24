import axiosInstance from "./axios";


export const getAllUsers = async () => {
  const { data } = await axiosInstance.get('/user');
  return data;
}