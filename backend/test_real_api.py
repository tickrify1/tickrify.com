#!/usr/bin/env python3
"""
Teste da API real do Tickrify - verificar se a OpenAI está funcionando
"""

import requests
import base64
import json
from PIL import Image, ImageDraw, ImageFont
import io

def create_test_chart():
    """Cria um gráfico de teste simples com texto visível"""
    # Criar uma imagem simples que simula um gráfico
    img = Image.new('RGB', (800, 600), color='white')
    draw = ImageDraw.Draw(img)
    
    # Título do gráfico
    draw.text((50, 30), "BTCUSDT - 4H", fill='black', font_size=24)
    draw.text((50, 60), "Price: $67,234.50", fill='green', font_size=18)
    
    # Simular algumas barras/candles
    for i in range(10):
        x = 100 + i * 60
        # Simular um candle verde (alta)
        draw.rectangle([x, 200, x+30, 400], outline='green', fill='lightgreen')
        draw.rectangle([x+10, 150, x+20, 450], outline='green', fill='green')
    
    # Adicionar algumas linhas de tendência
    draw.line([(100, 300), (700, 250)], fill='blue', width=2)
    draw.text((400, 220), "Trend Line", fill='blue')
    
    # Adicionar indicadores
    draw.text((50, 500), "RSI: 72 (Overbought)", fill='red')
    draw.text((50, 520), "MACD: Bullish Signal", fill='green')
    
    # Converter para base64
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_base64 = base64.b64encode(img_buffer.getvalue()).decode('utf-8')
    
    return img_base64

def test_api():
    """Testa a API de análise de gráficos"""
    
    print("🧪 Criando gráfico de teste...")
    chart_image = create_test_chart()
    
    # Dados da requisição
    payload = {
        "image_base64": chart_image,
        "user_id": "test_user_001"
    }
    
    print("🚀 Enviando requisição para API...")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/analyze-chart",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCESSO! Análise recebida:")
            print(f"   Ação: {result['acao']}")
            print(f"   Justificativa: {result['justificativa']}")
            
            # Verificar se o símbolo foi detectado
            if "BTCUSDT" in result['justificativa'] or "BTC" in result['justificativa']:
                print("✅ SÍMBOLO DETECTADO: API conseguiu identificar BTCUSDT!")
            else:
                print("⚠️  Símbolo não detectado na justificativa")
                
        else:
            print(f"❌ Erro na API: {response.status_code}")
            print(f"   Resposta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    test_api()
