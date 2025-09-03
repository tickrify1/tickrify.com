# 🔐 Guia de Segurança - Configuração de Chaves API

## ⚠️ **IMPORTANTE - SEGURANÇA**

Este projeto contém configurações para chaves de produção do Stripe e OpenAI. 
**NUNCA** comite chaves reais para o repositório git.

## 📋 **Onde Configurar Chaves (PRODUÇÃO)**

### **Frontend (Vercel):**
1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto Tickrify
3. Vá em Settings → Environment Variables
4. Adicione as variáveis:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=[da dashboard do Stripe]
   VITE_STRIPE_TRADER_PRICE_ID=[da dashboard do Stripe]
   VITE_OPENAI_API_KEY=[da OpenAI]
   VITE_APP_URL=https://tickrify-com.vercel.app
   VITE_BACKEND_URL=https://tickrify-backend.railway.app
   ENVIRONMENT=production
   ```

### **Backend (Railway):**
1. Acesse: https://railway.app/dashboard
2. Selecione o projeto do backend
3. Vá em Settings → Environment Variables
4. Adicione as variáveis:
   ```
   STRIPE_SECRET_KEY=[chave secreta do Stripe]
   STRIPE_WEBHOOK_SECRET=[webhook secret do Stripe]
   OPENAI_API_KEY=[chave da OpenAI]
   ENVIRONMENT=production
   PORT=8000
   ```

## 🔑 **Como Obter as Chaves**

### **Stripe:**
1. Acesse: https://dashboard.stripe.com/apikeys
2. Copie a "Publishable key" (pk_live_...)
3. Copie a "Secret key" (sk_live_...)
4. Configure webhook em: https://dashboard.stripe.com/webhooks

### **OpenAI:**
1. Acesse: https://platform.openai.com/api-keys
2. Crie uma nova chave API
3. Copie a chave (sk-proj-...)

### **Stripe Price IDs:**
1. Acesse: https://dashboard.stripe.com/products
2. Crie produtos/preços para seus planos
3. Copie os Price IDs (price_...)

## 🛡️ **Arquivos Protegidos**

Os seguintes arquivos estão no .gitignore:
- `.env` (contém chaves reais)
- `*CONFIG.md` (documentação com chaves)
- `keys/`, `secrets/`, `credentials/`

## ✅ **Arquivo .env.example**

Use o arquivo `.env.example` como template:
```bash
cp .env.example .env
# Edite .env com suas chaves reais
```

## 🔍 **Verificação de Segurança**

Execute para verificar se não há chaves expostas:
```bash
./check-stripe.sh
./check-system.sh
```

## 🚨 **Em Caso de Exposição Acidental**

Se você commitou chaves reais por engano:
1. **IMEDIATAMENTE** revogue as chaves nos dashboards
2. Gere novas chaves
3. Atualize as variáveis de ambiente
4. Remova as chaves do histórico git se necessário

## 📋 **Checklist de Segurança**

- [ ] Chaves reais apenas em .env (não commitado)
- [ ] Variáveis de ambiente configuradas no Vercel/Railway
- [ ] .gitignore atualizado
- [ ] Documentação sem chaves hardcoded
- [ ] Webhooks configurados corretamente
- [ ] Testes funcionando sem expor chaves
