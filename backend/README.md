# Tickrify Backend - FastAPI

## Configuração

1. Instalar dependências:
```bash
cd backend
pip install -r requirements.txt
```

2. Configurar variáveis de ambiente:
```bash
# Criar arquivo .env na pasta backend
OPENAI_API_KEY=sk-sua_chave_openai_aqui
```

3. Executar o servidor:
```bash
python main.py
# ou
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /` - Status da API
- `GET /health` - Health check
- `POST /api/analyze-chart` - Análise de gráficos

## Estrutura da API

### POST /api/analyze-chart

**Request:**
```json
{
  "image_base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "user_id": "user123"
}
```

**Response:**
```json
{
  "acao": "compra",
  "justificativa": "Rompimento de resistência com volume alto, tendência de alta confirmada"
}
```

## Funcionalidades

- ✅ Análise real com OpenAI GPT-4 Vision
- ✅ Fallback para análise simulada
- ✅ CORS configurado para frontend
- ✅ Tratamento de erros robusto
- ✅ Logs detalhados
- ✅ Limpeza automática de arquivos temporários

## Produção

Para produção, configure:
- Variável de ambiente `OPENAI_API_KEY`
- URLs permitidas no CORS
- SSL/HTTPS
- Load balancer se necessário
