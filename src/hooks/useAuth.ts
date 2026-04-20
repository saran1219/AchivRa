import { useState, useEffect, useCallback, useRef } from 'react';
import { User as FirebaseUser, onAuthStateChanged, Auth, getRedirectResult } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { authService } from '@/services/authService';
import { User as AppUser, UserRole } from '@/types';
import { getFirebaseErrorMessage } from '@/utils/firebaseErrors';

export const useAuth = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasCheckedRedirect = useRef(false);

  useEffect(() => {
    const authInstance = auth as Auth | null;
    if (!authInstance) return;

    const handleRedirect = async () => {
      // Run once per app load to check if user redirected back from Google
      if (hasCheckedRedirect.current) return;
      hasCheckedRedirect.current = true;

      try {
        console.log('🔷 Checking Google redirect result...');
        const result = await getRedirectResult(authInstance);
        
        if (result?.user) {
          console.log('🔷 Redirect sign-in successful for:', result.user.email);
          
          // Check if this was a registration attempt
          const pendingReg = sessionStorage.getItem('pending_google_reg');
          if (pendingReg) {
            console.log('🔷 Found pending Google registration data');
            const { role, dept } = JSON.parse(pendingReg);
            sessionStorage.removeItem('pending_google_reg');
            
            // Re-run registration logic
            await authService.handleGoogleUserRegistration(result.user, role, dept);
          } else {
            // Normal login flow
            await authService.handleGoogleUserLogin(result.user);
          }
          
          // The onAuthStateChanged listener will handle setting the user state
        }
      } catch (err: any) {
        console.error('🔷 Redirect handling error:', err);
        setError(getFirebaseErrorMessage(err));
      }
    };

    handleRedirect();

    const unsubscribe = onAuthStateChanged(authInstance, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userProfile = await authService.getUserProfile(fbUser.uid);
          setUser(userProfile);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError(err instanceof Error ? err.message : 'Failed to load user profile');
        }
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
      await authService.signInWithGoogle();
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
