# 🚀 Guia Completo de Configuração - Plataforma Tickrify

## 📋 Checklist de Configuração

### 1. 🔧 Configuração do Ambiente de Desenvolvimento

#### Pré-requisitos
- [ ] Node.js 18+ instalado
- [ ] npm ou yarn instalado
- [ ] Git instalado
- [ ] Conta no Supabase
- [ ] Conta no Stripe
- [ ] Editor de código (VS Code recomendado)

#### Instalação Inicial
```bash
# Clone o repositório (se aplicável)
git clone [seu-repositorio]
cd tickrify-platform

# Instalar dependências
npm install

# Verificar se todas as dependências estão instaladas
npm audit
```

### 2. 🗄️ Configuração do Supabase (OBRIGATÓRIO)

#### Passo 1: Criar Projeto no Supabase
1. [ ] Acesse [supabase.com](https://supabase.com)
2. [ ] Crie uma nova conta ou faça login
3. [ ] Clique em "New Project"
4. [ ] Escolha uma organização
5. [ ] Configure:
   - Nome do projeto: `tickrify-platform`
   - Senha do banco: (anote em local seguro)
   - Região: `South America (São Paulo)` ou mais próxima

#### Passo 2: Configurar Banco de Dados
1. [ ] Aguarde o projeto ser criado (2-3 minutos)
2. [ ] Vá para "SQL Editor"
3. [ ] Execute o arquivo de migração existente:
   - Copie o conteúdo de `supabase/migrations/20250710235508_withered_bridge.sql`
   - Cole no SQL Editor e execute

#### Passo 3: Configurar Autenticação
1. [ ] Vá para "Authentication" > "Settings"
2. [ ] Configure:
   - Site URL: `http://localhost:5173` (desenvolvimento)
   - Redirect URLs: `http://localhost:5173**`
3. [ ] Desabilite "Email Confirmations" (para desenvolvimento)
4. [ ] Habilite "Email" como provider

#### Passo 4: Obter Credenciais
1. [ ] Vá para "Settings" > "API"
2. [ ] Copie:
   - Project URL
   - anon/public key
   - service_role key (mantenha seguro)

### 3. 💳 Configuração do Stripe (OBRIGATÓRIO para Pagamentos)

#### Passo 1: Criar Conta Stripe
1. [ ] Acesse [stripe.com](https://stripe.com)
2. [ ] Crie conta ou faça login
3. [ ] Ative o "Test Mode" (chave de teste)

#### Passo 2: Criar Produtos (IMPORTANTE: Use os IDs exatos)
Os produtos já estão configurados no código com IDs reais:

**Produto 1: Trader**
- [ ] Nome: "Trader"
- [ ] Preço: R$ 59,90/mês
- [ ] Tipo: Recorrente
- [ ] Price ID: `price_1RjU3gB1hl0IoocUWlz842SY`

#### Passo 3: Configurar Webhooks
1. [ ] Vá para "Developers" > "Webhooks"
2. [ ] Clique "Add endpoint"
3. [ ] URL: `https://[seu-projeto].supabase.co/functions/v1/stripe-webhook`
4. [ ] Selecione eventos:
   - [ ] `checkout.session.completed`
   - [ ] `customer.subscription.created`
   - [ ] `customer.subscription.updated`
   - [ ] `customer.subscription.deleted`
   - [ ] `invoice.payment_succeeded`
   - [ ] `invoice.payment_failed`

#### Passo 4: Obter Chaves
1. [ ] Vá para "Developers" > "API keys"
2. [ ] Copie:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)
3. [ ] Em "Webhooks", copie o "Signing secret" (whsec_...)

### 4. 🔐 Configuração das Variáveis de Ambiente

#### Criar arquivo .env na raiz do projeto:
```env
# Supabase Configuration (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://[seu-projeto].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-chave-anon]

# Stripe Configuration (OBRIGATÓRIO para pagamentos)
STRIPE_SECRET_KEY=sk_test_[sua-chave-secreta]
STRIPE_WEBHOOK_SECRET=whsec_[sua-chave-webhook]

# OpenAI Configuration (OPCIONAL - para IA real)
VITE_OPENAI_API_KEY=sk-[sua-chave-openai]

# URLs de Produção (OPCIONAL)
VITE_APP_URL=http://localhost:5173
```

### 5. ⚡ Configuração das Edge Functions (Supabase)

#### Passo 1: Verificar Edge Functions
As seguintes funções já estão no projeto:
- [ ] `supabase/functions/stripe-checkout/index.ts`
- [ ] `supabase/functions/stripe-webhook/index.ts`

#### Passo 2: Deploy Automático
- [ ] As Edge Functions são deployadas automaticamente quando conectado ao Supabase
- [ ] Não é necessário usar Supabase CLI no WebContainer

### 6. 🧪 Configuração para Desenvolvimento

#### Modo Demo (Sem APIs Externas)
Se você não quiser configurar APIs externas imediatamente:

1. [ ] A plataforma funciona em modo demo
2. [ ] IA simulada (sem OpenAI)
3. [ ] Pagamentos simulados (sem Stripe real)
4. [ ] Dados mockados para demonstração

#### Configuração de Planos para Teste
No arquivo `src/hooks/useSubscription.ts`, linha 25:
```typescript
// TESTE DIFERENTES PLANOS ALTERANDO O price_id:
// FREE: null
// TRADER: 'price_1RjU3gB1hl0IoocUWlz842SY'
// PERSONALIZADO: 'price_1RjU74B1hl0IoocU5QAhJplF'
price_id: null, // Altere aqui para testar
```

### 7. 🚀 Executar a Aplicação

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

### 8. ✅ Verificação de Funcionamento

#### Checklist de Testes
- [ ] Aplicação carrega sem erros
- [ ] Login/registro funciona
- [ ] Upload de imagem funciona
- [ ] Análise IA é executada (simulada)
- [ ] Sinais são gerados
- [ ] Indicadores são exibidos
- [ ] Modal de assinatura abre
- [ ] Redirecionamento para Stripe funciona (se configurado)

### 9. 🔧 Configurações Opcionais

#### OpenAI (Para IA Real)
1. [ ] Conta na OpenAI
2. [ ] API Key da OpenAI
3. [ ] Adicionar `VITE_OPENAI_API_KEY` no .env

#### Configurações de Produção
1. [ ] Domínio personalizado
2. [ ] SSL/HTTPS
3. [ ] Variáveis de ambiente de produção
4. [ ] Monitoramento e logs

### 10. 📱 Funcionalidades Disponíveis

#### ✅ Implementado e Funcionando
- [x] Sistema de autenticação completo
- [x] Upload e análise de gráficos
- [x] IA simulada para análise técnica
- [x] Geração de sinais automáticos
- [x] Dashboard com métricas
- [x] Indicadores técnicos
- [x] Sistema de assinatura (Stripe)
- [x] Interface responsiva
- [x] Modo demo completo

#### 🔄 Configuração Necessária
- [ ] Stripe para pagamentos reais
- [ ] Supabase para autenticação real
- [ ] OpenAI para IA real (opcional)

### 11. 🆘 Solução de Problemas

#### Problemas Comuns

**Erro: "Supabase não configurado"**
- [ ] Verificar se VITE_SUPABASE_URL está correto
- [ ] Verificar se VITE_SUPABASE_ANON_KEY está correto
- [ ] Verificar se o projeto Supabase está ativo

**Erro: "Stripe não configurado"**
- [ ] Verificar se STRIPE_SECRET_KEY está correto
- [ ] Verificar se os Price IDs estão corretos
- [ ] Verificar se o webhook está configurado

**Aplicação não carrega**
- [ ] Executar `npm install` novamente
- [ ] Verificar se Node.js 18+ está instalado
- [ ] Verificar console do browser para erros

### 12. 📞 Suporte e Recursos

#### Documentação Oficial
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

#### Comandos Úteis
```bash
# Limpar cache
npm run dev -- --force

# Verificar dependências
npm audit

# Atualizar dependências
npm update

# Verificar portas em uso
lsof -i :5173
```

---

## 🎯 Resumo Rápido

### Para Funcionar Básico (Demo):
1. `npm install`
2. `npm run dev`
3. Pronto! Funciona em modo demo

### Para Funcionar Completo:
1. Configurar Supabase (banco + auth)
2. Configurar Stripe (pagamentos)
3. Criar arquivo .env com credenciais
4. `npm run dev`

### Ordem de Prioridade:
1. **CRÍTICO**: Supabase (autenticação)
2. **IMPORTANTE**: Stripe (pagamentos)
3. **OPCIONAL**: OpenAI (IA real)

A plataforma foi projetada para funcionar em modo demo mesmo sem configurações externas, mas para funcionalidade completa, Supabase e Stripe são essenciais.