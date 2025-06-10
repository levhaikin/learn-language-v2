import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Configure axios instance with default settings
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required for cookies
    headers: {
      'Content-Type': 'application/json',
    },
  });

export interface SignUpData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface SignInData {
  username: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  message: string;
}

class AuthService {
  private isAuthenticatedFlag: boolean = false;

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await axiosInstance.post(`${API_URL}/auth/signup`, data);
    if (response.data.userId) {
      this.isAuthenticatedFlag = true;
    }
    return response.data;
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await axiosInstance.post(`${API_URL}/auth/signin`, data);
    if (response.data.userId) {
      this.isAuthenticatedFlag = true;
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await axiosInstance.post(`${API_URL}/auth/logout`);
    this.isAuthenticatedFlag = false;
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      // Try to refresh the token
      await axiosInstance.post(`${API_URL}/auth/refresh-token`);
      this.isAuthenticatedFlag = true;
    } catch (refreshError) {
      this.isAuthenticatedFlag = false;
    }
    
    return this.isAuthenticatedFlag;
  }

  // Setup axios interceptor for token refresh
  setupAxiosInterceptors() {
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If the error is 401 and we haven't tried to refresh the token yet
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            // Try to refresh the token
            await axios.post(`${API_URL}/auth/refresh-token`);
            
            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            // If refresh fails, user needs to login again
            this.isAuthenticatedFlag = false;
            throw refreshError;
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const authService = new AuthService();
authService.setupAxiosInterceptors(); 