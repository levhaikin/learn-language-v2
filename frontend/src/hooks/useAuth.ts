import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: number | null;
  username: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    username: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await authService.isAuthenticated();
        setAuthState({
          isAuthenticated,
          isLoading: false,
          userId: null, // You might want to get this from authService too
          username: authService.getUsername(),
        });
      } catch (e) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
          username: null,
        });
      }
    };
    
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    // This should be updated to get user from signIn method if it returns it
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      userId: null,
      username: authService.getUsername(),
    });
    navigate('/');
  };

  const handleSignOut = async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      username: null,
    });
    navigate('/auth');
  };

  return { ...authState, onSignIn: handleSignIn, onSignOut: handleSignOut };
} 