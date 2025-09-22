import os
import base64
import json
import requests
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar chaves de API
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Prompt profissional para análise técnica
PROFESSIONAL_TRADING_PROMPT = """
Você é um analista técnico de mercado financeiro altamente especializado, com vasta experiência em análise gráfica, padrões de preço, indicadores técnicos e estratégias de trading. Sua tarefa é analisar uma imagem de um gráfico financeiro fornecida, utilizando seus conhecimentos avançados para extrair o máximo de informações e fornecer uma análise completa, precisa e acionável.

PROCESSO DE ANÁLISE PASSO A PASSO:

**PASSO 1: ANÁLISE DA ESTRUTURA DE MERCADO E TENDÊNCIA**
- Identifique a tendência principal (Alta, Baixa ou Lateral)
- Determine sub-tendências de menor grau
- Trace linhas de tendência (LTA/LTB)
- Marque topos e fundos relevantes

**PASSO 2: IDENTIFICAÇÃO DE SUPORTES E RESISTÊNCIAS**
- Detecte zonas de congestão
- Trace níveis horizontais de suporte/resistência
- Avalie a força de cada nível
- Observe mudanças de polaridade

**PASSO 3: ANÁLISE DE PADRÕES DE CANDLESTICK**
- Detecte padrões de reversão (Engolfo, Martelo, Estrela Cadente, etc.)
- Identifique padrões de continuação (Doji em tendência, etc.)
- Avalie confiabilidade (Alta/Média/Baixa)
- Contextualize com tendência e S/R

**PASSO 4: DETECÇÃO DE PADRÕES GRÁFICOS CLÁSSICOS**
- Procure padrões de reversão (OCO, Topo/Fundo Duplo, etc.)
- Identifique padrões de continuação (Triângulos, Bandeiras, etc.)
- Projete alvos baseados na altura dos padrões
- Determine direção provável de rompimento

**PASSO 5: ANÁLISE DE INDICADORES TÉCNICOS VISÍVEIS**
- Liste todos indicadores visíveis (MAs, RSI, MACD, etc.)
- Interprete sinais de cada indicador
- Analise comportamento do volume
- Avalie confluência entre indicadores

**PASSO 6: SUGESTÃO DE TRADING E GESTÃO DE RISCO**
- Determine direção da operação (Long/Short)
- Defina ponto ideal de entrada
- Calcule stop loss baseado em S/R ou ATR
- Projete take profit baseado em padrões
- Calcule relação risco-retorno

**PASSO 7: CONSIDERAÇÕES FINAIS**
- Indique nível de confiança da análise
- Mencione contexto de mercado relevante
- Destaque evidências visuais principais

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "simbolo_detectado": "SÍMBOLO EXATO do gráfico",
  "preco_atual": "PREÇO EXATO visível",
  "timeframe_detectado": "TIMEFRAME identificado",
  "analise_tecnica": "Análise completa seguindo os 7 passos",
  "decisao": "compra|venda|esperar",
  "justificativa_decisao": "Justificativa detalhada baseada na confluência",
  "confianca_percentual": 75,
  "indicadores_utilizados": ["Lista de indicadores analisados"],
  "estrutura_mercado": {
    "tendencia_principal": "Alta/Baixa/Lateral",
    "sub_tendencias": ["Tendências menores"],
    "topos_fundos": "Descrição da estrutura"
  },
  "suportes_resistencias": {
    "suportes": [42000, 41500],
    "resistencias": [44000, 44500],
    "forca_niveis": "Avaliação da força"
  }
}

**INSTRUÇÕES CRÍTICAS:**
1. Analise APENAS o que está VISÍVEL no gráfico
2. NÃO invente dados que não consegue ver
3. Base toda análise em evidências visuais concretas
4. Priorize confluência de múltiplos sinais
5. Adapte a análise ao tipo de mercado identificado
6. Forneça justificativas técnicas sólidas
7. Responda APENAS o JSON válido, sem texto adicional
"""

class AIService:
    """Serviço para análise de gráficos usando IA"""
    
    @staticmethod
    def analyze_chart_with_openai(image_base64: str) -> Dict[str, Any]:
        """Analisa um gráfico usando OpenAI Vision API"""
        if not OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY não configurada")
        
        # Remover prefixo data:image/... se presente
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "gpt-4o",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": PROFESSIONAL_TRADING_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 2000,
            "temperature": 0.1
        }
        
        try:
            response = requests.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                print(f"❌ Erro na API OpenAI: {response.status_code}")
                print(response.text)
                raise Exception(f"Erro na API OpenAI: {response.status_code}")
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # Extrair JSON da resposta
            try:
                # Tentar parsear como JSON direto
                analysis_json = json.loads(content)
            except json.JSONDecodeError:
                # Tentar extrair JSON de uma resposta que pode ter texto adicional
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_content = json_match.group()
                    analysis_json = json.loads(json_content)
                else:
                    raise ValueError("Não foi possível extrair JSON válido da resposta")
            
            return analysis_json
            
        except Exception as e:
            print(f"❌ Erro na análise OpenAI: {e}")
            raise
    
    @staticmethod
    def analyze_chart_with_gemini(image_base64: str) -> Dict[str, Any]:
        """Analisa um gráfico usando Google Gemini API"""
        if not GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY não configurada")
        
        # Remover prefixo data:image/... se presente
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [
                    {
                        "text": PROFESSIONAL_TRADING_PROMPT
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1500,
            }
        }
        
        try:
            response = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                print(f"❌ Erro na API Gemini: {response.status_code}")
                print(response.text)
                raise Exception(f"Erro na API Gemini: {response.status_code}")
            
            result = response.json()
            content = result["candidates"][0]["content"]["parts"][0]["text"]
            
            # Extrair JSON da resposta
            try:
                # Tentar parsear como JSON direto
                analysis_json = json.loads(content)
            except json.JSONDecodeError:
                # Tentar extrair JSON de uma resposta que pode ter texto adicional
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_content = json_match.group()
                    analysis_json = json.loads(json_content)
                else:
                    raise ValueError("Não foi possível extrair JSON válido da resposta")
            
            return analysis_json
            
        except Exception as e:
            print(f"❌ Erro na análise Gemini: {e}")
            raise
    
    @staticmethod
    def analyze_chart(image_base64: str) -> Dict[str, Any]:
        """Analisa um gráfico usando o melhor provedor disponível"""
        # Tentar OpenAI primeiro
        if OPENAI_API_KEY:
            try:
                print("🤖 Tentando análise com OpenAI...")
                return AIService.analyze_chart_with_openai(image_base64)
            except Exception as e:
                print(f"⚠️ Falha na análise OpenAI: {e}")
        
        # Tentar Gemini como fallback
        if GEMINI_API_KEY:
            try:
                print("🤖 Tentando análise com Gemini...")
                return AIService.analyze_chart_with_gemini(image_base64)
            except Exception as e:
                print(f"⚠️ Falha na análise Gemini: {e}")
        
        # Se ambos falharem, lançar erro
        raise Exception("Nenhum serviço de IA disponível para análise")


