# Guia de Implantação do Tickrify

Este guia fornece instruções detalhadas para implantar o Tickrify em produção, configurando todos os componentes necessários para um sistema completo e funcional.

## Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
3. [Configuração do Backend](#configuração-do-backend)
4. [Configuração do Frontend](#configuração-do-frontend)
5. [Configuração do Stripe](#configuração-do-stripe)
6. [Configuração da OpenAI](#configuração-da-openai)
7. [Implantação em Produção](#implantação-em-produção)
8. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

## Pré-requisitos

Antes de iniciar a implantação, certifique-se de ter:

- Conta no [Supabase](https://supabase.com) (para banco de dados e autenticação)
- Conta no [Stripe](https://stripe.com) (para processamento de pagamentos)
- Conta na [OpenAI](https://openai.com) (para análise de gráficos)
- Servidor para hospedar o backend (recomendamos [Digital Ocean](https://www.digitalocean.com), [AWS](https://aws.amazon.com) ou [Heroku](https://www.heroku.com))
- Serviço para hospedar o frontend (recomendamos [Vercel](https://vercel.com) ou [Netlify](https://www.netlify.com))

## Configuração do Banco de Dados

1. **Criar projeto no Supabase**:
   - Acesse o [Supabase](https://supabase.com) e crie um novo projeto
   - Anote a URL e a chave anônima do projeto

2. **Executar script de criação do banco de dados**:
   - Acesse o Editor SQL do Supabase
   - Copie e cole o conteúdo do arquivo `backend/schema.sql`
   - Execute o script para criar as tabelas e políticas de segurança

3. **Configurar autenticação**:
   - No painel do Supabase, vá para Authentication > Settings
   - Configure o redirecionamento para a URL do seu frontend
   - Habilite o provedor de email/senha e Google (opcional)
   - Configure o template de email para confirmação e recuperação de senha

## Configuração do Backend

1. **Preparar ambiente**:
   - Clone o repositório em seu servidor
   - Crie um ambiente virtual Python: `python -m venv venv`
   - Ative o ambiente virtual: `source venv/bin/activate` (Linux/Mac) ou `venv\Scripts\activate` (Windows)
   - Instale as dependências: `pip install -r backend/requirements.txt`

2. **Configurar variáveis de ambiente**:
   - Copie o arquivo `env.example` para `.env` na raiz do projeto
   - Preencha todas as variáveis de ambiente com seus valores reais:
     ```
     SUPABASE_URL=sua-url-do-supabase
     SUPABASE_SERVICE_KEY=sua-chave-de-serviço-do-supabase
     SUPABASE_JWT_SECRET=seu-segredo-jwt-do-supabase
     STRIPE_SECRET_KEY=sua-chave-secreta-do-stripe
     STRIPE_WEBHOOK_SECRET=seu-segredo-de-webhook-do-stripe
     OPENAI_API_KEY=sua-chave-da-api-openai
     ```

3. **Testar backend localmente**:
   - Execute o servidor: `cd backend && uvicorn main:app --reload`
   - Verifique se a API está funcionando: `http://localhost:8000/health`

4. **Configurar servidor para produção**:
   - Instale e configure o Nginx como proxy reverso
   - Configure o Gunicorn para servir a aplicação FastAPI
   - Configure SSL com Let's Encrypt para HTTPS
   - Exemplo de configuração do Nginx:
     ```nginx
     server {
         listen 80;
         server_name api.seudominio.com;
         return 301 https://$host$request_uri;
     }

     server {
         listen 443 ssl;
         server_name api.seudominio.com;

         ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
         ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

         location / {
             proxy_pass http://localhost:8000;
             proxy_set_header Host $host;
             proxy_set_header X-Real-IP $remote_addr;
             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
             proxy_set_header X-Forwarded-Proto $scheme;
         }
     }
     ```

5. **Iniciar o serviço**:
   - Crie um serviço systemd para manter o backend rodando
   - Exemplo de arquivo de serviço (`/etc/systemd/system/tickrify.service`):
     ```ini
     [Unit]
     Description=Tickrify API
     After=network.target

     [Service]
     User=seu-usuario
     WorkingDirectory=/caminho/para/projeto
     Environment="PATH=/caminho/para/projeto/venv/bin"
     ExecStart=/caminho/para/projeto/venv/bin/gunicorn -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000 backend.main:app
     Restart=always

     [Install]
     WantedBy=multi-user.target
     ```
   - Ative e inicie o serviço:
     ```bash
     sudo systemctl enable tickrify
     sudo systemctl start tickrify
     ```

## Configuração do Frontend

1. **Preparar ambiente**:
   - Clone o repositório em seu ambiente de desenvolvimento
   - Instale as dependências: `npm install`

2. **Configurar variáveis de ambiente**:
   - Crie um arquivo `.env` na raiz do projeto frontend com as seguintes variáveis:
     ```
     VITE_SUPABASE_URL=sua-url-do-supabase
     VITE_SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
     VITE_API_URL=https://api.seudominio.com
     VITE_STRIPE_PUBLISHABLE_KEY=sua-chave-publicavel-do-stripe
     ```

3. **Compilar para produção**:
   - Execute: `npm run build`
   - Os arquivos serão gerados na pasta `dist`

4. **Implantar no serviço de hospedagem**:
   - **Vercel**:
     - Instale a CLI do Vercel: `npm i -g vercel`
     - Execute: `vercel` (para primeira implantação) ou `vercel --prod` (para atualizações)
   - **Netlify**:
     - Instale a CLI do Netlify: `npm i -g netlify-cli`
     - Execute: `netlify deploy --prod`

## Configuração do Stripe

1. **Configurar produtos e preços**:
   - Acesse o [Dashboard do Stripe](https://dashboard.stripe.com)
   - Crie os produtos e preços correspondentes aos planos do Tickrify
   - Anote os IDs dos preços para configuração no frontend

2. **Configurar webhook**:
   - No Dashboard do Stripe, vá para Developers > Webhooks
   - Adicione um endpoint: `https://api.seudominio.com/webhook/stripe`
   - Selecione os eventos:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Anote o Signing Secret para configuração no backend

3. **Atualizar configuração no código**:
   - Atualize os IDs de produtos/preços no arquivo `src/stripe-config.ts`

## Configuração da OpenAI

1. **Obter chave de API**:
   - Acesse o [Dashboard da OpenAI](https://platform.openai.com)
   - Crie uma chave de API
   - Defina limites de uso para controlar custos

2. **Configurar no backend**:
   - Adicione a chave na variável de ambiente `OPENAI_API_KEY`

## Implantação em Produção

1. **Verificação final**:
   - Teste todas as funcionalidades em ambiente de staging
   - Verifique se todas as variáveis de ambiente estão configuradas
   - Verifique se o banco de dados está configurado corretamente
   - Verifique se os webhooks do Stripe estão funcionando

2. **Implantação**:
   - Implante o backend no servidor de produção
   - Implante o frontend no serviço de hospedagem
   - Configure os domínios e certificados SSL

3. **Verificação pós-implantação**:
   - Teste o fluxo de registro e login
   - Teste o fluxo de assinatura e pagamento
   - Teste a análise de gráficos
   - Verifique se os webhooks estão recebendo eventos

## Monitoramento e Manutenção

1. **Configurar monitoramento**:
   - Configure alertas para erros no backend
   - Configure monitoramento de uso da API OpenAI
   - Configure alertas para falhas de pagamento no Stripe

2. **Backups**:
   - Configure backups automáticos do banco de dados
   - Estabeleça um processo de recuperação de desastres

3. **Atualizações**:
   - Estabeleça um processo para atualizações de segurança
   - Planeje janelas de manutenção para atualizações maiores

4. **Escalabilidade**:
   - Monitore o uso de recursos e escale conforme necessário
   - Considere adicionar um balanceador de carga se o tráfego aumentar

---

## Suporte

Em caso de problemas durante a implantação, entre em contato com a equipe de suporte em suporte@tickrify.com ou abra uma issue no repositório do GitHub.

## Contribuição

Contribuições são bem-vindas! Por favor, consulte o arquivo CONTRIBUTING.md para diretrizes sobre como contribuir para o projeto.


