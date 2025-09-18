import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="w-full">
      {initialMode === 'login' ? (
        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 bg-transparent",
              headerTitle: "text-2xl font-bold text-gray-900",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50",
              formButtonPrimary: "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800",
              footerActionLink: "text-blue-600 hover:text-blue-700"
            }
          }}
          redirectUrl="/dashboard"
        />
      ) : (
        <SignUp 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border-0 bg-transparent",
              headerTitle: "text-2xl font-bold text-gray-900",
              headerSubtitle: "text-gray-600",
              socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50",
              formButtonPrimary: "bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800",
              footerActionLink: "text-blue-600 hover:text-blue-700"
            }
          }}
          redirectUrl="/dashboard"
        />
      )}
    </div>
  );
}