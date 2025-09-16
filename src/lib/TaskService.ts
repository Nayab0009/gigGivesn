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


//task created by manager 
export const createManagerTask = async (taskData: any): Promise<any> => {
    try {
        const response = await axiosInstance.post('/tasks/created/manager', taskData);
        return response.data;
    } catch (error) {
        console.log("Error creating task", error);
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