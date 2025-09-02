import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: string;
  subscription_status: string;
  analyses_used: number;
  analyses_limit: number;
  remaining_analyses: number;
  warning: boolean;
  blocked: boolean;
  sessionId?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('tickrify-user', null);
  const [isLoading, setIsLoading] = useState(true);
  const [forceLogout, setForceLogout] = useState(false);

  useEffect(() => {
    // Simular verificação de autenticação
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Force logout state to override user state
  useEffect(() => {
    if (forceLogout) {
      setUser(null);
    }
  }, [forceLogout, setUser]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      console.log('🔐 Tentando login para:', email);
      
      // Chamar backend para login/criação de usuário
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro no login');
      }

      const data = await response.json();
      console.log('✅ Login bem-sucedido:', data);

      if (data.success && data.user) {
        const currentSessionId = sessionStorage.getItem('tickrify_session_id') || 'unknown';
        
        // Criar objeto User com dados do backend
        const newUser: User = {
          id: data.user.email, // Usar email como ID
          name: data.user.email.split('@')[0], // Nome baseado no email
          email: data.user.email,
          plan: data.user.plan,
          subscription_status: data.user.subscription_status,
          analyses_used: data.user.analyses_used,
          analyses_limit: data.user.analyses_limit,
          remaining_analyses: data.user.remaining_analyses,
          warning: data.user.warning,
          blocked: data.user.blocked,
          sessionId: currentSessionId,
        };

        setUser(newUser);
        setForceLogout(false);
        
        console.log('✅ Usuário autenticado:', newUser);
        return { success: true };
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      return { 
        success: false, 
        error: error.message || 'Erro desconhecido no login' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, _password: string): Promise<AuthResult> => {
    setIsLoading(true);
    
    try {
      // Simular delay de registro
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentSessionId = sessionStorage.getItem('tickrify_session_id') || 'unknown';
      
      // Simular usuário registrado - sempre começa no plano FREE
      const mockUser: User = {
        id: `${Date.now()}_${currentSessionId}`,
        name,
        email,
        avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=40',
        plan: 'free',
        subscription_status: 'inactive',
        analyses_used: 0,
        analyses_limit: 10,
        remaining_analyses: 10,
        warning: false,
        blocked: false,
        sessionId: currentSessionId
      };
      
      setUser(mockUser);
      
      // Garantir que o usuário sempre comece no plano FREE
      console.log('🆓 Usuário registrado - configurando plano FREE por padrão');
      
      setIsLoading(false);
      
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    console.log('🚪 Iniciando logout...');
    
    // Force logout state immediately  
    setForceLogout(true);
    setUser(null);
    
    // Clear all storage immediately
    sessionStorage.clear();
    localStorage.clear();
    
    console.log('✅ Logout concluído, redirecionando...');
    
    // Force immediate redirect
    window.location.replace(window.location.origin);
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

  const refreshUserStats = async (): Promise<void> => {
    if (!user?.email) return;
    
    try {
      console.log('🔄 Atualizando estatísticas do usuário...');
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/user/stats/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('❌ Erro ao buscar stats do usuário');
        return;
      }

      const data = await response.json();
      console.log('📊 Stats atualizadas:', data);

      if (data.success && data.user) {
        // Update user with fresh data from backend
        const updatedUser: User = {
          ...user,
          plan: data.user.plan,
          subscription_status: data.user.subscription_status,
          analyses_used: data.user.analyses_used,
          analyses_limit: data.user.analyses_limit,
          remaining_analyses: data.user.remaining_analyses,
          warning: data.user.warning,
          blocked: data.user.blocked,
        };

        setUser(updatedUser);
        console.log('✅ Usuário atualizado:', updatedUser);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar stats:', error);
    }
  };

  const isAuthenticated = !!user && !forceLogout;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUserStats
  };
}