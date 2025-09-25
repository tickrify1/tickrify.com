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
  message?: string;
}

export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('tickrify-user', null);
  const [isLoading, setIsLoading] = useState(true);
  // Detectar se o Supabase está configurado
  const supabaseUrlEnv = (import.meta as any).env?.VITE_SUPABASE_URL;
  const supabaseAnonEnv = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  const hasSupabase = !!supabaseUrlEnv && !!supabaseAnonEnv;

  // Utilidades de fallback local (sem Supabase)
  const getLocalUsers = (): Array<User & { password?: string }> => {
    try {
      const raw = localStorage.getItem('tickrify-local-users');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const setLocalUsers = (users: Array<User & { password?: string }>) => {
    try {
      localStorage.setItem('tickrify-local-users', JSON.stringify(users));
    } catch {}
  };

  const generateLocalId = () => `local-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  useEffect(() => {
    // Buscar usuário autenticado ao inicializar
    (async () => {
      try {
        if (!hasSupabase) {
          // Fallback local: apenas finalizar o loading, `useLocalStorage` já traz o usuário salvo
          console.log('⚙️ Supabase não configurado - usando modo local de autenticação');
          return;
        }

        console.log('Verificando sessão do usuário...');
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Sessão:', sessionData);
        
        if (sessionData.session) {
          const { data } = await supabase.auth.getUser();
          console.log('Dados do usuário:', data.user);
          
          if (data.user) {
            setUser({
              id: data.user.id,
              name: data.user.user_metadata?.full_name || data.user.email || '',
              email: data.user.email || '',
              avatar: data.user.user_metadata?.avatar_url,
              user_metadata: data.user.user_metadata
            });
            console.log('Usuário autenticado com sucesso');
          }
        } else {
          console.log('Nenhuma sessão ativa encontrada');
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      console.log('Tentando login com:', email);
      
      // Fallback local quando Supabase não está configurado
      if (!hasSupabase) {
        const users = getLocalUsers();
        const found = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (!found || (found as any).password !== password.trim()) {
          setIsLoading(false);
          return { success: false, error: 'Email ou senha incorretos. Por favor, verifique suas credenciais.' };
        }

        const userData = {
          id: found.id,
          name: found.user_metadata?.full_name || found.name || found.email,
          email: found.email,
          avatar: found.avatar,
          user_metadata: { full_name: found.user_metadata?.full_name || found.name }
        } as User;

        setUser(userData);
        localStorage.setItem('tickrify-user', JSON.stringify(userData));
        setIsLoading(false);
        return { success: true };
      }
      
      // Tentar login com as credenciais fornecidas
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });
      
      // Log detalhado da resposta para depuração
      console.log('Resposta completa do login:', { data, error });
      
      if (error) {
        console.error('Erro de login:', error.message, error.status);
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message;
        if (error.message === 'Invalid login credentials') {
          errorMessage = 'Email ou senha incorretos. Por favor, verifique suas credenciais.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Por favor, verifique sua caixa de entrada.';
        }
        
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
      
      if (!data || !data.user) {
        console.error('Login sem dados de usuário');
        setIsLoading(false);
        return { success: false, error: 'Usuário não encontrado' };
      }
      
      console.log('Login bem-sucedido:', data.user);
      console.log('Sessão:', data.session);
      
      // Salvar usuário no estado
      const userData = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email,
        email: data.user.email || '',
        avatar: data.user.user_metadata?.avatar_url,
        user_metadata: data.user.user_metadata
      };
      
      setUser(userData);
      console.log('Usuário definido no estado:', userData);
      
      // Salvar na sessão do navegador para persistência
      localStorage.setItem('tickrify-user', JSON.stringify(userData));
      
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Erro inesperado no login:', error);
      setIsLoading(false);
      return { success: false, error: 'Ocorreu um erro ao fazer login. Por favor, tente novamente.' };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      console.log('Tentando registrar:', email);
      
      // Fallback local quando Supabase não está configurado
      if (!hasSupabase) {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedName = name.trim();

        if (trimmedPassword.length < 6) {
          setIsLoading(false);
          return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
        }

        const users = getLocalUsers();
        const already = users.find(u => u.email?.toLowerCase() === trimmedEmail.toLowerCase());
        if (already) {
          setIsLoading(false);
          return { success: false, error: 'Este email já está registrado. Por favor, faça login ou use outro email.' };
        }

        const newUser: User & { password?: string } = {
          id: generateLocalId(),
          name: trimmedName || trimmedEmail,
          email: trimmedEmail,
          user_metadata: { full_name: trimmedName },
          avatar: undefined,
          password: trimmedPassword
        };

        users.push(newUser);
        setLocalUsers(users);

        const { password: _pw, ...safeUser } = newUser;
        setUser(safeUser);
        localStorage.setItem('tickrify-user', JSON.stringify(safeUser));
        setIsLoading(false);
        return { success: true };
      }
      
      // Remover espaços em branco
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const trimmedName = name.trim();
      
      // Verificar se a senha atende aos requisitos mínimos
      if (trimmedPassword.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'A senha deve ter pelo menos 6 caracteres' };
      }
      
      // Configurar opções de registro
      const options = { 
        data: { full_name: trimmedName },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      };
      
      console.log('Opções de registro:', options);
      
      // Tentar registrar o usuário
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
        options: options
      });
      
      // Log detalhado da resposta para depuração
      console.log('Resposta completa do registro:', { data, error });
      
      if (error) {
        console.error('Erro no registro:', error.message, error.status);
        
        // Mensagens de erro mais amigáveis
        let errorMessage = error.message;
        if (error.message.includes('already registered')) {
          errorMessage = 'Este email já está registrado. Por favor, faça login ou use outro email.';
        } else if (error.message.includes('password')) {
          errorMessage = 'A senha não atende aos requisitos de segurança. Use pelo menos 6 caracteres.';
        }
        
        setIsLoading(false);
        return { success: false, error: errorMessage };
      }
      
      if (!data || !data.user) {
        console.error('Registro sem dados de usuário');
        setIsLoading(false);
        return { success: false, error: 'Erro ao criar usuário' };
      }
      
      console.log('Registro bem-sucedido:', data);
      
      // Verificar se o email precisa de confirmação
      if (data.session === null) {
        console.log('Email de confirmação enviado. Aguardando confirmação.');
        setIsLoading(false);
        return { 
          success: true, 
          message: 'Conta criada com sucesso! Por favor, verifique seu email para confirmar seu cadastro.'
        };
      }
      
      // Salvar usuário no estado
      const userData = {
        id: data.user.id,
        name: trimmedName,
        email: trimmedEmail,
        avatar: data.user.user_metadata?.avatar_url,
        user_metadata: { full_name: trimmedName }
      };
      
      setUser(userData);
      console.log('Usuário definido no estado:', userData);
      
      // Salvar na sessão do navegador para persistência
      localStorage.setItem('tickrify-user', JSON.stringify(userData));
      
      setIsLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error('Erro inesperado no registro:', error);
      setIsLoading(false);
      return { success: false, error: 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.' };
    }
  };

  const logout = async () => {
    try {
      // Encerrar sessão no Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro ao sair da sessão:', error);
    }

    // Limpar estado e storage local
    setUser(null);
    try {
      localStorage.removeItem('tickrify-user');
    } catch (_) {}

    // Redirecionar para a landing (ou recarregar)
    setTimeout(() => {
      window.location.href = '/';
    }, 50);
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
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