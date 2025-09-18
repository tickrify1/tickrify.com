import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Componente de teste simples
function TestApp() {
  return (
    <div style={{ padding: '20px', fontSize: '24px', color: 'blue' }}>
      <h1>🚀 Tickrify Test - Funcionando!</h1>
      <p>Se você vê esta mensagem, o React está funcionando.</p>
    </div>
  );
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <TestApp />
    </StrictMode>
  );
} else {
  console.error('Elemento root não encontrado!');
}
