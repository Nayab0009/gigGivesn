import axiosInstance from "./axios";

// Function to show a notification
export const showNotification = async (notificationData: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('/notification', notificationData);
        return response.data;
    } catch (error) {
        console.log("Error showing notification", error);
        throw error;
    }
};

// Function to get notifications for a user
export const getNotifications = async (token?: string): Promise<any> => {
    try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axiosInstance.get(`/notification/specific/user`, { headers });
        return response.data;
    } catch (error) {
        console.log("Error fetching notifications", error);
        throw error;
    }
};