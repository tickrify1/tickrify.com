#!/bin/bash
# Script para verificar se o sistema está pronto para deploy

echo "🔍 VERIFICAÇÃO PRÉ-DEPLOY - TICKRIFY"
echo "===================================="

# Verificar se está em ambiente de desenvolvimento
if [[ "$NODE_ENV" == "production" ]]; then
    echo "⚠️ Rodando verificação em ambiente de PRODUÇÃO"
else
    echo "✅ Rodando verificação em ambiente de DESENVOLVIMENTO"
fi

echo ""
echo "📋 Verificando configurações..."

# 1. Verificar variáveis de ambiente críticas
echo "🔑 Verificando variáveis de ambiente:"

if [[ -n "$VITE_STRIPE_PUBLISHABLE_KEY" ]]; then
    if [[ "$VITE_STRIPE_PUBLISHABLE_KEY" == pk_* ]]; then
        echo "✅ VITE_STRIPE_PUBLISHABLE_KEY: Configurada"
    else
        echo "❌ VITE_STRIPE_PUBLISHABLE_KEY: Formato inválido"
    fi
else
    echo "⚠️ VITE_STRIPE_PUBLISHABLE_KEY: Não configurada"
fi

if [[ -n "$VITE_STRIPE_TRADER_PRICE_ID" ]]; then
    if [[ "$VITE_STRIPE_TRADER_PRICE_ID" == price_* ]]; then
        echo "✅ VITE_STRIPE_TRADER_PRICE_ID: Configurada"
    else
        echo "❌ VITE_STRIPE_TRADER_PRICE_ID: Formato inválido"
    fi
else
    echo "⚠️ VITE_STRIPE_TRADER_PRICE_ID: Não configurada"
fi

if [[ -n "$VITE_OPENAI_API_KEY" ]]; then
    if [[ "$VITE_OPENAI_API_KEY" == sk-* ]]; then
        echo "✅ VITE_OPENAI_API_KEY: Configurada"
    else
        echo "❌ VITE_OPENAI_API_KEY: Formato inválido"
    fi
else
    echo "⚠️ VITE_OPENAI_API_KEY: Não configurada"
fi

echo ""
echo "🌐 Verificando URLs de ambiente:"

if [[ -n "$VITE_APP_URL" ]]; then
    echo "✅ VITE_APP_URL: $VITE_APP_URL"
else
    echo "⚠️ VITE_APP_URL: Não configurada (usará padrão)"
fi

if [[ -n "$VITE_BACKEND_URL" ]]; then
    echo "✅ VITE_BACKEND_URL: $VITE_BACKEND_URL"
else
    echo "⚠️ VITE_BACKEND_URL: Não configurada (usará padrão)"
fi

echo ""
echo "📁 Verificando arquivos críticos:"

# Verificar arquivos importantes
FILES=(
    "src/hooks/useStripeCheckout.ts"
    "src/hooks/useAuth.tsx"
    "src/components/Subscription/SubscriptionModalNew.tsx"
    "backend/main.py"
    ".env"
    "package.json"
)

for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file: Existe"
    else
        echo "❌ $file: Não encontrado"
    fi
done

echo ""
echo "🔒 Verificando segurança:"

# Verificar se .env está no .gitignore
if grep -q "\.env" .gitignore 2>/dev/null; then
    echo "✅ .env está no .gitignore"
else
    echo "❌ .env NÃO está no .gitignore"
fi

# Verificar se há chaves hardcoded
if grep -r "sk_live_" src/ 2>/dev/null | grep -v "example" | grep -v "placeholder"; then
    echo "❌ CHAVES STRIPE HARDCODED ENCONTRADAS NO CÓDIGO!"
else
    echo "✅ Nenhuma chave hardcoded no código"
fi

echo ""
echo "🚀 Status do Deploy:"

# Determinar status geral
ERRORS=0

if [[ -z "$VITE_STRIPE_PUBLISHABLE_KEY" ]] || [[ "$VITE_STRIPE_PUBLISHABLE_KEY" != pk_* ]]; then
    ((ERRORS++))
fi

if [[ -z "$VITE_STRIPE_TRADER_PRICE_ID" ]] || [[ "$VITE_STRIPE_TRADER_PRICE_ID" != price_* ]]; then
    ((ERRORS++))
fi

if [[ ! -f "src/hooks/useStripeCheckout.ts" ]]; then
    ((ERRORS++))
fi

if [[ $ERRORS -eq 0 ]]; then
    echo "🟢 SISTEMA PRONTO PARA DEPLOY!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. git add . && git commit -m 'feat: sistema pronto para produção'"
    echo "2. git push origin main"
    echo "3. Configurar variáveis de ambiente na Vercel"
    echo "4. Deploy automático será executado"
else
    echo "🟡 SISTEMA PRECISA DE AJUSTES ($ERRORS erros)"
    echo ""
    echo "📋 Corrigir antes do deploy:"
    echo "- Configurar todas as variáveis de ambiente"
    echo "- Verificar arquivos faltantes"
    echo "- Consultar DEPLOY_VERCEL_GUIDE.md para instruções"
fi

echo ""
echo "📖 Para mais informações, consulte:"
echo "- DEPLOY_VERCEL_GUIDE.md"
echo "- CHECKLIST_FINAL.md"
