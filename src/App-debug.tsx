import { useState } from 'react';

function App() {
  const [contador, setContador] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Tickrify</h1>
          <p className="text-green-600 font-semibold">✅ Aplicação funcionando!</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Contador:</span>
            <span className="text-lg font-bold text-blue-600">{contador}</span>
          </div>
          <button 
            onClick={() => setContador(contador + 1)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Incrementar
          </button>
        </div>
        
        <div className="space-y-2 text-left text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">React funcionando</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Tailwind CSS ativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Estado funcionando</span>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Frontend: http://localhost:5173</p>
          <p>Backend: http://localhost:8000</p>
        </div>
      </div>
    </div>
  );
}

export default App;
