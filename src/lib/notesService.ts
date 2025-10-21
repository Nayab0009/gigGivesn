import axiosInstance from "./axios"

export interface Notespayload {
  title: string
  content: string 
  lastModified?: string // Added for update payload, optional
}

export const addNote = async (payload: Notespayload) => {
  try {
    const response = await axiosInstance.post("/notes", payload)
    return response.data
  } catch (error) {
    throw error
  }
}

export const getNotes = async () => {
  try {
    const response = await axiosInstance.get("/notes")
    return response.data
  } catch (error) {
    throw error
  }
}

export const updateNote = async (id: number, payload: Partial<Notespayload>) => {
  try {
    const response = await axiosInstance.patch(`/notes/${id}`, payload)
    return response.data
  } catch (error) {
    throw error
  }
}

export const deleteNote = async (id: number) => {
  try {
    // Assuming your backend uses DELETE and expects the ID in the URL
    const response = await axiosInstance.delete(`/notes/${id}`)
    return response.data
  } catch (error) {
    throw error
  }
}
