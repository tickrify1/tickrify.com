#!/bin/bash

# Script para desenvolvimento local
echo "🚀 Iniciando desenvolvimento local do Tickrify..."

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale Python 3.8+ primeiro."
    exit 1
fi

# Verificar se o ambiente virtual existe
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

# Instalar dependências
echo "📥 Instalando dependências..."
pip install -r requirements.txt

# Verificar se a chave da OpenAI está configurada
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Criando..."
    echo "OPENAI_API_KEY=your-openai-api-key-here" > .env
    echo "📝 Configure sua chave da OpenAI no arquivo backend/.env"
fi

# Iniciar o servidor FastAPI
echo "🚀 Iniciando servidor FastAPI na porta 8000..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
