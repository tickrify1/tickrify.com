#!/bin/bash

echo "🧪 TESTE DE DIAGNÓSTICO DO STRIPE EM PRODUÇÃO"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis de configuração
PROD_URL="https://tickrify.vercel.app"
LOCAL_BACKEND="http://localhost:8000"

echo -e "${BLUE}1. Verificando se o site em produção está acessível...${NC}"
curl -s -o /dev/null -w "%{http_code}" $PROD_URL | grep -q "200" && echo -e "${GREEN}✅ Site está online${NC}" || echo -e "${RED}❌ Site não está acessível${NC}"

echo -e "\n${BLUE}2. Testando a configuração do Stripe no frontend...${NC}"
echo "Verificando variáveis de ambiente locais:"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    grep "VITE_STRIPE" .env | sed 's/=.*/=***/' || echo -e "${YELLOW}⚠️ VITE_STRIPE_PUBLISHABLE_KEY não encontrada${NC}"
else
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
fi

echo -e "\n${BLUE}3. Verificando se o backend local está rodando...${NC}"
if curl -s "$LOCAL_BACKEND/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend local está rodando${NC}"
    
    echo -e "\n${BLUE}4. Testando endpoint de checkout demo...${NC}"
    DEMO_RESPONSE=$(curl -s -X POST "$LOCAL_BACKEND/stripe/create-checkout-demo" \
        -H "Content-Type: application/json" \
        -d '{
            "priceId": "price_test_demo",
            "mode": "subscription",
            "successUrl": "http://localhost:5502/success",
            "cancelUrl": "http://localhost:5502/cancel",
            "user_email": "test@example.com"
        }')
    
    if echo "$DEMO_RESPONSE" | grep -q "sessionId"; then
        echo -e "${GREEN}✅ Endpoint demo está funcionando${NC}"
        echo "Response: $DEMO_RESPONSE"
    else
        echo -e "${RED}❌ Endpoint demo com problemas${NC}"
        echo "Response: $DEMO_RESPONSE"
    fi
    
    echo -e "\n${BLUE}5. Verificando configuração do Stripe no backend...${NC}"
    HEALTH_RESPONSE=$(curl -s "$LOCAL_BACKEND/health")
    echo "Health check: $HEALTH_RESPONSE"
    
else
    echo -e "${RED}❌ Backend local não está rodando${NC}"
    echo -e "${YELLOW}Para iniciar o backend: cd backend && python main.py${NC}"
fi

echo -e "\n${BLUE}6. Verificando configuração do ambiente para produção...${NC}"
echo "Checklist para produção na Vercel:"
echo "□ VITE_STRIPE_PUBLISHABLE_KEY configurada"
echo "□ STRIPE_SECRET_KEY configurada no backend"
echo "□ URLs de sucesso/cancelamento corretas"
echo "□ CORS configurado para domínio da Vercel"
echo "□ Backend acessível (Railway/Vercel/etc)"

echo -e "\n${BLUE}7. Sugestões para debug em produção:${NC}"
echo "1. Verificar logs da Vercel: vercel logs"
echo "2. Verificar variáveis de ambiente na Vercel"
echo "3. Testar backend separadamente"
echo "4. Verificar console do navegador em produção"

echo -e "\n${YELLOW}Para testar o modal de planos:${NC}"
echo "1. Abrir http://localhost:5502"
echo "2. Fazer login/registro"
echo "3. Tentar acessar análises premium"
echo "4. Verificar se o modal abre com botão X visível"
echo "5. Testar fechamento do modal pelo botão X e clique no fundo"

echo -e "\n${GREEN}Teste concluído!${NC}"
