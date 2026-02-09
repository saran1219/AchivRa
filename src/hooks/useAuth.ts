import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { authService } from '@/services/authService';
import { User as AppUser, UserRole } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userProfile = await authService.getUserProfile(fbUser.uid);
        setUser(userProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = useCallback(
    async (email: string, password: string, displayName: string, role: UserRole, department: string) => {
      try {
        setError(null);
        await authService.register(email, password, displayName, role, department);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      await authService.login(email, password);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await authService.logout();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const signInWithGoogle = useCallback(async (role?: UserRole, dept?: string) => {
    try {
      setError(null);
      await authService.signInWithGoogle(role, dept);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const signUpWithGoogle = useCallback(async (role: UserRole, dept: string) => {
    try {
      setError(null);
      await authService.signUpWithGoogle(role, dept);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-up failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

  return {
    user,
    firebaseUser,
    loading,
    error,
    register,
    login,
    logout,
    signInWithGoogle,
    signUpWithGoogle,
    isAuthenticated: !!user,
  };
};
