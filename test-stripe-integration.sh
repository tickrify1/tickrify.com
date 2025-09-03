#!/bin/bash

echo "🧪 Testando integração Stripe..."
echo ""

# Testar conectividade com backend
echo "1. Testando backend..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend está rodando em http://localhost:8000"
else
    echo "❌ Backend não está rodando"
    exit 1
fi

# Testar frontend
echo ""
echo "2. Testando frontend..."
if curl -s http://localhost:5500 > /dev/null; then
    echo "✅ Frontend está rodando em http://localhost:5500"
else
    echo "❌ Frontend não está rodando"
    exit 1
fi

# Testar endpoint de checkout
echo ""
echo "3. Testando endpoint de checkout..."
response=$(curl -s -X POST http://localhost:8000/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "priceId": "price_1S2cj4B1hl0IoocUfB4Xwgrp",
    "mode": "subscription",
    "successUrl": "http://localhost:5500/success?session_id={CHECKOUT_SESSION_ID}",
    "cancelUrl": "http://localhost:5500/cancel",
    "user_email": "test@example.com"
  }')

if [[ $response == *"url"* ]]; then
    echo "✅ Endpoint de checkout está funcionando"
    echo "Response preview: $(echo $response | head -c 100)..."
else
    echo "❌ Endpoint de checkout com problemas"
    echo "Response: $response"
fi

echo ""
echo "🔗 URLs de teste:"
echo "Frontend: http://localhost:5500"
echo "Backend: http://localhost:8000" 
echo "Health Check: http://localhost:8000/health"
echo ""
echo "✅ Teste concluído! Tente fazer um checkout na aplicação."
