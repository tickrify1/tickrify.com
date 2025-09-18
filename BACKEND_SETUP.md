# 🚀 Tickrify com Backend FastAPI - Guia de Configuração

## 📋 Pré-requisitos

- Node.js 18+ 
- Python 3.8+
- Chave da OpenAI (opcional - funciona sem)

## 🛠️ Configuração Rápida

### 1. Frontend (React)
```bash
# Instalar dependências do frontend
npm install
```

### 2. Backend (FastAPI)
```bash
# Instalar dependências do backend
cd backend
pip install -r requirements.txt
```

### 3. Configurar OpenAI (Opcional)
```bash
# Criar arquivo .env na pasta backend
cd backend
echo "OPENAI_API_KEY=sk-sua_chave_openai_aqui" > .env
```

## 🚀 Executar Aplicação

### Opção 1: Executar Separadamente
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend  
npm run dev:backend
```

### Opção 2: Executar Tudo Junto
```bash
npm run dev:full
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Testando a Integração

1. Acesse http://localhost:5173
2. Faça login/registro
3. Vá para "Dashboard"
4. Faça upload de um gráfico
5. A análise será feita pelo backend FastAPI!

## 📡 Como Funciona

### Fluxo da Análise:
1. Frontend captura imagem e converte para base64
2. POST para `/api/analyze-chart` com `{image_base64, user_id}`
3. Backend decodifica imagem e chama OpenAI Vision
4. Retorna `{acao: "compra/venda/esperar", justificativa: "texto"}`
5. Frontend exibe resultado no fluxo existente

### Fallbacks:
- ✅ Se OpenAI disponível → Análise real
- ✅ Se OpenAI indisponível → Análise simulada (backend)
- ✅ Se backend indisponível → Análise local (frontend)

## 🔧 Configuração para Produção

### Backend
```bash
# Configurar variáveis de ambiente
OPENAI_API_KEY=sk-sua_chave_real
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend
```bash
# Configurar URL da API
VITE_API_URL=https://api.seudominio.com
```

### Deploy
```bash
# Build frontend
npm run build

# Deploy backend (exemplo com uvicorn)
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🎯 Endpoints da API

### POST /api/analyze-chart
```json
{
  "image_base64": "data:image/png;base64,iVBORw0...",
  "user_id": "user123"
}
```

**Resposta:**
```json
{
  "acao": "compra",
  "justificativa": "Rompimento de resistência com volume alto"
}
```

### GET /health
```json
{
  "status": "healthy",
  "openai_available": true
}
```

## 🛡️ Segurança

- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ Limpeza de arquivos temporários
- ✅ Tratamento de erros robusto

## 🔍 Logs e Debug

O sistema gera logs detalhados:
- 📤 Requisições recebidas
- 🖼️ Processamento de imagens
- 🤖 Chamadas para OpenAI
- ✅ Respostas enviadas
- ❌ Erros e fallbacks

## 🎉 Pronto para Produção!

O sistema está totalmente funcional e pronto para usuários reais:
- ✅ Backend FastAPI robusto
- ✅ Integração transparente com frontend
- ✅ Análise real com OpenAI Vision
- ✅ Fallbacks para alta disponibilidade
- ✅ Logs e monitoramento
- ✅ Fácil deploy e escalabilidade
