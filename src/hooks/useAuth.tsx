import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import supabase from '../services/supabase';

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
}

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('tickrify-user', null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Buscar usuário autenticado do Supabase ao inicializar
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email || '',
          email: data.user.email || '',
          avatar: data.user.user_metadata?.avatar_url,
          user_metadata: data.user.user_metadata
        });
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Usuário não encontrado' };
      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email,
        email: data.user.email || '',
        avatar: data.user.user_metadata?.avatar_url,
        user_metadata: data.user.user_metadata
      });
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      setIsLoading(false);
      if (error) return { success: false, error: error.message };
      if (!data.user) return { success: false, error: 'Erro ao criar usuário' };
      setUser({
        id: data.user.id,
        name,
        email,
        avatar: data.user.user_metadata?.avatar_url,
        user_metadata: { full_name: name }
      });
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    // Force redirect to landing page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const updateProfile = async (updates: Partial<User>): Promise<AuthResult> => {
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setIsLoading(false);
    if (error) throw error;
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