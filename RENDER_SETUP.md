# 🚀 Deploy no Render - Guia Simplificado

## Passos para Deploy:

### 1. Acesse render.com
- Crie conta gratuita
- Conecte seu GitHub

### 2. Crie Web Service
- Escolha seu repositório tickrify.com
- Configure:
  - **Build Command**: `pip install -r backend/requirements.txt`
  - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
  - **Environment**: Python 3

### 3. Variáveis de Ambiente
Adicione no dashboard do Render:
```
ENVIRONMENT=production
STRIPE_SECRET_KEY=[sua-chave-stripe-secreta]
OPENAI_API_KEY=[sua-chave-openai]
STRIPE_WEBHOOK_SECRET=[seu-webhook-secret]
```

### 4. Deploy Automático
- Deploy acontece automaticamente a cada push
- URL será algo como: `https://tickrify-backend.render.com`

## ✅ Pronto!
Seu backend estará rodando no Render gratuitamente!
