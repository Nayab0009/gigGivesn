import axiosInstance from "./axios";

export const sendMessage = async (senderId, receiverId) => {
    try {
        const response = await axiosInstance.post("/messages/conversation", {
            senderId: senderId,
            receiverId: receiverId
        });
        return response.data;
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}
export const uploadfile = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axiosInstance.post("/messages/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }catch(error) {
        console.error("Error uploading file:", error);
        throw error;
    }
}
export const getFiles = async () => {
    try {
        const response = await axiosInstance.get("/files");
        return response.data;
    }
    catch (error)
    {
        console.error("Error getting files:", error);
    }
}