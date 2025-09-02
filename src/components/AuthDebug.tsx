import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDebug: React.FC = () => {
  const { login, isAuthenticated, user, isLoading } = useAuth();
  const [email, setEmail] = useState('teste@teste.com');
  const [password, setPassword] = useState('123456');
  const [status, setStatus] = useState('');

  const handleTestLogin = async () => {
    setStatus('Tentando fazer login...');
    try {
      const result = await login(email, password);
      if (result.success) {
        setStatus('Login realizado com sucesso!');
      } else {
        setStatus(`Erro no login: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Erro: ${error}`);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', borderRadius: '8px' }}>
      <h2>🔧 Debug de Autenticação</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong>
        <ul>
          <li>isLoading: {isLoading ? 'true' : 'false'}</li>
          <li>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</li>
          <li>user: {user ? JSON.stringify(user, null, 2) : 'null'}</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button onClick={handleTestLogin} style={{ padding: '8px 16px' }}>
          Testar Login
        </button>
      </div>
      
      {status && (
        <div style={{ 
          backgroundColor: status.includes('sucesso') ? '#d4edda' : '#f8d7da', 
          padding: '10px', 
          borderRadius: '4px',
          border: status.includes('sucesso') ? '1px solid #c3e6cb' : '1px solid #f5c6cb'
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
