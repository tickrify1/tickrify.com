# 🚀 Guia de Deploy em Produção - Tickrify

## ✅ Status Atual
- **Frontend**: ✅ Funcionando na Vercel (`https://tickrify.vercel.app`)
- **Backend**: ❌ Precisa ser configurado em produção

## 🔧 Próximos Passos para Resolver o Stripe

### 1. Deploy do Backend (Escolha uma opção)

#### Opção A: Railway (Recomendado - Grátis)
1. Acesse: https://railway.app
2. Conecte sua conta GitHub
3. Clique em "New Project" → "Deploy from GitHub repo"
4. Selecione o repositório `tickrify1/tickrify.com`
5. Configure as variáveis de ambiente:
   - `ENVIRONMENT=production`
   - `STRIPE_SECRET_KEY=sk_live_SEU_STRIPE_SECRET_KEY_AQUI`

#### Opção B: Render (Alternativa - Grátis)
1. Acesse: https://render.com
2. Conecte sua conta GitHub
3. Clique em "New" → "Web Service"
4. Selecione o repositório `tickrify1/tickrify.com`
5. Configure:
   - **Runtime**: Docker
   - **Dockerfile Path**: ./Dockerfile
   - **Environment**: Production
6. Adicione variáveis de ambiente:
   - `ENVIRONMENT=production`
   - `STRIPE_SECRET_KEY=sk_live_SEU_STRIPE_SECRET_KEY_AQUI`

#### Opção C: Vercel (Backend como Serverless)
```bash
# Na pasta backend, criar vercel.json:
{
  "version": 2,
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

### 2. Configurar Variáveis de Ambiente na Vercel (Frontend)

Acesse: https://vercel.com/dashboard → tickrify.com → Settings → Environment Variables

Adicione:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_SEU_STRIPE_PUBLISHABLE_KEY_AQUI
VITE_BACKEND_URL=https://SUA_URL_DO_BACKEND_AQUI
VITE_STRIPE_TRADER_PRICE_ID=price_SEU_PRICE_ID_REAL_AQUI
```

### 3. URLs de Exemplo após Deploy

Depois do deploy do backend, as URLs ficarão:
- **Frontend**: `https://tickrify.vercel.app`
- **Backend Railway**: `https://tickrify-backend-production.up.railway.app`
- **Backend Render**: `https://tickrify-backend.onrender.com`

### 4. Testar em Produção

1. Acesse: `https://tickrify.vercel.app/debug-stripe-production.html`
2. Atualize a URL do backend no código JavaScript
3. Teste todos os endpoints
4. Verifique se o modal não mostra mais "PLANO ATUAL" sem login

## 🔑 Chaves do Stripe Necessárias

### Desenvolvimento (já configurado)
- Publishable: `pk_test_...`
- Secret: `sk_test_...`

### Produção (precisa configurar)
- Publishable: `pk_live_...` 
- Secret: `sk_live_...`
- Price ID: `price_...` (produto real no Stripe)

## 🧪 Teste das Correções

### Problema Resolvido ✅
- Modal não mostra mais "PLANO ATUAL" para usuários não logados
- Badges aparecem apenas quando o usuário está logado E tem o plano
- Mensagem informativa para usuários não logados

### Para Testar
1. Acesse sem login → Modal não deve mostrar "PLANO ATUAL"
2. Faça login com FREE → Badge apenas no FREE
3. Upgrade para TRADER → Badge apenas no TRADER

## 📝 Comandos Úteis

```bash
# Deploy rápido após mudanças
git add . && git commit -m "Update" && git push origin main

# Verificar status do deploy
curl -s https://tickrify.vercel.app/health

# Testar frontend
open https://tickrify.vercel.app

# Testar debug
open https://tickrify.vercel.app/debug-stripe-production.html
```

## ⚠️ Importante

1. **Nunca commitar chaves secretas** no código
2. **Usar apenas variáveis de ambiente** para produção
3. **Testar primeiro com chaves de teste** antes do live
4. **Configurar webhooks** do Stripe se necessário
