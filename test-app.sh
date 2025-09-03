#!/bin/bash

echo "🔍 Testando aplicação Tickrify..."
echo ""

# Verificar se o servidor está rodando
if curl -s http://localhost:5500 > /dev/null; then
    echo "✅ Servidor está rodando em http://localhost:5500"
else
    echo "❌ Servidor não está rodando"
    exit 1
fi

# Verificar se a página principal carrega
response=$(curl -s http://localhost:5500)
if [[ $response == *"<title>"* ]]; then
    echo "✅ Página principal carrega corretamente"
else
    echo "❌ Página principal não carrega"
    echo "Response: $response"
    exit 1
fi

# Verificar se o React está presente
if [[ $response == *"react"* ]] || [[ $response == *"div id=\"root\""* ]]; then
    echo "✅ React container encontrado"
else
    echo "❌ React container não encontrado"
fi

echo ""
echo "🎉 Teste básico concluído! Verifique visualmente no navegador."
