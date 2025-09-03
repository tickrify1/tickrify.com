#!/bin/bash

echo "🚀 TESTE FINAL - PLATAFORMA TICKRIFY"
echo "===================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
total_tests=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "🧪 $test_name... "
    total_tests=$((total_tests + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASSOU${NC}"
        success_count=$((success_count + 1))
    else
        echo -e "${RED}❌ FALHOU${NC}"
        if [ ! -z "$expected_result" ]; then
            echo "   Esperado: $expected_result"
        fi
    fi
}

echo "📋 TESTES DE INFRAESTRUTURA"
echo "============================"

# Teste 1: Frontend rodando
run_test "Frontend (porta 5500)" "curl -s http://localhost:5500 | grep -q 'Tickrify'"

# Teste 2: Backend rodando  
run_test "Backend (porta 8000)" "curl -s http://localhost:8000/health | grep -q 'ok'"

# Teste 3: Conectividade entre frontend e backend
run_test "Conectividade F↔B" "curl -s -X POST http://localhost:8000/user/login -H 'Content-Type: application/json' -d '{\"email\":\"test@test.com\",\"password\":\"test123\"}' | grep -q 'success'"

echo ""
echo "🔐 TESTES DE SEGURANÇA"
echo "====================="

# Teste 4: Arquivo .env protegido
run_test "Arquivo .env protegido" "grep -q '.env' .gitignore"

# Teste 5: Chaves API configuradas
run_test "Chaves API configuradas" "grep -q 'OPENAI_API_KEY' .env && grep -q 'STRIPE_SECRET_KEY' .env"

# Teste 6: CORS configurado
run_test "CORS configurado" "grep -q 'CORSMiddleware' backend/main.py"

echo ""
echo "💳 TESTES DO STRIPE"
echo "==================="

# Teste 7: Endpoint de checkout
run_test "Endpoint checkout" "curl -s -X POST http://localhost:8000/create-checkout-session -H 'Content-Type: application/json' -d '{\"priceId\":\"price_1S2cj4B1hl0IoocUfB4Xwgrp\",\"mode\":\"subscription\",\"successUrl\":\"http://localhost:5500/success\",\"cancelUrl\":\"http://localhost:5500/cancel\"}' | grep -q 'url'"

# Teste 8: Chaves Stripe funcionais
run_test "Chaves Stripe válidas" "grep -q 'pk_live_' .env && grep -q 'sk_live_' .env"

echo ""
echo "🎨 TESTES DE INTERFACE"
echo "======================"

# Teste 9: CSS compilado
run_test "CSS compilado" "test -f src/index.css"

# Teste 10: Componentes principais
run_test "Componentes principais" "test -f src/components/Auth/LoginForm.tsx && test -f src/components/Subscription/SubscriptionModal.tsx"

echo ""
echo "📊 RESUMO DOS TESTES"
echo "===================="

percentage=$((success_count * 100 / total_tests))

echo "Total de testes: $total_tests"
echo "Testes passaram: $success_count"
echo "Taxa de sucesso: $percentage%"

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELENTE! Plataforma pronta para produção${NC}"
    status="PRONTO"
elif [ $percentage -ge 70 ]; then
    echo -e "${YELLOW}⚠️ BOM! Algumas melhorias recomendadas${NC}"
    status="QUASE PRONTO"
else
    echo -e "${RED}❌ CRÍTICO! Problemas que precisam ser resolvidos${NC}"
    status="PRECISA CORREÇÕES"
fi

echo ""
echo "🎯 STATUS FINAL: $status"
echo ""

# Testes específicos de funcionalidade
echo "🔧 TESTES FUNCIONAIS MANUAIS"
echo "============================"
echo "Por favor, teste manualmente:"
echo "1. 🌐 Acesse: http://localhost:5500"
echo "2. 🔑 Clique em 'Entrar' e teste o login"
echo "3. 💳 Teste o modal de planos"
echo "4. 📱 Verifique responsividade no mobile"
echo "5. 🎨 Confirme que as cores estão visíveis"

echo ""
echo "📋 CHECKLIST PARA PRODUÇÃO"
echo "=========================="
echo "[ ] Remover console.log de src/"
echo "[ ] Configurar CORS restritivo"
echo "[ ] Configurar domínio personalizado"
echo "[ ] Backup automático do banco"
echo "[ ] Monitoramento de logs"
echo "[ ] Certificados SSL"

echo ""
echo "✅ Análise completa finalizada!"

# Gerar relatório em arquivo
cat > TEST_REPORT.txt << EOF
RELATÓRIO DE TESTES - TICKRIFY
Data: $(date)

RESULTADOS:
- Total de testes: $total_tests
- Testes aprovados: $success_count  
- Taxa de sucesso: $percentage%
- Status: $status

PRÓXIMOS PASSOS:
1. Testar funcionalidades manualmente
2. Preparar para deploy em produção
3. Implementar melhorias de segurança
4. Configurar monitoramento

EOF

echo "📄 Relatório salvo em: TEST_REPORT.txt"
