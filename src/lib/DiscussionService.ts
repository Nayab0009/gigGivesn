import axiosInstance from "./axios";
export const createDiscussion = async (DiscussionData: any) => {
    try {
        const response = await axiosInstance.post(`/discussions`, DiscussionData);
        return response.data;
    }
    catch (error) {
        console.log('error to create a discussion ');
        throw error;
    }
}
export const getDiscussions = async () => {
    const response = await axiosInstance.get(`/discussions`);
    return response;
}

// Post a comment to a discussion
export const createDiscussionComment = async (data: { comment: string; discussion: number }) => {
    try {
        const response = await axiosInstance.post(`/discussions/comment`, data);
        return response.data;
    } catch (error) {
        console.log('error to create a discussion comment');
        throw error;
    }
}

// Get comments for a discussion by id
export const getDiscussionComments = async (discussionId: number) => {
    try {
        const response = await axiosInstance.get(`/discussions/comment/for/${discussionId}`);
        return response.data;
    } catch (error) {
        console.log('error to fetch discussion comments');
        throw error;
    }
}