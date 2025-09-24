import { error } from "console";
import axiosInstance from "./axios";

//get all the tasks 
export const getAllTasks = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/tasks');
        return response.data;
    } catch (error) {
        console.log("Error fetching tasks", error);
        throw error;
    }
};

// Get tasks by status for a specific manager
export const getTasksByStatus = async (managerId: string): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/tasks/manager/only/${managerId}`);
        return response.data;
    } catch (error) {
        console.log(`Error fetching manager tasks`, error);
        throw error;
    }
};

//get tasks by employee id
export const getTasksByEmployeeId = async (employeeId: string): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/tasks/employee/${employeeId}`);
        return response.data;
    } catch (error) {
        console.log("Error fetching employee tasks", error);
        throw error;
    }
};

//get task by id
export const getTaskById = async (taskId: string): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.log("Error fetching task", error);
        throw error;
    }
};

//create a new task
export const createTask = async (taskData: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('/tasks', taskData);
        return response.data;
    } catch (error) {
        console.log("Error creating task", error);
        throw error;
    }
}   


 

//get tasks created by manager
export const getManagerTasks = async (): Promise<any> => {
    try {
        console.log("Calling GET /tasks/created/manager API endpoint");
        
        // First try the specific manager endpoint
        try {
            const response = await axiosInstance.get('/tasks/created/manager');
            // console.log("API response from /tasks/created/manager:", response);
            return response.data;
        } catch (managerError: any) {
            console.error("Error with /tasks/created/manager:", managerError);
            
            // If that fails, try the general tasks endpoint as fallback
            // console.log("Trying fallback to GET /tasks");
            const fallbackResponse = await axiosInstance.get('/tasks');
            // console.log("Fallback API response from /tasks:", fallbackResponse);
            return fallbackResponse.data;
        }
    } catch (error: any) {
        console.error("All task fetching attempts failed", error);
        // Log more detailed error information
        if (error.response) {
             console.error("Response data:", error.response.data);
             console.error("Response status:", error.response.status);
        }
        throw error;
    }
}




//update a task
export const updateTask = async (taskId: string, taskData: any): Promise<any> => {
    try {
        const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
        return response.data;
    } catch (error) {
        console.log("Error updating task", error);
        throw error;
    }
};

//delete a task
export const deleteTask = async (taskId: string): Promise<any> => {
    try {
        const response = await axiosInstance.delete(`/tasks/${taskId}`);
        return response.data;
    }           catch (error) {
        console.log("Error deleting task", error);
        throw error;
    }
};


//get tasks by project id
export const getTasksByProjectId = async (projectId: string): Promise<any> => {
    try {
        const response = await axiosInstance.get(`/tasks/project/${projectId}`);
        return response.data;
    } catch (error) {
        console.log("Error fetching tasks by project", error);
        throw error;
    }
}


//get tasks created by manager today 
export const getManagerTasksToday = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/tasks/manager/today');
        return response.data;
    } catch (error) {
        console.log("Error fetching today's tasks", error);
        throw error;
    }
}   

  
export const getManagerTasksGraphData = async (): Promise<any> => {
    try {
        const response = await axiosInstance.get('/tasks/manager/graphs');
        return response.data;
    } catch (error) {
        console.log("Error fetching tasks graph data", error);
        throw error;
    }
}
