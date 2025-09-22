import { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);

  if (!isOpen) return null;

  const switchToLogin = () => {
    console.log('Mudando para tela de login');
    setView('login');
  };

  const switchToRegister = () => {
    console.log('Mudando para tela de registro');
    setView('register');
  };

  const handleClose = () => {
    console.log('Fechando modal de autenticação');
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Content */}
        <div className="p-6 sm:p-8">
          {view === 'login' ? (
            <LoginForm onSwitchToRegister={switchToRegister} onClose={handleClose} />
          ) : (
            <RegisterForm onSwitchToLogin={switchToLogin} onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
}