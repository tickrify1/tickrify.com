#!/bin/bash

echo "🧪 TESTE COMPLETO TICKRIFY - MOBILE & STRIPE"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}🔍 VERIFICANDO CONFIGURAÇÕES${NC}"
echo "--------------------------------"

# Verificar se os serviços estão rodando
if curl -s http://localhost:5500 > /dev/null; then
    echo -e "${GREEN}✅ Frontend rodando (port 5500)${NC}"
else
    echo -e "${RED}❌ Frontend não está rodando${NC}"
fi

if curl -s http://localhost:8000 > /dev/null; then
    echo -e "${GREEN}✅ Backend rodando (port 8000)${NC}"
else
    echo -e "${RED}❌ Backend não está rodando${NC}"
fi

echo -e "\n${BLUE}📱 VERIFICANDO ARQUIVOS MOBILE${NC}"
echo "-------------------------------"

mobile_files=(
    "src/components/Layout/MobileOptimizer.tsx"
    "src/hooks/useDeviceDetection.ts"
)

for file in "${mobile_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
    fi
done

echo -e "\n${BLUE}💳 VERIFICANDO STRIPE${NC}"
echo "----------------------"

if [ -f "verify-stripe.sh" ]; then
    echo -e "${GREEN}✅ Script de verificação Stripe encontrado${NC}"
else
    echo -e "${RED}❌ Script verify-stripe.sh não encontrado${NC}"
fi

echo -e "\n${GREEN}✨ Teste básico concluído!${NC}"
