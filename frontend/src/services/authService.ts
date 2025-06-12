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

// add withCredentials to axios instance
axiosInstance.defaults.withCredentials = true;

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
  userId?: number;
  message?: string;
  success?: boolean;
  user?: {
    userId: number;
    username: string;
    firstName: string;
  };
}

class AuthService {
  private isAuthenticatedFlag: boolean = false;
  private currentUsername: string | null = null;
  private currentUser: {
    userId: number;
    username: string;
    firstName: string;
  } | null = null;

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(`${API_URL}/auth/signup`, data);

      if (response.data.userId) {
        this.isAuthenticatedFlag = true;
        this.currentUsername = data.username;
      }

      return response.data;
    } catch (error) {
      // Log the error and re-throw so calling code can handle it
      console.error('Sign-up error:', error);
      throw error;
    }
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post(`${API_URL}/auth/signin`, data);

      if (response.data.userId) {
        this.isAuthenticatedFlag = true;
        this.currentUsername = data.username;
      }

      return response.data;
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(`${API_URL}/auth/logout`);
    } catch (error) {
      // Log the error but don't block logout flow – we still clear local state
      console.error('Logout error:', error);
    } finally {
      
      this.isAuthenticatedFlag = false;
      this.currentUsername = null;
      this.currentUser = null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    if (this.isAuthenticatedFlag) {
      return true;
    }
    
    try {
      const response = await axiosInstance.post<AuthResponse>(`${API_URL}/auth/refresh-token`);
      
      if (response.data.success && response.data.user) {
        this.isAuthenticatedFlag = true;
        this.currentUser = response.data.user;
        this.currentUsername = response.data.user.username;
        return true;
      }
      this.isAuthenticatedFlag = false;
      this.currentUser = null;
      this.currentUsername = null;
      return false;
    } catch (refreshError) {
      this.isAuthenticatedFlag = false;
      this.currentUser = null;
      this.currentUsername = null;
      return false;
    }
  }

  getUsername(): string | null {
    return this.currentUsername;
  }

  // Setup axios interceptor for token refresh
  setupAxiosInterceptors() {
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshResponse = await axios.post<AuthResponse>(`${API_URL}/auth/refresh-token`);
            if (refreshResponse.data.success && refreshResponse.data.user) {
              this.isAuthenticatedFlag = true;
              this.currentUser = refreshResponse.data.user;
              this.currentUsername = refreshResponse.data.user.username;
            }
            return axios(originalRequest);
          } catch (refreshError) {
            this.isAuthenticatedFlag = false;
            this.currentUsername = null;
            this.currentUser = null;
            // Optionally navigate to login or handle logout
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