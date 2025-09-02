#!/bin/bash

echo "🚀 SETUP GITHUB → VERCEL"
echo "========================"
echo ""

# Verificar se URL foi fornecida
if [ -z "$1" ]; then
    echo "❌ URL do repositório GitHub não fornecida!"
    echo ""
    echo "📝 Como usar:"
    echo "   ./setup-github.sh https://github.com/SEU_USUARIO/tickrify-platform.git"
    echo ""
    echo "📋 Passos:"
    echo "1. Crie um repositório no GitHub"
    echo "2. Copie a URL HTTPS"
    echo "3. Execute: ./setup-github.sh SUA_URL"
    exit 1
fi

REPO_URL=$1

echo "📦 Conectando ao repositório: $REPO_URL"

# Adicionar remote origin
git remote add origin $REPO_URL

# Push para GitHub
echo "⬆️ Fazendo push para GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCESSO! Repositório enviado para GitHub"
    echo ""
    echo "🌐 Próximos passos:"
    echo "1. Acesse: https://vercel.com"
    echo "2. Clique 'Import Project'"
    echo "3. Conecte seu repositório GitHub"
    echo "4. Deploy automático será feito!"
    echo ""
    echo "🎯 Após deploy na Vercel:"
    echo "- Configure as variáveis de ambiente"
    echo "- Adicione o domínio personalizado tickrify.com"
    echo ""
else
    echo "❌ Erro ao fazer push. Verifique a URL e suas credenciais."
fi
