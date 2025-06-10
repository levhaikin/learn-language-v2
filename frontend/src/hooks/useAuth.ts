import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,  // Start with false
    userId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const isAuthenticated = await authService.isAuthenticated();
      setAuthState(prev => ({
        ...prev,
        isAuthenticated
      }));
    };
    
    checkAuth();
  }, []);

  const handleSignIn = async () => {
    setAuthState({
      isAuthenticated: true,
      userId: null,
    });
    navigate('/');
  };

  const handleSignOut = async () => {
    await authService.logout();
    setAuthState({
      isAuthenticated: false,
      userId: null,
    });
    navigate('/auth');
  };

  return {
    isAuthenticated: authState.isAuthenticated,
    userId: authState.userId,
    onSignIn: handleSignIn,
    onSignOut: handleSignOut,
  };
} 