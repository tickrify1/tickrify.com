#!/bin/bash

echo "🚀 Tickrify - Script de Configuração Automática"
echo "================================================"

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na pasta raiz do projeto Tickrify"
    exit 1
fi

echo "📦 Instalando dependências do frontend..."
npm install

echo "🐍 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 não encontrado. Instale Python 3.8+ primeiro."
    exit 1
fi

echo "📦 Instalando dependências do backend..."
cd backend
pip3 install -r requirements.txt

echo "🔑 Configurando OpenAI (opcional)..."
if [ ! -f ".env" ]; then
    echo "Digite sua chave da OpenAI (ou pressione Enter para pular):"
    read -s openai_key
    if [ ! -z "$openai_key" ]; then
        echo "OPENAI_API_KEY=$openai_key" > .env
        echo "✅ Chave OpenAI configurada!"
    else
        echo "⚠️  Pulando OpenAI - usando análise simulada"
    fi
else
    echo "✅ Arquivo .env já existe"
fi

cd ..

echo ""
echo "🎉 Configuração concluída!"
echo ""
echo "Para executar:"
echo "  Frontend apenas:     npm run dev"
echo "  Backend apenas:      npm run dev:backend"  
echo "  Ambos juntos:        npm run dev:full"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
