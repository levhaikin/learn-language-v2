import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: authService.isAuthenticated(),
    userId: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status on mount
    setAuthState({
      isAuthenticated: authService.isAuthenticated(),
      userId: null,
    });
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