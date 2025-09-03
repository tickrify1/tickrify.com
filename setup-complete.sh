#!/bin/bash
# Script para inicializar o sistema Tickrify completamente

echo "🚀 Iniciando Tickrify - Sistema Completo..."

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale o Python 3.8+ para continuar."
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 16+ para continuar."
    exit 1
fi

echo "✅ Dependências do sistema verificadas"

# Ir para o diretório do backend
cd backend

# Verificar se o virtual environment existe
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

# Ativar o ambiente virtual
echo "🔄 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências do backend
echo "📦 Instalando dependências do backend..."
pip install -r requirements.txt

# Voltar para o diretório raiz
cd ..

# Instalar dependências do frontend
echo "📦 Instalando dependências do frontend..."
npm install

echo "✅ Todas as dependências instaladas com sucesso!"

# Verificar arquivo .env
if [ ! -f ".env" ]; then
    echo "⚠️ Arquivo .env não encontrado!"
    echo "📝 Criando arquivo .env de exemplo..."
    cp .env.example .env
    echo "⚠️ Configure suas chaves API no arquivo .env antes de continuar"
else
    echo "✅ Arquivo .env encontrado"
fi

echo ""
echo "🎯 Sistema Tickrify está pronto!"
echo ""
echo "Para iniciar o sistema:"
echo "1️⃣  Terminal 1 - Backend:"
echo "   cd backend && source venv/bin/activate && python main.py"
echo ""
echo "2️⃣  Terminal 2 - Frontend:"
echo "   npm run dev"
echo ""
echo "🌐 O frontend estará disponível em: http://localhost:5173"
echo "🔧 O backend estará disponível em: http://localhost:8000"
echo ""
echo "📋 Não esqueça de configurar:"
echo "   - OPENAI_API_KEY no arquivo .env"
echo "   - STRIPE_SECRET_KEY no arquivo .env (para pagamentos)"
echo "   - STRIPE_WEBHOOK_SECRET no arquivo .env (para webhooks)"
