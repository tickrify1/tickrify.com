# 🚀 Guia de Deploy VERCEL - Tickrify

## ⚠️ PROBLEMAS COMUNS E SOLUÇÕES

### 🔥 PROBLEMA 1: Login não funciona
**Causa:** URL do backend incorreta em produção

**Solução:**
1. Configure as variáveis de ambiente na Vercel
2. Atualize URLs para produção

### 🔥 PROBLEMA 2: Checkout Stripe não abre
**Causa:** URLs hardcoded para localhost

**Solução:** Já corrigida com detecção automática de ambiente

---

## 📋 CHECKLIST DE DEPLOY

### ✅ 1. Frontend (Vercel)

#### Configurar Variáveis de Ambiente
No painel da Vercel → Settings → Environment Variables:

```bash
# URLs de produção
VITE_APP_URL=https://tickrify.vercel.app
VITE_BACKEND_URL=https://seu-backend.vercel.app

# Stripe (produção) - SUBSTITUIR PELAS SUAS CHAVES REAIS
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[SUA_CHAVE_PUBLICA]
VITE_STRIPE_TRADER_PRICE_ID=price_[SEU_PRICE_ID]

# OpenAI - SUBSTITUIR PELA SUA CHAVE REAL  
VITE_OPENAI_API_KEY=sk-proj-[SUA_CHAVE_OPENAI]
```

#### Deploy Frontend
```bash
# Conectar repositório à Vercel
# Build automático: npm run build
# Deploy automático em cada commit
```

### ✅ 2. Backend (Railway/Heroku)

#### Configurar Variáveis de Ambiente
```bash
# Stripe (backend) - CONFIGURAR COM SUAS CHAVES REAIS
STRIPE_SECRET_KEY=sk_live_[SUA_CHAVE_SECRETA]
STRIPE_WEBHOOK_SECRET=whsec_[SEU_WEBHOOK_SECRET]

# OpenAI - CONFIGURAR COM SUA CHAVE REAL
OPENAI_API_KEY=sk-proj-[SUA_CHAVE_OPENAI]
```

#### Deploy Backend
```bash
# Railway
railway login
railway init
railway up

# Heroku
heroku login
heroku create tickrify-backend
git push heroku main
```

### ✅ 3. Configurar CORS

No backend (`main.py`), adicionar domínio da Vercel:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000", 
        "https://tickrify.vercel.app",  # ← ADICIONAR
        "https://*.vercel.app"          # ← ADICIONAR
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🧪 TESTE DE PRODUÇÃO

### 1. Testar Login
```bash
# Abrir: https://tickrify.vercel.app
# 1. Inserir email
# 2. Verificar se cria usuário
# 3. Verificar se entra no dashboard
```

### 2. Testar Checkout
```bash
# 1. Clicar em "Upgrade"
# 2. Verificar se abre modal
# 3. Clicar em "Assinar"
# 4. Verificar se redireciona para Stripe
```

### 3. Verificar Logs
```bash
# Vercel
vercel logs

# Railway/Heroku
railway logs
heroku logs --tail
```

---

## 🔧 DEBUGGING

### Problema: "Failed to fetch"
**Causa:** CORS ou URL incorreta
**Solução:**
1. Verificar CORS no backend
2. Verificar VITE_BACKEND_URL
3. Verificar se backend está online

### Problema: Stripe não carrega
**Causa:** Chaves incorretas ou URLs erradas
**Solução:**
1. Verificar VITE_STRIPE_PUBLISHABLE_KEY
2. Verificar se success_url/cancel_url estão corretos
3. Verificar se price_id existe no Stripe

### Problema: Login não persiste
**Causa:** LocalStorage ou sessão
**Solução:**
1. Verificar se localStorage funciona em produção
2. Verificar se dados estão sendo salvos
3. Verificar se não há erro de CORS

---

## 📱 URLs FINAIS

### ✅ Produção
- **Frontend:** https://tickrify.vercel.app
- **Backend:** https://tickrify-backend.railway.app
- **Stripe:** Dashboard Stripe para monitorar

### ✅ Desenvolvimento  
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000

---

## 🎯 COMANDO RÁPIDO

```bash
# Deploy completo
git add .
git commit -m "fix: URLs dinâmicas para produção"
git push origin main

# Vercel fará deploy automático
# Configurar variáveis de ambiente no painel
```

---

## ✅ CHECKLIST FINAL

- [ ] **Variáveis configuradas na Vercel**
- [ ] **Backend deployado (Railway/Heroku)**  
- [ ] **CORS configurado**
- [ ] **URLs dinâmicas implementadas**
- [ ] **Teste de login funcionando**
- [ ] **Teste de checkout funcionando**
- [ ] **Webhook Stripe configurado**

**🎉 SISTEMA PRONTO PARA PRODUÇÃO!**
