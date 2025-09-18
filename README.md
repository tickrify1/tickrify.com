# 🚀 Tickrify - Plataforma de Análise Financeira com IA

## ✅ SISTEMA 100% LOCAL + BACKEND FASTAPI

Esta plataforma funciona **completamente offline** ou com backend real para análise avançada.

## 🔧 Configuração Rápida

### Opção 1: Frontend Apenas (Local)
```bash
npm install
npm run dev
```

### Opção 2: Frontend + Backend (Análise Real)
```bash
# 1. Instalar dependências
npm install
cd backend && pip install -r requirements.txt

# 2. Configurar OpenAI (opcional)
echo "OPENAI_API_KEY=sk-sua_chave" > backend/.env

# 3. Executar tudo
npm run dev:full
```

**Pronto! Sistema completo funcionando!** 🎯

## 🧠 Funcionalidades Implementadas

### ✅ Sistema Local Completo
- **Análise IA simulada** avançada
- **Sistema de planos** funcional
- **Autenticação local** 
- **Dados persistentes** no navegador

### ✅ Planos Funcionais
- **🆓 FREE**: 10 análises/mês
- **🚀 TRADER**: 120 análises/mês (R$ 59,90)

### ✅ Análise Inteligente
- Upload de gráficos
- Análise técnica completa
- Indicadores automáticos
- Recomendações BUY/SELL/HOLD
- Gestão de risco

## 🎯 Como Funciona

1. **Execute** `npm run dev`
2. **Crie conta** ou faça login
3. **Teste planos** no painel superior direito
4. **Faça upload** de gráficos
5. **Receba análises** detalhadas

## 🔥 Recursos Principais

### ✅ Interface Profissional
- Design moderno e responsivo
- Experiência mobile otimizada
- Feedback visual completo

### ✅ Sistema de Planos
- Troca instantânea de planos
- Limites automáticos por plano
- Controle de acesso por funcionalidade

### ✅ Análise Completa
- Recomendação clara (BUY/SELL/HOLD)
- Nível de confiança (60-95%)
- Preço alvo e stop loss
- Indicadores técnicos detalhados

## 🚀 Funciona Sem APIs!

A plataforma está **100% funcional** sem necessidade de:
- ❌ Supabase
- ❌ Stripe obrigatório
- ❌ OpenAI obrigatório
- ❌ Configurações complexas

## 📱 Funcionalidades Mobile
- Upload via galeria ou câmera
- Interface otimizada para touch
- Análise rápida em qualquer lugar

## 🔒 Dados Locais
- Autenticação no navegador
- Histórico de análises salvo
- Configurações persistentes
- Sem dependência externa

## 🎨 Configurações Opcionais

### Tickrify IA (Para IA Avançada)
```env
VITE_TICKRIFY_AI_KEY=sk-sua_chave
```

### Stripe (Para Pagamentos Reais)
```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```

---

**Execute `npm run dev` e teste imediatamente!** 🚀✨

**Tudo funciona offline - zero configuração necessária!**