# 🚀 Guia de Deploy - Tickrify

## Configuração de Produção

### Frontend (Vercel)

1. **Push para GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Deploy automático no Vercel**
   - Conecte o repositório no dashboard do Vercel
   - O deploy será automático a cada push na branch `main`
   - URL: `https://tickrify-com.vercel.app`

3. **Variáveis de ambiente no Vercel**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=[OBTIDO_NO_STRIPE_DASHBOARD]
   VITE_STRIPE_TRADER_PRICE_ID=[ID_DO_PRODUTO_NO_STRIPE]
   VITE_OPENAI_API_KEY=[CHAVE_DA_OPENAI]
   VITE_APP_URL=https://tickrify-com.vercel.app
   VITE_BACKEND_URL=https://tickrify-backend.railway.app
   ENVIRONMENT=production
   ```

   ⚠️ **SEGURANÇA**: Obtenha as chaves reais em:
   - Stripe: https://dashboard.stripe.com/apikeys
   - OpenAI: https://platform.openai.com/api-keys

### Backend (Railway)

1. **Deploy no Railway**
   ```bash
   # Instalar Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Deploy
   railway up
   ```

2. **Variáveis de ambiente no Railway**
   ```
   ENVIRONMENT=production
   STRIPE_SECRET_KEY=[CHAVE_SECRETA_DO_STRIPE]
   STRIPE_WEBHOOK_SECRET=[SECRET_DO_WEBHOOK]
   OPENAI_API_KEY=[CHAVE_DA_OPENAI]
   PORT=8000
   ```

   ⚠️ **SEGURANÇA**: Configure essas chaves no dashboard do Railway, não no código.

3. **URL do backend**: `https://tickrify-backend.railway.app`

## URLs de Produção

- **Frontend**: https://tickrify-com.vercel.app
- **Backend**: https://tickrify-backend.railway.app
- **API Docs**: https://tickrify-backend.railway.app/docs

## Comandos Úteis

```bash
# Build local
npm run build

# Deploy Vercel
npm run vercel:deploy

# Deploy Railway
npm run railway:deploy

# Preview build local
npm run preview
```

## Verificações Pós-Deploy

1. ✅ Frontend carregando corretamente
2. ✅ Autenticação funcionando
3. ✅ Integração Stripe ativa
4. ✅ API endpoints respondendo
5. ✅ Análises de IA funcionando
6. ✅ CORS configurado corretamente

## Monitoramento

- **Vercel Analytics**: Dashboard do Vercel
- **Railway Logs**: Dashboard do Railway
- **Health Check**: https://tickrify-backend.railway.app/health

## Problemas Comuns

### CORS Error
- Verificar se a URL do frontend está nas origens permitidas no backend
- Confirmar variável `ENVIRONMENT=production`

### 404 nas rotas
- Verificar configuração de rewrites no `vercel.json`
- Confirmar SPA routing

### Stripe não funciona
- Verificar chaves de produção do Stripe
- Confirmar webhook endpoint configurado

### API não responde
- Verificar logs no Railway
- Confirmar variáveis de ambiente
- Testar health check endpoint
