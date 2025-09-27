import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabase';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Processando callback de autenticação...');
        
        // Obter parâmetros da URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Log dos parâmetros para depuração
        console.log('Hash params:', Object.fromEntries(hashParams.entries()));
        console.log('Query params:', Object.fromEntries(queryParams.entries()));

        // Trocar o "code" por sessão (PKCE/OAuth) quando presente
        const hasCode = queryParams.get('code');
        if (hasCode) {
          const { data: exchData, error: exchErr } = await (supabase as any).auth.exchangeCodeForSession(window.location.href);
          if (exchErr) {
            console.error('Erro ao trocar code por sessão:', exchErr);
            setError(exchErr.message);
            setLoading(false);
            return;
          }
          console.log('Sessão obtida via exchangeCodeForSession:', exchData);
        }
        
        // Processar a sessão do Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao processar callback:', error);
          setError(error.message);
          setLoading(false);
          return;
        }
        
        if (data?.session) {
          console.log('Sessão autenticada com sucesso:', data.session);
          
          // Obter dados do usuário
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            // Salvar usuário no localStorage
            const user = {
              id: userData.user.id,
              name: userData.user.user_metadata?.full_name || userData.user.email,
              email: userData.user.email || '',
              avatar: userData.user.user_metadata?.avatar_url,
              user_metadata: userData.user.user_metadata
            };
            
            localStorage.setItem('tickrify-user', JSON.stringify(user));
            console.log('Usuário salvo no localStorage:', user);
          }
          
          // Redirecionar para a página principal
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          console.log('Nenhuma sessão encontrada no callback');
          setError('Falha na autenticação. Por favor, tente novamente.');
        }
      } catch (err) {
        console.error('Erro inesperado no callback:', err);
        setError('Ocorreu um erro durante a autenticação.');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          {loading ? (
            <>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando autenticação...</h2>
              <p className="text-gray-600">Por favor, aguarde enquanto finalizamos o processo.</p>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Falha na autenticação</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Voltar para o login
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Autenticação concluída!</h2>
              <p className="text-gray-600 mb-4">Você será redirecionado em instantes...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
