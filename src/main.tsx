import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Erro: Elemento root não encontrado!</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('❌ Erro ao renderizar App:', error);
    document.body.innerHTML = `<div style="color: red; padding: 20px;">Erro ao renderizar: ${error}</div>`;
  }
}