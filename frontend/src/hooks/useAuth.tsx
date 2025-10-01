import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useLocalStorage } from './useLocalStorage';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

export function useAuth() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut, openSignIn, openSignUp, user: clerkUserObj } = useClerk();
  const [user, setUser] = useLocalStorage<User | null>('tickrify-user', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (clerkUser) {
      const mapped: User = {
        id: clerkUser.id,
        name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        avatar: clerkUser.imageUrl,
        user_metadata: { full_name: clerkUser.fullName || undefined }
      };
      setUser(mapped);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [clerkUser, isLoaded, setUser]);

  const login = async (_email: string, _password: string): Promise<AuthResult> => {
    await openSignIn?.({});
    return { success: true };
  };

  const register = async (_name: string, _email: string, _password: string): Promise<AuthResult> => {
    await openSignUp?.({});
    return { success: true };
  };

  const logout = async () => {
    try {
      await signOut();
    } finally {
      setUser(null);
      try { localStorage.removeItem('tickrify-user'); } catch {}
      setTimeout(() => { window.location.href = '/'; }, 50);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResult> => {
    if (!clerkUserObj) return { success: false, error: 'Usuário não encontrado' };
    try {
      await clerkUserObj.update({
        firstName: updates.name || clerkUserObj.firstName || undefined
      } as any);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    await openSignIn?.({});
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    loginWithGoogle
  };
}