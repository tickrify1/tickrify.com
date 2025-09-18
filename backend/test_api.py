#!/usr/bin/env python3

import requests
import base64
import json

# Teste básico da API
def test_api():
    print("🧪 Testando API Tickrify...")
    
    # Criar uma imagem fake em base64 para teste
    fake_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    
    payload = {
        "image_base64": fake_image,
        "user_id": "test_user_123"
    }
    
    try:
        response = requests.post("http://localhost:8000/api/analyze-chart", json=payload)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ API funcionando!")
            print(f"📊 Resultado: {result}")
            print(f"🎯 Ação: {result.get('acao')}")
            print(f"💭 Justificativa: {result.get('justificativa')}")
        else:
            print(f"❌ Erro HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")

if __name__ == "__main__":
    test_api()
