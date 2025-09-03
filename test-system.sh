#!/bin/bash
# Script para testar se o sistema Tickrify está funcionando corretamente

echo "🧪 Testando Sistema Tickrify..."

# Verificar se o backend está rodando
echo "🔍 Verificando backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend está rodando (http://localhost:8000)"
    
    # Testar endpoints principais
    echo "🔍 Testando endpoints..."
    
    # Health check
    HEALTH=$(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null)
    if [ "$HEALTH" = "healthy" ]; then
        echo "✅ Health check: OK"
    else
        echo "❌ Health check: FAILED"
    fi
    
    # Teste de criação de usuário
    EMAIL="test_$(date +%s)@tickrify.com"
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/user/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$EMAIL\",\"password\":\"test123\"}")
    
    if echo "$LOGIN_RESPONSE" | jq -r '.success' 2>/dev/null | grep -q "true"; then
        echo "✅ Sistema de usuários: OK"
        
        # Testar stats do usuário
        STATS_RESPONSE=$(curl -s http://localhost:8000/user/stats/$EMAIL)
        if echo "$STATS_RESPONSE" | jq -r '.success' 2>/dev/null | grep -q "true"; then
            echo "✅ Sistema de estatísticas: OK"
        else
            echo "❌ Sistema de estatísticas: FAILED"
        fi
    else
        echo "❌ Sistema de usuários: FAILED"
    fi
    
else
    echo "❌ Backend não está rodando. Execute:"
    echo "   cd backend && python main.py"
fi

# Verificar se o frontend está rodando
echo ""
echo "🔍 Verificando frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend está rodando (http://localhost:5173)"
else
    echo "❌ Frontend não está rodando. Execute:"
    echo "   npm run dev"
fi

# Verificar arquivo .env
echo ""
echo "🔍 Verificando configurações..."
if [ -f ".env" ]; then
    echo "✅ Arquivo .env encontrado"
    
    # Verificar chaves importantes
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "✅ OpenAI API Key configurada"
    else
        echo "⚠️ OpenAI API Key não configurada ou inválida"
    fi
    
    if grep -q "STRIPE_SECRET_KEY=sk_" .env; then
        echo "✅ Stripe Secret Key configurada"
    else
        echo "⚠️ Stripe Secret Key não configurada"
    fi
    
    if grep -q "VITE_STRIPE_PUBLISHABLE_KEY=pk_" .env; then
        echo "✅ Stripe Publishable Key configurada"
    else
        echo "⚠️ Stripe Publishable Key não configurada"
    fi
    
else
    echo "❌ Arquivo .env não encontrado!"
fi

# Verificar dependências
echo ""
echo "🔍 Verificando dependências..."

if [ -d "node_modules" ]; then
    echo "✅ Dependências do Node.js instaladas"
else
    echo "❌ Execute: npm install"
fi

if [ -d "backend/venv" ]; then
    echo "✅ Ambiente virtual Python criado"
else
    echo "❌ Execute: cd backend && python -m venv venv"
fi

echo ""
echo "📋 Resumo do Sistema:"
echo "=================================="

# Verificar status geral
BACKEND_OK=$(curl -s http://localhost:8000/health > /dev/null && echo "OK" || echo "FAILED")
FRONTEND_OK=$(curl -s http://localhost:5173 > /dev/null && echo "OK" || echo "FAILED")
ENV_OK=$([ -f ".env" ] && echo "OK" || echo "FAILED")

echo "🔧 Backend:     $BACKEND_OK"
echo "🌐 Frontend:    $FRONTEND_OK"
echo "⚙️  Config:     $ENV_OK"

if [ "$BACKEND_OK" = "OK" ] && [ "$FRONTEND_OK" = "OK" ] && [ "$ENV_OK" = "OK" ]; then
    echo ""
    echo "🎉 SISTEMA 100% FUNCIONAL!"
    echo "🌐 Acesse: http://localhost:5173"
else
    echo ""
    echo "⚠️ Sistema precisa de configuração adicional"
    echo "📖 Consulte o arquivo SISTEMA_COMPLETO.md para instruções"
fi
