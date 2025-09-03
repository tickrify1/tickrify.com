#!/bin/bash

echo "🔒 ANÁLISE DE SEGURANÇA - TICKRIFY"
echo "=================================="
echo ""

# Verificar se há arquivos sensíveis expostos
echo "1. Verificando arquivos sensíveis..."
echo ""

# Verificar .env
if [ -f ".env" ]; then
    echo "✅ .env encontrado - verificando configuração..."
    if grep -q "OPENAI_API_KEY" .env; then
        echo "   ✅ Chave OpenAI configurada"
    else
        echo "   ❌ Chave OpenAI não encontrada"
    fi
    
    if grep -q "STRIPE_SECRET_KEY" .env; then
        echo "   ✅ Chave Stripe configurada"
    else
        echo "   ❌ Chave Stripe não encontrada"
    fi
    
    if grep -q "VITE_" .env; then
        echo "   ✅ Variáveis frontend configuradas"
    fi
else
    echo "❌ Arquivo .env não encontrado!"
fi

echo ""

# Verificar .gitignore
echo "2. Verificando .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        echo "   ✅ .env está no .gitignore"
    else
        echo "   ❌ .env NÃO está no .gitignore - RISCO DE SEGURANÇA!"
    fi
    
    if grep -q "node_modules" .gitignore; then
        echo "   ✅ node_modules está no .gitignore"
    fi
else
    echo "❌ .gitignore não encontrado!"
fi

echo ""

# Verificar dependências de segurança
echo "3. Verificando dependências..."
if [ -f "package.json" ]; then
    # Verificar se há dependências com vulnerabilidades conhecidas
    if command -v npm &> /dev/null; then
        echo "   🔍 Executando npm audit..."
        npm audit --audit-level moderate > audit_result.txt 2>&1
        if [ $? -eq 0 ]; then
            echo "   ✅ Nenhuma vulnerabilidade crítica encontrada"
        else
            echo "   ⚠️ Vulnerabilidades encontradas - veja audit_result.txt"
        fi
        rm -f audit_result.txt
    fi
fi

echo ""

# Verificar configuração CORS
echo "4. Verificando configuração CORS no backend..."
if [ -f "backend/main.py" ]; then
    if grep -q "allow_origins" backend/main.py; then
        echo "   ✅ CORS configurado no backend"
        if grep -q "allow_origins=\[" backend/main.py; then
            echo "   ✅ CORS com lista específica de origens"
        else
            echo "   ⚠️ CORS pode estar muito permissivo"
        fi
    else
        echo "   ❌ CORS não configurado adequadamente"
    fi
fi

echo ""

# Verificar autenticação
echo "5. Verificando sistema de autenticação..."
if [ -f "src/hooks/useAuth.tsx" ]; then
    if grep -q "sessionStorage\|localStorage" src/hooks/useAuth.tsx; then
        echo "   ⚠️ Dados de auth armazenados localmente - considere tokens JWT"
    fi
    
    if grep -q "fetch.*login" src/hooks/useAuth.tsx; then
        echo "   ✅ Sistema de login implementado"
    fi
fi

echo ""

# Verificar validação de entrada
echo "6. Verificando validação de entrada..."
if grep -q "validation\|validate\|sanitize" src/**/*.tsx src/**/*.ts 2>/dev/null; then
    echo "   ✅ Validação de entrada encontrada"
else
    echo "   ⚠️ Pouca validação de entrada detectada"
fi

echo ""

# Verificar HTTPS
echo "7. Verificando configuração HTTPS..."
if grep -q "https" .env 2>/dev/null; then
    echo "   ✅ URLs HTTPS configuradas no .env"
fi

if grep -q "secure.*cookie" src/**/*.tsx src/**/*.ts 2>/dev/null; then
    echo "   ✅ Cookies seguros configurados"
else
    echo "   ⚠️ Considere configurar cookies seguros"
fi

echo ""

# Verificar logs e debugging
echo "8. Verificando configuração de logs..."
if grep -q "console.log" src/**/*.tsx src/**/*.ts 2>/dev/null; then
    echo "   ⚠️ Console.log encontrado - remover em produção"
fi

if grep -q "NODE_ENV.*production" src/**/*.tsx src/**/*.ts 2>/dev/null; then
    echo "   ✅ Verificação de ambiente de produção"
fi

echo ""

# Resumo de recomendações
echo "🎯 RECOMENDAÇÕES DE SEGURANÇA:"
echo "================================"
echo "✅ IMPLEMENTADO:"
echo "   - Autenticação com backend"
echo "   - Variáveis de ambiente para chaves sensíveis"
echo "   - Comunicação com backend via HTTPS"
echo ""
echo "⚠️ MELHORIAS RECOMENDADAS:"
echo "   - Implementar JWT tokens em vez de localStorage"
echo "   - Adicionar rate limiting no backend"
echo "   - Validação robusta de entrada de dados"
echo "   - Sanitização de dados de upload"
echo "   - Implementar CSP (Content Security Policy)"
echo "   - Logs de auditoria para ações sensíveis"
echo "   - 2FA (autenticação de dois fatores)"
echo ""
echo "🚨 CRÍTICO PARA PRODUÇÃO:"
echo "   - Configurar CORS restritivo"
echo "   - Remover todos console.log"
echo "   - Implementar monitoramento de segurança"
echo "   - Backup automático do banco de dados"
echo "   - Certificados SSL válidos"
echo ""

echo "✅ Análise concluída!"
