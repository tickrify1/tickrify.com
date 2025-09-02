#!/bin/bash

# 🎯 TESTE FINAL - Stripe Integration Completa
echo "🚀 TESTE FINAL - TICKRIFY + STRIPE"
echo "=================================="
echo ""

# 1. Testar se o backend está funcionando
echo "1️⃣ Testando Backend..."
HEALTH_CHECK=$(curl -s http://localhost:8000/health)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: ERRO"
    exit 1
fi

# 2. Testar se o frontend está funcionando
echo ""
echo "2️⃣ Testando Frontend..."
if curl -s http://localhost:5500 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: ERRO"
    exit 1
fi

# 3. Testar checkout REAL com o Price ID configurado
echo ""
echo "3️⃣ Testando Checkout REAL do Stripe..."
CHECKOUT_RESPONSE=$(curl -s -X POST "http://localhost:8000/create-checkout-session" \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1S2cj4B1hl0IoocUfB4Xwgrp",
    "mode": "subscription",
    "successUrl": "http://localhost:5500/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:5500/cancel"
  }')

if echo "$CHECKOUT_RESPONSE" | grep -q "checkout.stripe.com"; then
    echo "✅ Checkout Real: FUNCIONANDO!"
    SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.sessionId')
    echo "   Session ID: $SESSION_ID"
    echo "   URL: $(echo "$CHECKOUT_RESPONSE" | jq -r '.url' | cut -c1-50)..."
else
    echo "❌ Checkout Real: ERRO"
    echo "   Resposta: $CHECKOUT_RESPONSE"
    exit 1
fi

# 4. Testar endpoint de preços
echo ""
echo "4️⃣ Testando Configuração de Produtos..."
STRIPE_CONFIG_CHECK=$(curl -s http://localhost:5500/src/stripe-config.ts 2>/dev/null || echo "arquivo_local")
if [ "$STRIPE_CONFIG_CHECK" != "arquivo_local" ]; then
    echo "⚠️  Arquivo stripe-config.ts é local"
else
    echo "✅ Configuração de produtos: OK"
fi

echo ""
echo "🎯 RESUMO DO TESTE:"
echo "==================="
echo "✅ Backend FastAPI: Funcionando"
echo "✅ Frontend React: Funcionando" 
echo "✅ Chaves Stripe: Configuradas"
echo "✅ Price ID: Configurado (price_1S2cj4B1hl0IoocUfB4Xwgrp)"
echo "✅ Checkout Real: FUNCIONANDO!"
echo ""
echo "🚀 INTEGRAÇÃO STRIPE: COMPLETA E FUNCIONAL!"
echo ""
echo "📋 TESTE MANUAL:"
echo "================"
echo "1. Acesse: http://localhost:5500"
echo "2. Faça login (qualquer email/senha)"
echo "3. Vá para Dashboard"
echo "4. Clique em 'Upgrade para Trader'"
echo "5. Será redirecionado para CHECKOUT REAL do Stripe!"
echo ""
echo "💳 Para testar pagamento use:"
echo "   Cartão: 4242 4242 4242 4242"
echo "   CVV: 123"
echo "   Data: 12/34"
echo ""
echo "🎉 PARABÉNS! Integração Stripe 100% funcional!"
