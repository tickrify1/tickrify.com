import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

export function LoginForm({ onSwitchToRegister, onClose }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validar campos
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setError('Por favor, informe seu email');
      return;
    }

    if (!trimmedPassword) {
      setError('Por favor, informe sua senha');
      return;
    }

    try {
      console.log('Iniciando login com:', trimmedEmail);
      const result = await login(trimmedEmail, trimmedPassword);
      console.log('Resultado do login:', result);
      
      if (result.success) {
        console.log('Login bem-sucedido, fechando modal');
        onClose();
        // Force page reload to ensure proper state update
        setTimeout(() => {
          console.log('Recarregando página após login');
          window.location.reload();
        }, 100);
      } else {
        console.error('Erro no login:', result.error);
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('Exceção durante login:', err);
      setError('Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <img src="/tickrify-logo-icon.png" alt="Tickrify" className="h-12 w-auto mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Entrar no Tickrify</h2>
        <p className="text-gray-600 mt-2">Acesse sua conta para continuar</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua senha"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Entrando...</span>
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>Entrar</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={async () => {
            try {
              await loginWithGoogle();
            } catch (err) {
              setError('Erro ao fazer login com Google.');
            }
          }}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-all font-semibold"
          disabled={isLoading}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Entrar com Google
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Não tem uma conta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={isLoading}
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}