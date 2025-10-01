import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { AuthCallback } from './pages/AuthCallback';
import './index.css';
import { SupabaseDataProvider } from './hooks/useSupabaseDataProvider';
import { ClerkProvider } from '@clerk/clerk-react';

// Import your Publishable Key
const PUBLISHABLE_KEY = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;

// Renderização tolerante: se a chave do Clerk não estiver configurada,
// renderiza a aplicação sem o ClerkProvider (ex.: ambientes de deploy sem segredo configurado)
const RootTree = (
  <StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <BrowserRouter>
          <SupabaseDataProvider>
            <Routes>
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/*" element={<App />} />
            </Routes>
          </SupabaseDataProvider>
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <BrowserRouter>
        <SupabaseDataProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </SupabaseDataProvider>
      </BrowserRouter>
    )}
  </StrictMode>
);

// Aplicação Tickrify - Plataforma Real
createRoot(document.getElementById('root')!).render(RootTree)