# Tickrify - Plataforma de Análise de Gráficos com IA

Tickrify é uma plataforma avançada de análise de gráficos financeiros que utiliza inteligência artificial para fornecer recomendações de trading precisas e confiáveis.

## Características Principais

- **Análise de Gráficos com IA**: Upload de imagens de gráficos para análise técnica avançada
- **Sistema de Assinaturas**: Diferentes planos com limites de uso personalizados
- **Dashboard Interativo**: Visualização de desempenho e histórico de análises
- **Sinais de Trading**: Geração automática de sinais baseados em análises
- **Integração com Stripe**: Sistema completo de pagamentos e assinaturas
- **Autenticação Segura**: Sistema de login com Supabase

## Tecnologias

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite
- Supabase Client

### Backend
- FastAPI (Python)
- Supabase (PostgreSQL)
- OpenAI API
- Stripe API

## Estrutura do Projeto

```
/
├── backend/               # API FastAPI
│   ├── ai_service.py      # Serviço de integração com IA
│   ├── auth.py            # Middleware de autenticação
│   ├── database.py        # Camada de acesso ao banco de dados
│   ├── error_handler.py   # Tratamento centralizado de erros
│   ├── main.py            # Endpoints principais da API
│   ├── schema.sql         # Esquema do banco de dados
│   └── stripe_webhook.py  # Manipulador de webhooks do Stripe
│
├── src/                   # Frontend React
│   ├── components/        # Componentes React
│   ├── hooks/             # React Hooks personalizados
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços de API
│   └── types/             # Definições de tipos TypeScript
│
└── env.example            # Exemplo de variáveis de ambiente
```

## Começando

### Pré-requisitos

- Node.js 16+ e npm
- Python 3.10+
- Conta no Supabase
- Conta no Stripe
- Conta na OpenAI

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/tickrify.git
   cd tickrify
   ```

2. Configure o backend:
   ```bash
   # Criar ambiente virtual Python
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate     # Windows
   
   # Instalar dependências
   pip install -r backend/requirements.txt
   
   # Configurar variáveis de ambiente
   cp env.example .env
   # Edite o arquivo .env com suas credenciais
   ```

3. Configure o frontend:
   ```bash
   # Instalar dependências
   npm install
   
   # Iniciar servidor de desenvolvimento
   npm run dev
   ```

4. Configurar banco de dados:
   - Crie um projeto no Supabase
   - Execute o script em `backend/schema.sql` no Editor SQL do Supabase

5. Iniciar o backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

## Implantação em Produção

Para instruções detalhadas sobre como implantar o Tickrify em produção, consulte o [Guia de Implantação](DEPLOYMENT_GUIDE.md).

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Suporte

Para suporte, entre em contato com support@tickrify.com ou abra uma issue no GitHub.