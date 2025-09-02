# 📋 GUIA COMPLETO: GitHub → Vercel Deploy

## 🎯 Passos para Deploy Profissional

### 1️⃣ **Criar Repositório no GitHub**
```
1. Vá para: https://github.com
2. Clique: "New repository" (botão verde)
3. Nome: tickrify-platform
4. Descrição: AI Trading Analysis Platform
5. Público: ✅ (para deploy gratuito)
6. Initialize with README: ❌ (NÃO marcar)
7. Clique: "Create repository"
```

### 2️⃣ **Conectar Projeto ao GitHub**
```bash
# Copie a URL que aparece na tela (exemplo):
# https://github.com/SEU_USUARIO/tickrify-platform.git

# Execute no terminal:
./setup-github.sh https://github.com/SEU_USUARIO/tickrify-platform.git
```

### 3️⃣ **Deploy na Vercel**
```
1. Acesse: https://vercel.com
2. Faça login (pode usar conta GitHub)
3. Clique: "Import Project"
4. Selecione: seu repositório tickrify-platform
5. Framework: Vite (detectado automaticamente)
6. Clique: "Deploy"
```

### 4️⃣ **Configurar Variáveis de Ambiente**
```
Na Vercel, vá em Settings → Environment Variables:

VITE_BACKEND_URL=https://seu-backend-url.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_sua_chave_stripe
```

### 5️⃣ **Configurar Domínio Personalizado**
```
1. Na Vercel: Settings → Domains
2. Adicionar: tickrify.com
3. Configurar DNS conforme instruções
4. Aguardar propagação (5-60min)
```

## ✅ **Resultado Final**
- ✅ Repositório no GitHub
- ✅ Deploy automático na Vercel
- ✅ CI/CD configurado (auto-deploy a cada push)
- ✅ Domínio personalizado: https://tickrify.com

## 🚀 **Vantagens desta Abordagem**
- Deploy automático a cada commit
- Histórico completo no GitHub
- Colaboração facilitada
- Backup automático do código
- Rollback fácil se necessário
