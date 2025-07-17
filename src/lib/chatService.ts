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
