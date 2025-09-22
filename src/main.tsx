import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import { AuthCallback } from './pages/AuthCallback';
import './index.css';
import { SupabaseDataProvider } from './hooks/useSupabaseDataProvider';

// Aplicação Tickrify - Plataforma Real
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SupabaseDataProvider>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </SupabaseDataProvider>
    </BrowserRouter>
  </StrictMode>
)