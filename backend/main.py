"""
Tickrify Backend - Sistema robusto de análise técnica com IA
Arquitetura escalável e resistente a falhas
"""

import os
import json
import logging
import traceback
import sqlite3
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from openai import OpenAI
import stripe
from dotenv import load_dotenv

# Configurar logging robusto
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('tickrify.log', mode='a', encoding='utf-8')
    ]
)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente do diretório raiz
load_dotenv(dotenv_path="../.env")

# Configurações globais
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
TIMEOUT_SECONDS = 120

# Configurações do Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY
    logger.info("✅ Stripe configurado com sucesso")
else:
    logger.warning("⚠️ STRIPE_SECRET_KEY não configurada - pagamentos indisponíveis")

# ===================================
# SISTEMA DE BANCO DE DADOS E USUÁRIOS
# ===================================

DB_PATH = Path("tickrify_users.db")

def init_database():
    """Inicializa o banco de dados SQLite"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Tabela de usuários
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                plan TEXT DEFAULT 'FREE',
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                subscription_status TEXT DEFAULT 'inactive',
                analyses_used INTEGER DEFAULT 0,
                analyses_limit INTEGER DEFAULT 0,
                subscription_start DATE,
                subscription_end DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabela de análises
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS analyses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                analysis_type TEXT NOT NULL,
                tokens_used INTEGER DEFAULT 0,
                cost REAL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("✅ Banco de dados inicializado com sucesso")
        
    except Exception as e:
        logger.error(f"❌ Erro ao inicializar banco de dados: {e}")

# Inicializar o banco na startup
init_database()

class UserSubscription:
    """Gerenciador de assinaturas de usuários"""
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[Dict]:
        """Busca usuário por email"""
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            conn.close()
            
            return dict(user) if user else None
            
        except Exception as e:
            logger.error(f"Erro ao buscar usuário {email}: {e}")
            return None
    
    @staticmethod
    def create_or_update_user(email: str, plan: str = 'FREE') -> Dict:
        """Cria ou atualiza usuário"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Verificar se usuário existe
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                # Atualizar usuário existente
                cursor.execute("""
                    UPDATE users 
                    SET plan = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE email = ?
                """, (plan, email))
                user_id = existing_user[0]
            else:
                # Criar novo usuário
                analyses_limit = 120 if plan == 'TRADER' else 0
                cursor.execute("""
                    INSERT INTO users (email, plan, analyses_limit) 
                    VALUES (?, ?, ?)
                """, (email, plan, analyses_limit))
                user_id = cursor.lastrowid
            
            conn.commit()
            conn.close()
            
            # Retornar dados atualizados
            return UserSubscription.get_user_by_email(email)
            
        except Exception as e:
            logger.error(f"Erro ao criar/atualizar usuário {email}: {e}")
            return None
    
    @staticmethod
    def activate_trader_plan(email: str, stripe_customer_id: str = None, stripe_subscription_id: str = None) -> bool:
        """Ativa plano TRADER para o usuário"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE users 
                SET plan = 'TRADER',
                    analyses_limit = 120,
                    analyses_used = 0,
                    subscription_status = 'active',
                    subscription_start = DATE('now'),
                    subscription_end = DATE('now', '+1 month'),
                    stripe_customer_id = ?,
                    stripe_subscription_id = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            """, (stripe_customer_id, stripe_subscription_id, email))
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Plano TRADER ativado para {email}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Erro ao ativar plano TRADER para {email}: {e}")
            return False
    
    @staticmethod
    def use_analysis(email: str) -> Dict:
        """Registra uso de uma análise e retorna status"""
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Buscar dados atuais do usuário
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            
            if not user:
                return {"success": False, "error": "Usuário não encontrado"}
            
            user_dict = dict(user)
            current_used = user_dict['analyses_used']
            limit = user_dict['analyses_limit']
            
            # Verificar se usuário tem plano ativo
            if user_dict['plan'] == 'FREE':
                return {
                    "success": False, 
                    "error": "Plano FREE não permite análises reais",
                    "plan": "FREE",
                    "used": 0,
                    "limit": 0,
                    "remaining": 0,
                    "warning": False
                }
            
            # Verificar limite
            if current_used >= limit:
                return {
                    "success": False,
                    "error": "Limite de análises atingido",
                    "plan": user_dict['plan'],
                    "used": current_used,
                    "limit": limit,
                    "remaining": 0
                }
            
            # Incrementar uso
            new_used = current_used + 1
            cursor.execute("""
                UPDATE users 
                SET analyses_used = ?, updated_at = CURRENT_TIMESTAMP
                WHERE email = ?
            """, (new_used, email))
            
            # Registrar análise
            cursor.execute("""
                INSERT INTO analyses (user_id, analysis_type)
                VALUES (?, 'chart_analysis')
            """, (user_dict['id'],))
            
            conn.commit()
            conn.close()
            
            remaining = limit - new_used
            
            logger.info(f"📊 Análise registrada para {email}: {new_used}/{limit}")
            
            return {
                "success": True,
                "plan": user_dict['plan'],
                "used": new_used,
                "limit": limit,
                "remaining": remaining,
                "warning": remaining <= 10 and remaining > 0,
                "warning_message": f"Atenção: Restam apenas {remaining} análises!" if remaining <= 10 else None
            }
            
        except Exception as e:
            logger.error(f"❌ Erro ao registrar análise para {email}: {e}")
            return {"success": False, "error": "Erro interno"}
    
    @staticmethod
    def get_user_stats(email: str) -> Dict:
        """Retorna estatísticas do usuário"""
        user = UserSubscription.get_user_by_email(email)
        if not user:
            return {"error": "Usuário não encontrado"}
        
        remaining = user['analyses_limit'] - user['analyses_used']
        
        return {
            "email": user['email'],
            "plan": user['plan'],
            "subscription_status": user['subscription_status'],
            "analyses_used": user['analyses_used'],
            "analyses_limit": user['analyses_limit'],
            "remaining_analyses": max(0, remaining),
            "subscription_start": user['subscription_start'],
            "subscription_end": user['subscription_end'],
            "warning": remaining <= 10 and remaining > 0,
            "blocked": remaining <= 0 and user['plan'] == 'TRADER'
        }
    

# ===================================
# MODELOS PYDANTIC PARA API
# ===================================

class TickrifyConfig:
    """Configurações centralizadas do sistema"""
    
    @staticmethod
    def validate_openai_key() -> bool:
        """Valida se a chave OpenAI está configurada"""
        return bool(OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here")
    
    @staticmethod
    def get_openai_client():
        """Retorna cliente OpenAI configurado"""
        if not TickrifyConfig.validate_openai_key():
            raise ValueError("Chave OpenAI não configurada corretamente")
        return OpenAI(api_key=OPENAI_API_KEY)

class ImageAnalysisRequest(BaseModel):
    """Schema para requisição de análise de imagem"""
    data_url: str = Field(..., description="URL da imagem em base64")
    symbol: Optional[str] = Field(None, description="Símbolo do ativo (opcional)")
    user_email: Optional[str] = Field(None, description="Email do usuário para controle de limite")
    
    class Config:
        json_schema_extra = {
            "example": {
                "data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
                "symbol": "BTCUSDT",
                "user_email": "user@example.com"
            }
        }

class AnalysisResponse(BaseModel):
    """Schema para resposta de análise"""
    success: bool
    analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime
    processing_time: float
    user_plan: Optional[str] = None
    analyses_used: Optional[int] = None
    analyses_remaining: Optional[int] = None
    warning: Optional[bool] = None
    warning_message: Optional[str] = None

class HealthResponse(BaseModel):
    """Schema para resposta de health check"""
    status: str
    message: str
    timestamp: datetime
    openai_configured: bool

class StripeCheckoutRequest(BaseModel):
    """Schema para criação de sessão de checkout do Stripe"""
    priceId: str = Field(..., description="ID do preço no Stripe")
    successUrl: Optional[str] = Field(None, description="URL de sucesso")
    cancelUrl: Optional[str] = Field(None, description="URL de cancelamento")
    mode: str = Field(default="subscription", description="Modo: subscription ou payment")
    user_email: Optional[str] = Field(None, description="Email do usuário para associar a assinatura")
    
    class Config:
        json_schema_extra = {
            "example": {
                "priceId": "price_1S2cj4B1hl0IoocUfB4Xwgrp",
                "successUrl": "https://tickrify.com/success",
                "cancelUrl": "https://tickrify.com/cancel",
                "mode": "subscription",
                "user_email": "user@example.com"
            }
        }

class StripeCheckoutResponse(BaseModel):
    """Schema para resposta de checkout do Stripe"""
    sessionId: str
    url: str
    success: bool


# Prompt profissional otimizado para análise técnica
ANALYSIS_PROMPT = """
Você é um analista técnico EXPERT especializado em análise de gráficos financeiros.

INSTRUÇÕES CRÍTICAS:
- Analise APENAS o que está VISÍVEL no gráfico
- Use seus conhecimentos profundos em análise técnica
- Identifique TODOS os indicadores, padrões e sinais visíveis
- Seja PRECISO e DETALHADO na análise
- Retorne APENAS um JSON válido, sem texto extra

METODOLOGIA DE ANÁLISE:

1. ESTRUTURA DE MERCADO:
   - Tendência primária (Alta/Baixa/Lateral)
   - Linhas de tendência
   - Topos e fundos
   - Suportes e resistências

2. PADRÕES CANDLESTICK:
   - Padrões de reversão (Engolfo, Martelo, Doji, etc.)
   - Padrões de continuação
   - Força e confiabilidade

3. INDICADORES TÉCNICOS:
   - RSI (14): sobrevenda/sobrecompra
   - MACD: divergências e sinais
   - Médias móveis: 20, 50, 200
   - Volume: confirmação de movimentos
   - Bandas de Bollinger: volatilidade
   - Stochastic: momentum

4. GESTÃO DE RISCO:
   - Pontos de entrada
   - Stop loss baseado em S/R
   - Take profit calculado
   - Risk/Reward ratio

5. CONFLUÊNCIAS:
   - Múltiplos sinais convergindo
   - Pontos de alta probabilidade
   - Zonas de decisão

RESPOSTA OBRIGATÓRIA (JSON):

⚠️ IMPORTANTE: SEMPRE ANALISE E EXTRAIA:
1. SÍMBOLO DO ATIVO (obrigatório) - Leia exatamente o que está escrito no gráfico
2. PREÇO ATUAL (obrigatório) - Extraia o valor exato visível na imagem
3. NOME/VALOR DE MERCADO (obrigatório) - Identifique qual ativo está sendo analisado

{
  "analise_metadata": {
    "qualidade_imagem": "Excelente|Boa|Ruim|Inadequada",
    "simbolo_detectado": "SÍMBOLO EXATO lido do gráfico (ex: BTCUSDT, EURUSD, AAPL)",
    "timeframe_detectado": "1m|5m|15m|1h|4h|1d detectado"
  },
  "estrutura_mercado": {
    "tendencia_primaria": "Alta|Baixa|Lateral|Indefinida",
    "tendencia_secundaria": "Alta|Baixa|Lateral|Indefinida", 
    "descricao_contexto": "descrição técnica detalhada da estrutura",
    "suportes_visiveis": ["preço1", "preço2", "preço3"],
    "resistencias_visiveis": ["preço1", "preço2", "preço3"]
  },
  "sinais_tecnicos": {
    "diagnostico_clareza": "Claro|Ambíguo|Inexistente",
    "padrao_candlestick": {
      "nome": "nome específico do padrão",
      "interpretacao": "significado técnico detalhado"
    },
    "indicadores_visiveis": [
      {
        "nome": "RSI",
        "sinal": "valor e interpretação (ex: RSI 75 - sobrecompra)"
      },
      {
        "nome": "MACD", 
        "sinal": "estado e sinal (ex: MACD acima da linha zero - momentum positivo)"
      },
      {
        "nome": "Médias Móveis",
        "sinal": "configuração das MAs (ex: MM20 > MM50 - tendência de alta)"
      },
      {
        "nome": "Volume",
        "sinal": "análise do volume (ex: volume crescente confirma movimento)"
      }
    ]
  },
  "decisao_analista": {
    "recomendacao": "COMPRA|VENDA|AGUARDAR|NEUTRO",
    "qualidade_oportunidade": "Alta|Media|Baixa|Inexistente",
    "justificativa_confluencia": "explicação detalhada baseada em múltiplos sinais técnicos",
    "fatores_convergentes": ["fator técnico 1", "fator técnico 2", "fator técnico 3"],
    "fatores_divergentes": ["risco 1", "risco 2"]
  },
  "gestao_risco_sugerida": {
    "preco_entrada": "preço específico baseado em S/R",
    "stop_loss": "nível de stop baseado em análise técnica", 
    "take_profit": "alvo baseado em projeções técnicas"
  },
  "market_snapshot": {
    "simbolo_mercado": "SÍMBOLO EXATO detectado na imagem (OBRIGATÓRIO)",
    "preco_atual": "PREÇO ATUAL EXATO visível no gráfico (OBRIGATÓRIO)",
    "variacao_24h": "variação lida ou estimada",
    "variacao_percentual": "percentual de variação",
    "maxima_24h": "máxima visível",
    "minima_24h": "mínima visível", 
    "volume_24h": "volume lido ou N/D",
    "tendencia_atual": "direção da tendência atual",
    "forca_tendencia": "forte|moderada|fraca",
    "indicadores_resumo": ["RSI", "MACD", "MAs", "Volume", "outros"],
    "confluencias_tecnicas": ["confluência 1", "confluência 2"],
    "resumo_rapido": "resumo profissional em 1-2 frases incluindo NOME DO ATIVO e VALOR"
  },
  "contexto_mercado_detectado": {
    "tipo_identificado": "Tendência Alta|Tendência Baixa|Lateral|Alta Volatilidade|Baixa Volatilidade",
    "evidencias_visuais": ["evidência 1", "evidência 2", "evidência 3"],
    "indicadores_priorizados": ["indicador principal 1", "indicador principal 2"],
    "indicadores_secundarios": ["indicador secundário 1", "indicador secundário 2"],
    "justificativa_adaptacao": "explicação de por que estes indicadores foram escolhidos para este contexto",
    "estrategia_recomendada": "estratégia específica para este tipo de mercado"
  },
  "alerta_limitacoes": "limitações específicas desta análise"
}

IMPORTANTE: 
1. SEMPRE LEIA O SÍMBOLO EXATO DO GRÁFICO (ex: BTCUSDT, EURUSD, AAPL)
2. SEMPRE EXTRAIA O PREÇO ATUAL VISÍVEL NA IMAGEM
3. IDENTIFIQUE QUAL ATIVO/MERCADO ESTÁ ANALISANDO
4. Retorne APENAS o JSON, sem texto antes ou depois
5. Seja específico nos preços e níveis
6. Use terminologia técnica PRECISA

METODOLOGIA DE ANÁLISE ADAPTATIVA:

**DETECÇÃO AUTOMÁTICA DO CONTEXTO:**
Antes de aplicar indicadores, IDENTIFIQUE automaticamente o tipo de mercado:

1. **CLASSIFICAÇÃO DO GRÁFICO:**
   - TENDÊNCIA ALTA: HH (Higher Highs) + HL (Higher Lows) visíveis
   - TENDÊNCIA BAIXA: LH (Lower Highs) + LL (Lower Lows) visíveis  
   - LATERAL: Preços oscilando entre suporte/resistência bem definidos
   - ALTA VOLATILIDADE: Candles grandes, gaps, movimentos > 3% em poucos períodos
   - BAIXA VOLATILIDADE: Candles pequenos, consolidação, range < 1%

2. **ADAPTAÇÃO AUTOMÁTICA DE INDICADORES:**

   **TENDÊNCIA (Alta/Baixa):**
   - PRINCIPAIS: Médias Móveis (20/50/200), ADX, Parabolic SAR
   - SECUNDÁRIOS: MACD (momentum), Volume (confirmação)
   - PADRÕES: Flags, Pennants, Pullbacks
   
   **LATERAL:**
   - PRINCIPAIS: RSI (30/70), Stochastic, Bandas de Bollinger
   - SECUNDÁRIOS: Suportes/Resistências, Volume nos extremos
   - PADRÕES: Rectângulos, Double Tops/Bottoms
   
   **ALTA VOLATILIDADE:**
   - PRINCIPAIS: ATR, Bandas de Bollinger (expansão), Volume climático
   - GESTÃO: Stops ampliados, R/AR mínimo 1:3
   
   **BAIXA VOLATILIDADE:**
   - PRINCIPAIS: Bollinger Squeeze, Triângulos, ADX < 25
   - ESTRATÉGIA: Aguardar breakout confirmado

3. **RESPOSTA CONTEXTUAL:**
   No JSON, inclua o campo "contexto_mercado_detectado" com:
   - Tipo identificado e evidências visuais
   - Indicadores escolhidos e justificativa
   - Adaptação da estratégia ao contexto
"""

class TickrifyAnalyzer:
    """Classe principal para análise técnica com IA"""
    
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Inicializa o cliente OpenAI"""
        try:
            self.client = TickrifyConfig.get_openai_client()
            logger.info("Cliente OpenAI inicializado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao inicializar cliente OpenAI: {e}")
            self.client = None
    
    def _validate_image(self, data_url: str) -> bool:
        """Valida formato e tamanho da imagem"""
        try:
            if not data_url.startswith("data:image/"):
                return False
            
            # Estimar tamanho do base64
            base64_data = data_url.split(",")[1]
            estimated_size = len(base64_data) * 3 / 4
            
            if estimated_size > MAX_IMAGE_SIZE:
                logger.warning(f"Imagem muito grande: {estimated_size} bytes")
                return False
            
            return True
        except Exception as e:
            logger.error(f"Erro na validação da imagem: {e}")
            return False
    
    def _call_openai_api(self, data_url: str) -> Dict[str, Any]:
        """Chama a API da OpenAI de forma robusta"""
        if not self.client:
            raise HTTPException(status_code=500, detail="Cliente OpenAI não configurado")
        
        try:
            logger.info("Iniciando chamada para OpenAI API")
            
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": ANALYSIS_PROMPT
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": data_url,
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.1,
                timeout=TIMEOUT_SECONDS
            )
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("Resposta vazia da OpenAI")
            
            logger.info("Resposta recebida da OpenAI com sucesso")
            return self._parse_openai_response(content)
            
        except Exception as e:
            logger.error(f"Erro na chamada OpenAI: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500, 
                detail=f"Erro na análise com IA: {str(e)}"
            )
    
    def _parse_openai_response(self, content: str) -> Dict[str, Any]:
        """Parse robusto da resposta da OpenAI"""
        try:
            # Limpar content e extrair JSON
            content = content.strip()
            
            # Procurar por JSON na resposta
            start_idx = content.find('{')
            end_idx = content.rfind('}') + 1
            
            if start_idx == -1 or end_idx == 0:
                raise ValueError("JSON não encontrado na resposta")
            
            json_str = content[start_idx:end_idx]
            result = json.loads(json_str)
            
            # Validar estrutura mínima
            required_fields = [
                'analise_metadata', 'estrutura_mercado', 'sinais_tecnicos',
                'decisao_analista', 'gestao_risco_sugerida', 'market_snapshot',
                'contexto_mercado_detectado'
            ]
            
            for field in required_fields:
                if field not in result:
                    logger.warning(f"Campo obrigatório ausente: {field}")
                    result[field] = self._get_default_field(field)
            
            logger.info("Resposta parseada e validada com sucesso")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Erro no parse JSON: {e}")
            logger.error(f"Content recebido: {content[:500]}...")
            raise ValueError(f"Erro no parse da resposta JSON: {str(e)}")
        except Exception as e:
            logger.error(f"Erro geral no parse: {e}")
            raise ValueError(f"Erro no processamento da resposta: {str(e)}")
    
    def _get_default_field(self, field_name: str) -> Dict[str, Any]:
        """Retorna valores padrão para campos ausentes"""
        defaults = {
            'analise_metadata': {
                'qualidade_imagem': 'Inadequada',
                'simbolo_detectado': 'N/D',
                'timeframe_detectado': 'N/D'
            },
            'estrutura_mercado': {
                'tendencia_primaria': 'Indefinida',
                'tendencia_secundaria': 'Indefinida',
                'descricao_contexto': 'Não foi possível analisar',
                'suportes_visiveis': [],
                'resistencias_visiveis': []
            },
            'sinais_tecnicos': {
                'diagnostico_clareza': 'Inexistente',
                'padrao_candlestick': {
                    'nome': 'N/D',
                    'interpretacao': 'Não identificado'
                },
                'indicadores_visiveis': []
            },
            'decisao_analista': {
                'recomendacao': 'AGUARDAR',
                'qualidade_oportunidade': 'Inexistente',
                'justificativa_confluencia': 'Imagem inadequada para análise',
                'fatores_convergentes': [],
                'fatores_divergentes': ['Qualidade inadequada']
            },
            'gestao_risco_sugerida': {
                'preco_entrada': 'N/D',
                'stop_loss': 'N/D',
                'take_profit': 'N/D'
            },
            'market_snapshot': {
                'simbolo_mercado': 'N/D',
                'preco_atual': 'N/D',
                'variacao_24h': 'N/D',
                'variacao_percentual': 'N/D',
                'maxima_24h': 'N/D',
                'minima_24h': 'N/D',
                'volume_24h': 'N/D',
                'tendencia_atual': 'N/D',
                'forca_tendencia': 'N/D',
                'indicadores_resumo': [],
                'confluencias_tecnicas': [],
                'resumo_rapido': 'Análise não disponível'
            },
            'contexto_mercado_detectado': {
                'tipo_identificado': 'Indefinido',
                'evidencias_visuais': ['Imagem inadequada para análise'],
                'indicadores_priorizados': [],
                'indicadores_secundarios': [],
                'justificativa_adaptacao': 'Não foi possível identificar contexto',
                'estrategia_recomendada': 'Aguardar melhor qualidade de imagem'
            }
        }
        return defaults.get(field_name, {})
    
    def analyze(self, request: ImageAnalysisRequest) -> Dict[str, Any]:
        """Método principal de análise"""
        start_time = datetime.now()
        
        try:
            logger.info(f"Iniciando análise para símbolo: {request.symbol}")
            
            # Validar imagem
            if not self._validate_image(request.data_url):
                raise HTTPException(
                    status_code=400, 
                    detail="Imagem inválida ou muito grande (máximo 10MB)"
                )
            
            # Chamar OpenAI
            result = self._call_openai_api(request.data_url)
            
            # Adicionar metadados
            processing_time = (datetime.now() - start_time).total_seconds()
            
            response = {
                "success": True,
                "analysis": result,
                "error": None,
                "timestamp": datetime.now(),
                "processing_time": processing_time
            }
            
            logger.info(f"Análise concluída com sucesso em {processing_time:.2f}s")
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.error(f"Erro na análise: {e}")
            
            return {
                "success": False,
                "analysis": None,
                "error": str(e),
                "timestamp": datetime.now(),
                "processing_time": processing_time
            }

# Inicializar FastAPI
app = FastAPI(
    title="Tickrify Backend",
    description="Sistema robusto de análise técnica com IA",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para desenvolvimento e Go Live
allowed_origins = [
    "http://localhost:5173",      # Vite dev
    "http://localhost:5174",      # Vite backup
    "http://localhost:5500",      # Go Live padrão
    "http://127.0.0.1:5500",      # Go Live alternativo
    "http://localhost:3000",      # React/Next.js
    "http://localhost:8080",      # Vue/outros
    "http://localhost:4200",      # Angular
    "*"                           # Permitir todos (apenas para desenvolvimento)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Inicializar analisador
analyzer = TickrifyAnalyzer()

# Middleware de logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    
    # Log da requisição
    logger.info(f"Request: {request.method} {request.url}")
    
    response = await call_next(request)
    
    # Log da resposta
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} - {process_time:.3f}s")
    
    return response

# Endpoints

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="ok",
        message="Tickrify Backend is running",
        timestamp=datetime.now(),
        openai_configured=TickrifyConfig.validate_openai_key()
    )

@app.post("/tickrify/analyze", response_model=AnalysisResponse)
async def analyze_chart(request: ImageAnalysisRequest):
    """Endpoint principal de análise técnica com controle de limite"""
    try:
        logger.info("Recebida requisição de análise")
        
        # Verificar se tem email do usuário para controle de limite
        user_email = request.dict().get('user_email')  # Assume que será adicionado na request
        
        if user_email:
            # Verificar limite antes de processar
            limit_check = UserSubscription.use_analysis(user_email)
            
            if not limit_check["success"]:
                # Retornar erro específico baseado no tipo
                if "limite" in limit_check.get("error", "").lower():
                    return JSONResponse(
                        status_code=402,  # Payment Required
                        content={
                            "error": limit_check["error"],
                            "plan": limit_check.get("plan"),
                            "used": limit_check.get("used"),
                            "limit": limit_check.get("limit"),
                            "remaining": limit_check.get("remaining"),
                            "upgrade_required": True
                        }
                    )
                elif "FREE" in limit_check.get("error", ""):
                    return JSONResponse(
                        status_code=402,  # Payment Required
                        content={
                            "error": "Plano FREE não permite análises reais. Faça upgrade para TRADER.",
                            "plan": "FREE",
                            "upgrade_required": True
                        }
                    )
                else:
                    raise HTTPException(status_code=400, detail=limit_check["error"])
        
        # Processar análise
        result = analyzer.analyze(request)
        
        if result["success"]:
            # Se tem usuário, adicionar informações de limite na resposta
            response_data = result["analysis"]
            
            if user_email:
                user_stats = UserSubscription.get_user_stats(user_email)
                response_data.update({
                    "user_plan": user_stats.get("plan"),
                    "analyses_used": user_stats.get("analyses_used"),
                    "analyses_remaining": user_stats.get("remaining_analyses"),
                    "warning": user_stats.get("warning"),
                    "warning_message": limit_check.get("warning_message") if user_email else None
                })
            
            return JSONResponse(
                status_code=200,
                content=response_data
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=result["error"]
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro não tratado no endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@app.post("/tickrify/test-analysis", response_model=AnalysisResponse)
async def test_analysis(request: ImageAnalysisRequest):
    """Endpoint de teste que simula uma análise completa para validar estrutura"""
    try:
        logger.info(f"Teste de análise para símbolo: {request.symbol}")
        
        # Simular análise completa com estrutura correta
        simulated_analysis = {
            "analise_metadata": {
                "qualidade_imagem": "Boa",
                "simbolo_detectado": request.symbol or "BTCUSDT",
                "timeframe_detectado": "1h"
            },
            "estrutura_mercado": {
                "tendencia_primaria": "Alta",
                "tendencia_secundaria": "Lateral",
                "descricao_contexto": "Mercado em tendência de alta com correção lateral no curto prazo. Formação de HH e HL confirmando estrutura bullish.",
                "suportes_visiveis": ["42500", "42000", "41800"],
                "resistencias_visiveis": ["44200", "44800", "45000"]
            },
            "sinais_tecnicos": {
                "diagnostico_clareza": "Claro",
                "padrao_candlestick": {
                    "nome": "Martelo Bullish",
                    "interpretacao": "Padrão de reversão no suporte com sombra inferior longa, indicando pressão compradora"
                },
                "indicadores_visiveis": [
                    {
                        "nome": "RSI",
                        "sinal": "RSI 58 - momentum positivo, saindo da zona de sobrevenda"
                    },
                    {
                        "nome": "MACD",
                        "sinal": "MACD acima da linha zero com divergência bullish confirmada"
                    },
                    {
                        "nome": "Médias Móveis",
                        "sinal": "MM20 > MM50 > MM200 - alinhamento bullish confirmado"
                    },
                    {
                        "nome": "Volume",
                        "sinal": "Volume crescente nas altas, confirmando movimento"
                    }
                ]
            },
            "decisao_analista": {
                "recomendacao": "COMPRA",
                "qualidade_oportunidade": "Alta",
                "justificativa_confluencia": "Confluência de múltiplos sinais: suporte testado com sucesso, padrão candlestick bullish, RSI recuperando, MACD positivo e volume confirmando. Setup de alta probabilidade.",
                "fatores_convergentes": [
                    "Teste de suporte com rejeição",
                    "Padrão candlestick de reversão",
                    "Indicadores alinhados bullish",
                    "Volume confirmando movimento"
                ],
                "fatores_divergentes": [
                    "Resistência próxima em 44200",
                    "Mercado ainda em correção de menor grau"
                ]
            },
            "gestao_risco_sugerida": {
                "preco_entrada": "43150",
                "stop_loss": "42750",
                "take_profit": "44500"
            },
            "market_snapshot": {
                "simbolo_mercado": request.symbol or "BTCUSDT",
                "preco_atual": "43180",
                "variacao_24h": "+850",
                "variacao_percentual": "+2.1%",
                "maxima_24h": "43500",
                "minima_24h": "42100",
                "volume_24h": "2.8B",
                "tendencia_atual": "Alta",
                "forca_tendencia": "moderada",
                "indicadores_resumo": ["RSI bullish", "MACD positivo", "MAs alinhadas", "Volume confirmando"],
                "confluencias_tecnicas": ["Suporte + Candlestick + Indicadores", "Volume + Momentum + S/R"],
                "resumo_rapido": "Setup bullish de alta qualidade com confluência técnica favorável. R/R 1:3.4 atrativo."
            },
            "contexto_mercado_detectado": {
                "tipo_identificado": "Tendência de Alta",
                "evidencias_visuais": [
                    "3 Higher Highs consecutivos identificados",
                    "2 Higher Lows confirmados", 
                    "Preços acima de todas as médias móveis",
                    "Volume crescente nas altas"
                ],
                "indicadores_priorizados": ["Médias Móveis", "Volume", "MACD"],
                "indicadores_secundarios": ["RSI", "Suporte/Resistência"],
                "justificativa_adaptacao": "Em tendência de alta, priorizamos MAs para confirmação direcional, Volume para validação e MACD para momentum. RSI usado apenas para timing de entrada em pullbacks.",
                "estrategia_recomendada": "Aguardar pullback para MM20, entrada com confirmação de volume, stop loss em HL anterior, take profit em próxima resistência."
            },
            "alerta_limitacoes": "Análise simulada para teste do sistema. Em análise real, considerar contexto macroeconômico e sentiment de mercado."
        }
        
        processing_time = 0.5  # Simular tempo de processamento
        
        response = {
            "success": True,
            "analysis": simulated_analysis,
            "error": None,
            "timestamp": datetime.now().isoformat(),
            "processing_time": processing_time
        }
        
        logger.info("Teste de análise completado com sucesso")
        return JSONResponse(status_code=200, content=response)
        
    except Exception as e:
        logger.error(f"Erro no teste de análise: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro no teste: {str(e)}"
        )

@app.post("/tickrify/test-analysis-adaptive", response_model=AnalysisResponse)
async def test_analysis_adaptive(request: ImageAnalysisRequest):
    """Endpoint de teste que simula diferentes contextos baseado no símbolo"""
    try:
        logger.info(f"Teste adaptativo para símbolo: {request.symbol}")
        
        symbol = request.symbol or "BTCUSDT"
        
        # Definir contextos baseados no símbolo
        market_contexts = {
            "BTCUSDT": {
                "tipo": "Tendência de Alta",
                "evidencias": [
                    "3 Higher Highs consecutivos identificados",
                    "2 Higher Lows confirmados", 
                    "Preços acima de todas as médias móveis",
                    "Volume crescente nas altas"
                ],
                "indicadores_principais": ["Médias Móveis", "Volume", "MACD"],
                "indicadores_secundarios": ["RSI", "Suporte/Resistência"],
                "estrategia": "Aguardar pullback para MM20, entrada com confirmação de volume, stop loss em HL anterior.",
                "justificativa": "Em tendência de alta, priorizamos MAs para confirmação direcional, Volume para validação e MACD para momentum.",
                "recomendacao": "COMPRA",
                "padrão": "Flag Bullish"
            },
            "ETHUSDT": {
                "tipo": "Tendência de Baixa", 
                "evidencias": [
                    "3 Lower Highs consecutivos identificados",
                    "2 Lower Lows confirmados",
                    "Rompimento de suporte importante",
                    "Volume alto na queda"
                ],
                "indicadores_principais": ["Médias Móveis", "ADX", "Parabolic SAR"],
                "indicadores_secundarios": ["RSI", "Volume"],
                "estrategia": "Aguardar rally para MM20, entrada short com confirmação, stop em LH anterior.",
                "justificativa": "Em tendência de baixa, priorizamos MAs como resistência dinâmica, ADX para força da tendência e SAR para timing.",
                "recomendacao": "VENDA",
                "padrão": "Bear Flag"
            },
            "ADAUSDT": {
                "tipo": "Mercado Lateral",
                "evidencias": [
                    "Preços oscilando entre 0.45 e 0.55",
                    "Múltiplos testes de suporte e resistência",
                    "Volume baixo e decrescente",
                    "Médias móveis entrelaçadas"
                ],
                "indicadores_principais": ["RSI", "Stochastic", "Bandas de Bollinger"],
                "indicadores_secundarios": ["Suporte/Resistência", "Volume"],
                "estrategia": "Comprar no suporte (RSI<30), vender na resistência (RSI>70), aguardar breakout.",
                "justificativa": "Em mercado lateral, priorizamos osciladores (RSI/Stochastic) para extremos e Bollinger para limites dinâmicos.",
                "recomendacao": "AGUARDAR",
                "padrão": "Inside Bar"
            },
            "DOGEUSDT": {
                "tipo": "Alta Volatilidade",
                "evidencias": [
                    "Candles com 8%+ de variação",
                    "Gaps frequentes entre sessões",
                    "ATR acima de 150% da média",
                    "Bandas de Bollinger expandidas"
                ],
                "indicadores_principais": ["ATR", "Bandas de Bollinger", "Volume"],
                "indicadores_secundarios": ["MACD", "RSI"],
                "estrategia": "Gestão de risco ampliada (stops 2x ATR), aguardar confirmação extra, R/AR mínimo 1:3.",
                "justificativa": "Em alta volatilidade, priorizamos ATR para dimensionar risco, Bollinger para extremos e Volume para confirmação.",
                "recomendacao": "AGUARDAR",
                "padrão": "Volatility Spike"
            }
        }
        
        # Usar contexto específico ou padrão
        context = market_contexts.get(symbol, market_contexts["BTCUSDT"])
        
        # Gerar análise adaptativa
        simulated_analysis = {
            "analise_metadata": {
                "qualidade_imagem": "Boa",
                "simbolo_detectado": symbol,
                "timeframe_detectado": "1h"
            },
            "estrutura_mercado": {
                "tendencia_primaria": context["tipo"].split()[0] if "Tendência" in context["tipo"] else "Lateral",
                "tendencia_secundaria": "Consolidação",
                "descricao_contexto": f"Mercado apresentando {context['tipo'].lower()} com características bem definidas.",
                "suportes_visiveis": ["42500", "42000", "41800"],
                "resistencias_visiveis": ["44200", "44800", "45000"]
            },
            "sinais_tecnicos": {
                "diagnostico_clareza": "Claro",
                "padrao_candlestick": {
                    "nome": context["padrão"],
                    "interpretacao": f"Padrão típico de {context['tipo'].lower()}"
                },
                "indicadores_visiveis": [
                    {
                        "nome": ind,
                        "sinal": f"{ind} adequado para contexto de {context['tipo']}"
                    } for ind in context["indicadores_principais"]
                ]
            },
            "decisao_analista": {
                "recomendacao": context["recomendacao"],
                "qualidade_oportunidade": "Alta" if context["recomendacao"] != "AGUARDAR" else "Média",
                "justificativa_confluencia": context["justificativa"],
                "fatores_convergentes": context["evidencias"][:2],
                "fatores_divergentes": ["Aguardar confirmação adicional"]
            },
            "gestao_risco_sugerida": {
                "preco_entrada": "43150",
                "stop_loss": "42750", 
                "take_profit": "44500"
            },
            "market_snapshot": {
                "simbolo_mercado": symbol,
                "preco_atual": "43180",
                "variacao_24h": "+850",
                "variacao_percentual": "+2.1%",
                "maxima_24h": "43500",
                "minima_24h": "42100", 
                "volume_24h": "2.8B",
                "tendencia_atual": context["tipo"],
                "forca_tendencia": "moderada",
                "indicadores_resumo": context["indicadores_principais"],
                "confluencias_tecnicas": ["Contexto + Indicadores", "Padrão + Volume"],
                "resumo_rapido": f"Setup de {context['tipo']} identificado com adaptação técnica específica."
            },
            "contexto_mercado_detectado": {
                "tipo_identificado": context["tipo"],
                "evidencias_visuais": context["evidencias"],
                "indicadores_priorizados": context["indicadores_principais"],
                "indicadores_secundarios": context["indicadores_secundarios"],
                "justificativa_adaptacao": context["justificativa"],
                "estrategia_recomendada": context["estrategia"]
            },
            "alerta_limitacoes": f"Análise simulada adaptativa para {context['tipo']}. Sistema demonstra capacidade de adaptação automática."
        }
        
        processing_time = 0.7
        
        response = {
            "success": True,
            "analysis": simulated_analysis,
            "error": None,
            "timestamp": datetime.now().isoformat(),
            "processing_time": processing_time
        }
        
        logger.info(f"Teste adaptativo completado para {symbol}: {context['tipo']}")
        return JSONResponse(status_code=200, content=response)
        
    except Exception as e:
        logger.error(f"Erro no teste adaptativo: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro no teste adaptativo: {str(e)}"
        )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Tickrify Backend API",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.post("/create-checkout-session", response_model=StripeCheckoutResponse)
async def create_checkout_session(request: StripeCheckoutRequest):
    """Criar sessão de checkout do Stripe"""
    try:
        if not STRIPE_SECRET_KEY:
            raise HTTPException(
                status_code=503,
                detail="Stripe não configurado. Configure STRIPE_SECRET_KEY."
            )
        
        logger.info(f"Criando sessão checkout para preço: {request.priceId}")
        
        # URLs padrão (Go Live na porta 5500)
        success_url = request.successUrl or "http://localhost:5500/success?session_id={CHECKOUT_SESSION_ID}"
        cancel_url = request.cancelUrl or "http://localhost:5500/cancel"
        
        # Criar sessão no Stripe
        metadata = {
            'created_at': datetime.now().isoformat(),
            'app': 'tickrify'
        }
        
        # Adicionar email do usuário se fornecido
        if request.user_email:
            metadata['user_email'] = request.user_email
            logger.info(f"Email do usuário adicionado aos metadados: {request.user_email}")
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': request.priceId,
                'quantity': 1,
            }],
            mode=request.mode,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        logger.info(f"✅ Sessão criada: {session.id}")
        
        return StripeCheckoutResponse(
            sessionId=session.id,
            url=session.url,
            success=True
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Erro do Stripe: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Erro do Stripe: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Erro geral: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )

@app.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    """Webhook do Stripe para eventos de pagamento"""
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not STRIPE_WEBHOOK_SECRET:
            logger.warning("STRIPE_WEBHOOK_SECRET não configurado")
            return {"status": "webhook secret not configured"}
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            logger.error(f"Payload inválido: {e}")
            raise HTTPException(status_code=400, detail="Payload inválido")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Assinatura inválida: {e}")
            raise HTTPException(status_code=400, detail="Assinatura inválida")
        
        # Processar eventos
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            logger.info(f"💰 Pagamento concluído: {session['id']}")
            
            # Extrair informações do pagamento
            customer_id = session.get('customer')
            subscription_id = session.get('subscription')
            customer_email = session.get('customer_details', {}).get('email')
            
            # Se não conseguir email do customer_details, tentar dos metadados
            if not customer_email:
                customer_email = session.get('metadata', {}).get('user_email')
            
            if customer_email:
                # Ativar plano TRADER automaticamente
                success = UserSubscription.activate_trader_plan(
                    email=customer_email,
                    stripe_customer_id=customer_id,
                    stripe_subscription_id=subscription_id
                )
                
                if success:
                    logger.info(f"✅ Plano TRADER ativado automaticamente para {customer_email}")
                else:
                    logger.error(f"❌ Erro ao ativar plano TRADER para {customer_email}")
            else:
                logger.warning("Email do cliente não encontrado no webhook (nem customer_details nem metadados)")
        
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            logger.info(f"🔄 Renovação de pagamento: {invoice['id']}")
            
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            logger.info(f"❌ Assinatura cancelada: {subscription['id']}")
            
            # Aqui você pode desativar o plano do usuário se necessário
            
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            logger.info(f"🔄 Fatura paga: {invoice['id']}")
            
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            logger.info(f"❌ Assinatura cancelada: {subscription['id']}")
            
        else:
            logger.info(f"📨 Evento não tratado: {event['type']}")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Erro no webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stripe/prices")
async def get_stripe_prices():
    """Listar preços disponíveis no Stripe"""
    try:
        if not STRIPE_SECRET_KEY:
            return {
                "prices": [],
                "message": "Stripe não configurado - usando preços mockados"
            }
        
        prices = stripe.Price.list(active=True, expand=['data.product'])
        
        formatted_prices = []
        for price in prices.data:
            formatted_prices.append({
                "id": price.id,
                "product_id": price.product.id,
                "product_name": price.product.name,
                "amount": price.unit_amount,
                "currency": price.currency,
                "interval": price.recurring.interval if price.recurring else None,
                "type": "subscription" if price.recurring else "one_time"
            })
        
        return {"prices": formatted_prices}
        
    except Exception as e:
        logger.error(f"Erro ao buscar preços: {e}")
        return {
            "prices": [],
            "error": str(e)
        }

@app.get("/stripe/prices-demo")
async def get_stripe_prices_demo():
    """Endpoint demo que simula preços do Stripe para demonstração"""
    try:
        logger.info("Retornando preços demo do Stripe")
        
        demo_prices = [
            {
                "id": "price_free",
                "product_id": "prod_free",
                "product_name": "FREE (Simulação)",
                "amount": 0,  # Grátis
                "currency": "brl",
                "interval": None,
                "type": "one_time",
                "description": "⚠️ APENAS DEMONSTRAÇÃO - Análises simuladas para teste da plataforma. Não utiliza IA real nem dados reais de mercado."
            },
            {
                "id": "price_1RjU3gB1hl0IoocUWlz842SY",
                "product_id": "prod_SenfkI77B5gR7Q", 
                "product_name": "TRADER (Profissional)",
                "amount": 5990,  # R$ 59.90
                "currency": "brl",
                "interval": "month",
                "type": "subscription",
                "description": "🚀 PLANO PROFISSIONAL - Análises reais com IA GPT-4, dados de mercado em tempo real, alertas personalizados e todas as funcionalidades ativas."
            }
        ]
        
        return {
            "prices": demo_prices,
            "demo": True,
            "message": "Preços de demonstração - integração Stripe configurada e funcionando"
        }
        
    except Exception as e:
        logger.error(f"Erro no endpoint demo: {e}")
        return {
            "prices": [],
            "error": str(e),
            "demo": True
        }

@app.post("/stripe/create-checkout-demo")
async def create_checkout_demo(request: StripeCheckoutRequest):
    """Endpoint demo que simula criação de checkout session"""
    try:
        logger.info(f"Simulando criação de checkout para preço: {request.priceId}")
        
        # Simular resposta de sucesso
        demo_session = {
            "sessionId": f"cs_demo_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "url": f"https://demo-stripe-checkout.com/session?price={request.priceId}",
            "success": True,
            "demo": True,
            "message": "Demo - em produção seria redirecionado para Stripe Checkout"
        }
        
        logger.info(f"✅ Sessão demo criada: {demo_session['sessionId']}")
        return demo_session
        
    except Exception as e:
        logger.error(f"Erro no checkout demo: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na demo: {str(e)}"
        )

# ===================================
# ENDPOINTS DE USUÁRIO E ASSINATURA
# ===================================

class UserLoginRequest(BaseModel):
    email: str
    password: str = None

class UserStatsResponse(BaseModel):
    email: str
    plan: str
    subscription_status: str
    analyses_used: int
    analyses_limit: int
    remaining_analyses: int
    warning: bool
    blocked: bool

@app.post("/user/login")
async def user_login(request: UserLoginRequest):
    """Login ou criação de usuário"""
    try:
        logger.info(f"Login/criação de usuário: {request.email}")
        
        # Criar ou buscar usuário (sempre inicia com plano FREE)
        user = UserSubscription.create_or_update_user(request.email, 'FREE')
        
        if not user:
            raise HTTPException(status_code=500, detail="Erro ao criar usuário")
        
        stats = UserSubscription.get_user_stats(request.email)
        
        return {
            "success": True,
            "message": "Login realizado com sucesso",
            "user": stats
        }
        
    except Exception as e:
        logger.error(f"Erro no login: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/stats/{email}")
async def get_user_stats(email: str):
    """Retorna estatísticas do usuário"""
    try:
        stats = UserSubscription.get_user_stats(email)
        
        if "error" in stats:
            raise HTTPException(status_code=404, detail=stats["error"])
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar stats do usuário {email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/use-analysis/{email}")
async def use_analysis(email: str):
    """Registra uso de uma análise"""
    try:
        result = UserSubscription.use_analysis(email)
        
        if not result["success"]:
            # Se não pode usar, retorna status 402 (Payment Required)
            status_code = 402 if "limite" in result.get("error", "").lower() else 400
            raise HTTPException(status_code=status_code, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao registrar análise para {email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/user/activate-trader/{email}")
async def activate_trader_plan(email: str, stripe_customer_id: str = None, stripe_subscription_id: str = None):
    """Ativa plano TRADER para o usuário"""
    try:
        success = UserSubscription.activate_trader_plan(email, stripe_customer_id, stripe_subscription_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Erro ao ativar plano TRADER")
        
        # Retornar stats atualizadas
        stats = UserSubscription.get_user_stats(email)
        
        return {
            "success": True,
            "message": "Plano TRADER ativado com sucesso!",
            "user": stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao ativar plano TRADER para {email}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Handler de erros global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {exc}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Erro interno do servidor",
            "message": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
