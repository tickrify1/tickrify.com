#!/bin/bash
# Script FINAL para iniciar o Tickrify pronto para uso

echo "🚀 Iniciando TICKRIFY - Sistema 100% Completo"
echo "=============================================="

# Função para verificar se um processo está rodando em uma porta
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Verificar se o backend já está rodando
if check_port 8000; then
    echo "✅ Backend já está rodando na porta 8000"
else
    echo "🔄 Iniciando backend..."
    cd backend
    
    # Ativar ambiente virtual se existir
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
    
    # Iniciar backend em background
    nohup python main.py > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "🚀 Backend iniciado (PID: $BACKEND_PID)"
    cd ..
    
    # Esperar o backend inicializar
    echo "⏳ Aguardando backend inicializar..."
    sleep 3
fi

# Verificar se o frontend já está rodando
if check_port 5173; then
    echo "✅ Frontend já está rodando na porta 5173"
else
    echo "🔄 Iniciando frontend..."
    
    # Iniciar frontend em background
    nohup npm run dev > frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "🚀 Frontend iniciado (PID: $FRONTEND_PID)"
    
    # Esperar o frontend inicializar
    echo "⏳ Aguardando frontend inicializar..."
    sleep 5
fi

# Teste rápido do sistema
echo ""
echo "🧪 Testando sistema..."

# Testar backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend: OK (http://localhost:8000)"
else
    echo "❌ Backend: ERRO"
fi

# Testar frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend: OK (http://localhost:5173)"
else
    echo "❌ Frontend: ERRO"
fi

# Status final
echo ""
echo "🎯 TICKRIFY SISTEMA INICIADO!"
echo "=============================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo "📊 Health:   http://localhost:8000/health"
echo ""
echo "📝 Logs disponíveis em:"
echo "   - Backend: backend.log"
echo "   - Frontend: frontend.log"
echo ""
echo "🛑 Para parar o sistema:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "💰 SISTEMA PRONTO PARA GANHAR DINHEIRO!"
echo "🎉 Acesse http://localhost:5173 e comece a vender!"

# Abrir navegador automaticamente (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 Abrindo navegador..."
    open http://localhost:5173
fi
