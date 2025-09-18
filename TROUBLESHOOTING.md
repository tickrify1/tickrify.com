# 🔧 Solução para Erro de Configuração - Tickrify

## 🚨 Erro: "Erro de Configuração - Erro inesperado - Recarregar Página"

### Causa Principal
Este erro acontece quando a aplicação não consegue inicializar devido a:
1. Variáveis de ambiente ausentes ou incorretas
2. Dependências não instaladas corretamente
3. Configuração do Supabase ausente
4. Problemas de autenticação

### ✅ Solução Passo a Passo

#### 1. Verificar Dependências
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Verificar se instalou corretamente
npm audit
```

#### 2. Criar Arquivo .env (CRÍTICO)
Crie um arquivo `.env` na raiz do projeto com o conteúdo mínimo:

```env
# Configuração mínima para funcionar em modo demo
VITE_SUPABASE_URL=https://demo.supabase.co
VITE_SUPABASE_ANON_KEY=demo-key

# Para funcionar com Supabase real, substitua pelos valores reais:
# VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# VITE_SUPABASE_ANON_KEY=sua-chave-anon-real

# Stripe (opcional para pagamentos)
# STRIPE_SECRET_KEY=sk_test_sua-chave
# STRIPE_WEBHOOK_SECRET=whsec_sua-chave

# OpenAI (opcional para IA real)
# VITE_OPENAI_API_KEY=sk-sua-chave
```

#### 3. Verificar Configuração do Supabase
Se você quer usar Supabase real:

1. **Criar projeto no Supabase:**
   - Acesse [supabase.com](https://supabase.com)
   - Crie novo projeto
   - Aguarde criação (2-3 minutos)

2. **Obter credenciais:**
   - Vá em Settings > API
   - Copie Project URL e anon key
   - Substitua no arquivo .env

3. **Configurar banco:**
   - Vá em SQL Editor
   - Execute o conteúdo do arquivo `supabase/migrations/20250710235508_withered_bridge.sql`

#### 4. Modo Demo (Funciona sem configurações)
Se você quer apenas testar, pode usar em modo demo:

```env
# Modo demo - funciona sem APIs externas
VITE_SUPABASE_URL=demo
VITE_SUPABASE_ANON_KEY=demo
```

#### 5. Executar a Aplicação
```bash
# Limpar e executar
npm run dev -- --force

# Ou tentar em porta diferente
npm run dev -- --port 3000
```

### 🔍 Diagnóstico de Problemas

#### Verificar Console do Browser
1. Abra F12 (DevTools)
2. Vá na aba Console
3. Procure por erros vermelhos
4. Anote as mensagens de erro

#### Erros Comuns e Soluções

**Erro: "Cannot read properties of undefined"**
- Solução: Criar arquivo .env com variáveis mínimas

**Erro: "Supabase client not configured"**
- Solução: Verificar VITE_SUPABASE_URL no .env

**Erro: "Module not found"**
- Solução: Executar `npm install` novamente

**Erro: "Port already in use"**
- Solução: Usar porta diferente `npm run dev -- --port 3001`

### 🚀 Teste Rápido

Para testar se está funcionando:

1. **Criar .env mínimo:**
```env
VITE_SUPABASE_URL=demo
VITE_SUPABASE_ANON_KEY=demo
```

2. **Executar:**
```bash
npm install
npm run dev
```

3. **Acessar:** http://localhost:5173

4. **Verificar:** Se a página de login aparece, está funcionando!

### 📱 Funcionalidades em Modo Demo

Mesmo sem configurações reais, você pode testar:
- ✅ Interface completa
- ✅ Login/registro (simulado)
- ✅ Upload de imagens
- ✅ Análise IA (simulada)
- ✅ Geração de sinais
- ✅ Dashboard completo
- ✅ Indicadores técnicos

### 🆘 Se Ainda Não Funcionar

Execute estes comandos de diagnóstico:

```bash
# Verificar versão do Node
node --version  # Deve ser 18+

# Verificar se o projeto está na pasta correta
ls -la  # Deve mostrar package.json

# Verificar se .env existe
cat .env

# Executar com logs detalhados
npm run dev -- --debug

# Verificar portas em uso
netstat -tulpn | grep :5173
```

### 📞 Próximos Passos

1. **Primeiro:** Fazer funcionar em modo demo
2. **Depois:** Configurar Supabase real
3. **Por último:** Configurar Stripe e OpenAI

O importante é fazer funcionar primeiro, depois ir configurando as APIs reais conforme necessário.