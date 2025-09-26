import axiosInstance from "@/lib/axios";

// API service for user-related operations
export interface UserData {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  name: string;
  password: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  avatar?: string;
}

/**
 * Authenticate user by email and password
 * @param email User email
 * @param password User password
 * @returns Promise with user data if authentication is successful
 */
export const authenticateUser = async (email: string, password: string): Promise<UserData | null> => {
  try {
    // Step 1: Login to get access token and basic info
    const loginResponse = await axiosInstance.post('/auth/login', {
      email,
      password
    });

    console.log('Login API Response:', loginResponse.data);

    if (loginResponse.data && loginResponse.data.access_token) {
      // Store the access token first
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', loginResponse.data.access_token);
      }

      // Step 2: Fetch complete user details using the user ID
      const userId = loginResponse.data.id;
      const userDetails = await getUserById(userId);

      if (userDetails) {
        // Return complete user data with all fields including avatar
        return {
          id: userDetails.id,
          isActive: userDetails.isActive,
          createdAt: userDetails.createdAt,
          updatedAt: userDetails.updatedAt,
          name: userDetails.name,
          password: '', // Don't include password for security
          email: userDetails.email,
          phone: userDetails.phone || '',
          address: userDetails.address || '',
          role: loginResponse.data.role, // Use role from login response
          avatar: userDetails.avatar || '', // This should now have the actual avatar
        };
      } else {
        // Fallback: create user object with available data from login response
        return {
          id: loginResponse.data.id,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          name: email.split('@')[0], // Fallback name
          password: '',
          email: email,
          phone: '',
          address: '',
          role: loginResponse.data.role,
          avatar: '',
        };
      }
    } else {
      console.log('Login response is missing access_token:', loginResponse.data);
      return null;
    }
  } catch (loginError) {
    console.log('Login API endpoint failed:', loginError instanceof Error ? loginError.message : loginError);
    return null;
  }
};

export const getUserById = async (id: number): Promise<UserData | null> => {
  try {
    const response = await axiosInstance.get(`/user/${id}`);
    console.log(`User details for ID ${id}:`, response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    return null;
  }
};