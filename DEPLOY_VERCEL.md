# 🚀 Deploy do Tickrify na Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel** (vercel.com)
2. **Backend deployed** (Railway, Render, ou similar)
3. **Chaves do Stripe** (produção)

## 🔧 Configuração de Variáveis de Ambiente

Na Vercel, configure estas variáveis no painel do projeto:

### Obrigatórias:
```bash
VITE_BACKEND_URL=https://your-backend-url.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key_here
```

### Opcionais:
```bash
VITE_APP_NAME=Tickrify
VITE_APP_VERSION=1.0.0
```

## 📦 Deploy Steps

### 1. **Push para GitHub**
```bash
git add .
git commit -m "Deploy ready for Vercel"
git push origin main
```

### 2. **Conectar na Vercel**
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Import Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente

### 3. **Configurações de Build**
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## 🎯 Checklist Pré-Deploy

- [ ] Backend funcionando em produção
- [ ] Variáveis de ambiente configuradas
- [ ] Stripe configurado para produção
- [ ] Build local funcionando (`npm run build`)
- [ ] Todas as URLs atualizadas para produção

## 🔗 URLs de Exemplo

### Development:
- Frontend: http://localhost:5500
- Backend: http://localhost:8000

### Production:
- Frontend: https://tickrify.vercel.app
- Backend: https://tickrify-backend.railway.app

## 🛠️ Troubleshooting

### Erro de CORS:
- Configure CORS no backend para aceitar sua URL da Vercel

### Erro de Environment Variables:
- Verifique se todas as variáveis estão configuradas na Vercel
- Use `console.log(import.meta.env)` para debug

### Erro de Build:
- Execute `npm run build` localmente primeiro
- Verifique se todas as dependências estão no package.json

## 📞 Support

Se precisar de ajuda:
1. Verifique os logs da Vercel
2. Teste o build localmente
3. Confirme se o backend está acessível

---

**🎉 Sucesso!** Após o deploy, teste o fluxo completo de pagamento com cartões de teste do Stripe.
