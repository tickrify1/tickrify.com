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

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the frontend/.env file');
}

// Aplicação Tickrify - Plataforma Real
createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>
)