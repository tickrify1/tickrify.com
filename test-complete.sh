#!/bin/bash

echo "🧪 TESTE COMPLETO TICKRIFY - MOBILE & STRIPE"
echo "=============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Função para testar se um serviço está rodando
test_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name está rodando${NC}"
        return 0
    else
        echo -e "${RED}❌ $name não está rodando${NC}"
        return 1
    fi
}

# Função para testar endpoint específico
test_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ $name (HTTP $status)${NC}"
        return 0
    else
        echo -e "${RED}❌ $name (HTTP $status, esperado $expected_status)${NC}"
        return 1
    fi
}

echo -e "\n${BLUE}🔍 1. VERIFICANDO ARQUIVOS E CONFIGURAÇÕES${NC}"
echo "----------------------------------------------"

# Verificar arquivos essenciais
files=(
    ".env"
    "src/components/Layout/Header.tsx"
    "src/components/Layout/Sidebar.tsx"
    "src/components/Layout/MobileOptimizer.tsx"
    "src/hooks/useDeviceDetection.ts"
    "src/hooks/useStripeCheckout.ts"
    "src/stripe-config.ts"
    "backend/main.py"
    "verify-stripe.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file não encontrado${NC}"
    fi
done

echo -e "\n${BLUE}🌐 2. TESTANDO SERVIÇOS${NC}"
echo "------------------------"

# Testar frontend
test_service "http://localhost:5500" "Frontend (Vite)"
frontend_running=$?

# Testar backend
test_service "http://localhost:8000" "Backend (FastAPI)"
backend_running=$?

# Testar endpoints específicos do backend
if [ $backend_running -eq 0 ]; then
    echo -e "\n${BLUE}🔗 3. TESTANDO ENDPOINTS BACKEND${NC}"
    echo "--------------------------------"
    
    test_endpoint "http://localhost:8000/docs" "FastAPI Docs"
    test_endpoint "http://localhost:8000/health" "Health Check"
    test_endpoint "http://localhost:8000/api/auth/me" "Auth Endpoint" "422"
    
    # Testar CORS
    echo -e "\n${BLUE}🌍 4. TESTANDO CORS${NC}"
    echo "------------------"
    
    cors_test=$(curl -s -X OPTIONS \
        -H "Origin: http://localhost:5500" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -I "http://localhost:8000/api/auth/login" 2>/dev/null | grep -i "access-control-allow-origin")
    
    if [ ! -z "$cors_test" ]; then
        echo -e "${GREEN}✅ CORS configurado corretamente${NC}"
    else
        echo -e "${YELLOW}⚠️ CORS pode precisar de ajustes${NC}"
    fi
fi

echo -e "\n${BLUE}💳 5. VERIFICANDO CONFIGURAÇÃO STRIPE${NC}"
echo "--------------------------------------"

# Executar verificação do Stripe
if [ -f "verify-stripe.sh" ]; then
    ./verify-stripe.sh | tail -5
else
    echo -e "${RED}❌ Script verify-stripe.sh não encontrado${NC}"
fi

echo -e "\n${BLUE}📱 6. VERIFICANDO RESPONSIVIDADE${NC}"
echo "--------------------------------"

# Verificar se os componentes mobile estão presentes
mobile_components=(
    "MobileOptimizer"
    "useDeviceDetection"
    "mobile-optimized"
    "device-mobile"
    "isMobile"
)

for component in "${mobile_components[@]}"; do
    if grep -r "$component" src/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $component implementado${NC}"
    else
        echo -e "${YELLOW}⚠️ $component não encontrado${NC}"
    fi
done

echo -e "\n${BLUE}🎨 7. VERIFICANDO CSS MOBILE${NC}"
echo "----------------------------"

# Verificar classes CSS mobile
if grep -q "mobile-" src/index.css; then
    echo -e "${GREEN}✅ Classes CSS mobile implementadas${NC}"
else
    echo -e "${YELLOW}⚠️ Classes CSS mobile podem estar faltando${NC}"
fi

# Verificar media queries
if grep -q "@media.*max-width.*768px" src/index.css; then
    echo -e "${GREEN}✅ Media queries mobile encontradas${NC}"
else
    echo -e "${YELLOW}⚠️ Media queries mobile podem estar faltando${NC}"
fi

echo -e "\n${BLUE}🔧 8. TESTANDO DEPENDÊNCIAS${NC}"
echo "----------------------------"

# Verificar se as dependências estão instaladas
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Node modules instalados${NC}"
else
    echo -e "${RED}❌ Node modules não encontrados (execute: npm install)${NC}"
fi

# Verificar dependências específicas
key_deps=("@stripe/stripe-js" "lucide-react" "tailwindcss")
for dep in "${key_deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo -e "${GREEN}✅ $dep no package.json${NC}"
    else
        echo -e "${RED}❌ $dep não encontrado no package.json${NC}"
    fi
done

echo -e "\n${PURPLE}📊 9. RESUMO DOS TESTES${NC}"
echo "========================="

# Contador de sucessos
tests_passed=0
total_tests=8

if [ $frontend_running -eq 0 ]; then ((tests_passed++)); fi
if [ $backend_running -eq 0 ]; then ((tests_passed++)); fi
if [ -f ".env" ]; then ((tests_passed++)); fi
if [ -f "src/components/Layout/MobileOptimizer.tsx" ]; then ((tests_passed++)); fi
if [ -f "verify-stripe.sh" ]; then ((tests_passed++)); fi
if grep -q "mobile-" src/index.css; then ((tests_passed++)); fi
if [ -d "node_modules" ]; then ((tests_passed++)); fi
if grep -q "@stripe/stripe-js" package.json; then ((tests_passed++)); fi

echo -e "${BLUE}Testes passaram: $tests_passed/$total_tests${NC}"

if [ $tests_passed -eq $total_tests ]; then
    echo -e "${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}✨ Plataforma pronta para uso!${NC}"
elif [ $tests_passed -ge 6 ]; then
    echo -e "${YELLOW}⚠️ Maioria dos testes passou (bom estado)${NC}"
    echo -e "${YELLOW}💡 Alguns ajustes menores podem ser necessários${NC}"
else
    echo -e "${RED}❌ Alguns testes falharam${NC}"
    echo -e "${RED}🔧 Verificar configurações antes de continuar${NC}"
fi

echo -e "\n${BLUE}🚀 PRÓXIMAS AÇÕES SUGERIDAS:${NC}"
echo "1. Testar navegação mobile no navegador"
echo "2. Testar fluxo de pagamento Stripe"
echo "3. Fazer deploy em produção"
echo "4. Configurar webhooks do Stripe"
echo "5. Monitorar logs em produção"

echo -e "\n${GREEN}Teste concluído!${NC}"
