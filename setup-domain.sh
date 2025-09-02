#!/bin/bash

echo "🌐 CONFIGURANDO DOMÍNIO PERSONALIZADO"
echo "===================================="
echo ""

# Você precisa substituir pela URL real após deploy na Vercel
VERCEL_URL="https://tickrify-com.vercel.app"  # Substitua pela URL real

echo "📝 IMPORTANTE: Este script precisa ser atualizado com sua URL real da Vercel"
echo "💡 Após fazer deploy na Vercel, copie a URL e substitua na linha 7 deste arquivo"
echo ""

# Script para configurar domínio após DNS
echo "🔧 Comandos para executar após deploy na Vercel:"
echo ""
echo "npx vercel domains add tickrify.com --force"
echo "npx vercel domains add www.tickrify.com --force"
echo "npx vercel alias set SUA_URL_VERCEL_AQUI tickrify.com"
echo ""
echo "🎯 Substitua SUA_URL_VERCEL_AQUI pela URL real que aparece após o deploy"
