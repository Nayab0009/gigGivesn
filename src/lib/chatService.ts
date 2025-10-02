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

export const uploadfile = async (file, messageBody, sendBy, recievedBy) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('messageBody', messageBody);
        formData.append('sendBy', sendBy);
        formData.append('recievedBy', recievedBy);

        const response = await axiosInstance.post("/messages/send/file", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};
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
export const deletemessage = async (id:string) => {
    try {
        const response = await axiosInstance.delete(`/messages/${id}`);
        return response.data;
    }
    catch (error)
    {
        console.error("Error deleting message:", error);
    }
}
export const getMessagesByTask = async (taskId: string) => {
    try {
        const response = await axiosInstance.get(`/messages/task/${taskId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching messages for task ${taskId}:`, error);
        throw error;
    }
};