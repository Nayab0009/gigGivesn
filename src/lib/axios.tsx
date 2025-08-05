import axios, { AxiosInstance, AxiosError } from "axios"
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "https://geekjives-26190134d520.herokuapp.com",
  // baseURL: "http://192.168.1.22:3002",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    console.log('Auth Token:', token ? 'Present' : 'Not found'); // Debug line
    
    // If token exists, add it to the authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Added Authorization header'); // Debug line
    } else {
      console.log('No token available for request'); // Debug line
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle 401 errors (unauthorized)
    if (error.response && error.response.status === 401) {

      if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
       
        window.location.href = '/signin';
        
        console.log('Unauthorized access detected, redirecting to login page');
      }
    }
   
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT' || !error.response) {
      console.error('Network error detected:', error.message);
  
      if (typeof window !== 'undefined') {
        console.log('API is unreachable. Falling back to local handling.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
