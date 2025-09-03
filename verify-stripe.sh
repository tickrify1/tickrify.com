#!/bin/bash

echo "🔍 VERIFICAÇÃO COMPLETA DO STRIPE TICKRIFY"
echo "=========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se uma variável existe e não está vazia
check_env_var() {
    local var_name=$1
    local var_value=$2
    local is_secret=${3:-false}
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}❌ $var_name: NÃO CONFIGURADO${NC}"
        return 1
    elif [ "$var_value" = "CONFIGURE_SUA_CHAVE_AQUI" ] || [ "$var_value" = "pk_test_CONFIGURE_SUA_CHAVE_PUBLICA_AQUI" ]; then
        echo -e "${YELLOW}⚠️ $var_name: VALOR PADRÃO (não configurado)${NC}"
        return 1
    else
        if [ "$is_secret" = true ]; then
            echo -e "${GREEN}✅ $var_name: Configurado (${var_value:0:10}...)${NC}"
        else
            echo -e "${GREEN}✅ $var_name: $var_value${NC}"
        fi
        return 0
    fi
}

echo -e "\n${BLUE}📋 1. VERIFICANDO ARQUIVO .env${NC}"
echo "--------------------------------"

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    exit 1
fi

# Carregar variáveis do .env
source .env 2>/dev/null

# Verificar variáveis do Stripe
echo -e "\n${BLUE}🔑 2. VERIFICANDO CHAVES DO STRIPE${NC}"
echo "-----------------------------------"

stripe_configured=true

check_env_var "VITE_STRIPE_PUBLISHABLE_KEY" "$VITE_STRIPE_PUBLISHABLE_KEY" true
if [ $? -ne 0 ]; then stripe_configured=false; fi

check_env_var "STRIPE_SECRET_KEY" "$STRIPE_SECRET_KEY" true
if [ $? -ne 0 ]; then stripe_configured=false; fi

check_env_var "STRIPE_WEBHOOK_SECRET" "$STRIPE_WEBHOOK_SECRET" true
if [ $? -ne 0 ]; then stripe_configured=false; fi

check_env_var "VITE_STRIPE_TRADER_PRICE_ID" "$VITE_STRIPE_TRADER_PRICE_ID"
if [ $? -ne 0 ]; then stripe_configured=false; fi

# Verificar URLs
echo -e "\n${BLUE}🌐 3. VERIFICANDO URLs${NC}"
echo "------------------------"

check_env_var "VITE_APP_URL" "$VITE_APP_URL"
check_env_var "VITE_BACKEND_URL" "$VITE_BACKEND_URL"

# Verificar OpenAI
echo -e "\n${BLUE}🤖 4. VERIFICANDO OPENAI${NC}"
echo "---------------------------"

check_env_var "OPENAI_API_KEY" "$OPENAI_API_KEY" true
check_env_var "VITE_OPENAI_API_KEY" "$VITE_OPENAI_API_KEY" true

# Verificar configurações no código
echo -e "\n${BLUE}⚙️ 5. VERIFICANDO CONFIGURAÇÕES NO CÓDIGO${NC}"
echo "--------------------------------------------"

if [ -f "src/stripe-config.ts" ]; then
    echo -e "${GREEN}✅ Arquivo stripe-config.ts encontrado${NC}"
    
    # Verificar se há price IDs de exemplo
    if grep -q "price_CONFIGURE_SEU_PRICE_ID_AQUI" src/stripe-config.ts; then
        echo -e "${YELLOW}⚠️ Price IDs de exemplo encontrados em stripe-config.ts${NC}"
    else
        echo -e "${GREEN}✅ Price IDs configurados em stripe-config.ts${NC}"
    fi
else
    echo -e "${RED}❌ Arquivo stripe-config.ts não encontrado${NC}"
fi

# Verificar dependências
echo -e "\n${BLUE}📦 6. VERIFICANDO DEPENDÊNCIAS${NC}"
echo "--------------------------------"

if [ -f "package.json" ]; then
    if grep -q "@stripe/stripe-js" package.json; then
        echo -e "${GREEN}✅ @stripe/stripe-js instalado${NC}"
    else
        echo -e "${RED}❌ @stripe/stripe-js não encontrado no package.json${NC}"
    fi
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
fi

# Verificar backend
echo -e "\n${BLUE}🖥️ 7. VERIFICANDO BACKEND${NC}"
echo "-------------------------"

if [ -f "backend/main.py" ]; then
    echo -e "${GREEN}✅ Backend Python encontrado${NC}"
    
    if grep -q "import stripe" backend/main.py; then
        echo -e "${GREEN}✅ Stripe importado no backend${NC}"
    else
        echo -e "${RED}❌ Stripe não importado no backend${NC}"
    fi
    
    if [ -f "backend/requirements.txt" ]; then
        if grep -q "stripe" backend/requirements.txt; then
            echo -e "${GREEN}✅ Stripe no requirements.txt${NC}"
        else
            echo -e "${RED}❌ Stripe não encontrado no requirements.txt${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️ requirements.txt não encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Backend não encontrado${NC}"
fi

# Resumo final
echo -e "\n${BLUE}📊 8. RESUMO DA VERIFICAÇÃO${NC}"
echo "=============================="

if [ "$stripe_configured" = true ]; then
    echo -e "${GREEN}✅ STRIPE: Configurado corretamente${NC}"
    echo -e "${GREEN}🎉 Pronto para processar pagamentos reais!${NC}"
    
    echo -e "\n${BLUE}🚀 PRÓXIMOS PASSOS:${NC}"
    echo "1. Fazer deploy do backend com as variáveis de ambiente"
    echo "2. Configurar webhook do Stripe apontando para seu backend"
    echo "3. Testar o fluxo completo em produção"
    echo "4. Verificar se o CORS está permitindo seu domínio"
    
else
    echo -e "${YELLOW}⚠️ STRIPE: Configuração incompleta${NC}"
    echo -e "${YELLOW}💡 Usando modo DEMO até configuração completa${NC}"
    
    echo -e "\n${BLUE}🔧 PARA CONFIGURAR COMPLETAMENTE:${NC}"
    echo "1. Acesse https://dashboard.stripe.com/apikeys"
    echo "2. Copie suas chaves reais (live ou test)"
    echo "3. Configure no arquivo .env:"
    echo "   - VITE_STRIPE_PUBLISHABLE_KEY=pk_live_..."
    echo "   - STRIPE_SECRET_KEY=sk_live_..."
    echo "   - STRIPE_WEBHOOK_SECRET=whsec_..."
    echo "   - VITE_STRIPE_TRADER_PRICE_ID=price_..."
    echo "4. Configure os price IDs dos produtos no stripe-config.ts"
fi

echo -e "\n${BLUE}🌐 LINKS ÚTEIS:${NC}"
echo "- Dashboard Stripe: https://dashboard.stripe.com"
echo "- Documentação: https://stripe.com/docs"
echo "- Webhooks: https://dashboard.stripe.com/webhooks"
echo "- Produtos: https://dashboard.stripe.com/products"

echo -e "\n${GREEN}Verificação concluída!${NC}"
