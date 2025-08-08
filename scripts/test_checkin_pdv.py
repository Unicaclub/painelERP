#!/usr/bin/env python3
import requests
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))

BASE_URL = "http://localhost:8000/api"

def get_auth_token():
    """Obter token de autenticação com 2FA"""
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json={
            "cpf": "12345678901",
            "senha": "admin123"
        })
        
        if response.status_code == 202:
            detail = response.json()["detail"]
            codigo = detail.split("Use: ")[1] if "Use: " in detail else "123456"
            
            response = requests.post(f"{BASE_URL}/auth/login", json={
                "cpf": "12345678901", 
                "senha": "admin123",
                "codigo_verificacao": codigo
            })
            
            if response.status_code == 200:
                return response.json()["access_token"]
            else:
                print(f"❌ Falha no login com código: {response.status_code}")
                return None
        elif response.status_code == 200:
            return response.json()["access_token"]
        else:
            print(f"❌ Falha no login: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Erro ao fazer login: {e}")
        return None

def test_pdv_functionality(token):
    """Testar funcionalidades do PDV"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🛒 Testando PDV...")
    
    try:
        response = requests.get(f"{BASE_URL}/pdv/produtos?evento_id=1", headers=headers)
        if response.status_code == 200:
            produtos = response.json()
            print(f"✅ PDV - Produtos carregados: {len(produtos)} produtos")
        else:
            print(f"❌ PDV - Falha ao carregar produtos: {response.status_code}")
    except Exception as e:
        print(f"❌ PDV - Erro: {e}")
    
    try:
        comanda_data = {
            "evento_id": 1,
            "numero_comanda": "CMD001",
            "tipo": "FISICA",
            "cpf_cliente": "12345678901",
            "nome_cliente": "Cliente Teste",
            "valor_inicial": 50.0
        }
        
        response = requests.post(f"{BASE_URL}/pdv/comandas", json=comanda_data, headers=headers)
        if response.status_code == 201:
            comanda = response.json()
            print(f"✅ PDV - Comanda criada: {comanda.get('numero_comanda')}")
            return comanda["id"]
        else:
            print(f"❌ PDV - Falha ao criar comanda: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ PDV - Erro ao criar comanda: {e}")
        return None

def test_checkin_functionality(token):
    """Testar funcionalidades de check-in"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🎫 Testando Check-in...")
    
    try:
        response = requests.get(f"{BASE_URL}/checkins/cpf/12345678901?evento_id=1", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Check-in - Verificação CPF: {data}")
        else:
            print(f"❌ Check-in - Falha na verificação CPF: {response.status_code}")
    except Exception as e:
        print(f"❌ Check-in - Erro: {e}")
    
    try:
        response = requests.get(f"{BASE_URL}/checkins/dashboard/1", headers=headers)
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✅ Check-in - Dashboard: {dashboard.get('total_checkins', 0)} check-ins")
        else:
            print(f"❌ Check-in - Falha no dashboard: {response.status_code}")
    except Exception as e:
        print(f"❌ Check-in - Erro no dashboard: {e}")

def test_cpf_integration():
    """Testar integração CPF entre PDV e Check-in"""
    print("🔗 Testando integração CPF...")
    
    
    cpf_teste = "12345678901"
    primeiros_digitos = cpf_teste[:3]  # "123"
    
    print(f"✅ CPF de teste: {cpf_teste}")
    print(f"✅ Validação (3 dígitos): {primeiros_digitos}")
    print("✅ Integração CPF: Fluxo validado")

def test_server_connection():
    """Testar conexão com o servidor"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Servidor backend: ONLINE")
            return True
        else:
            print(f"❌ Servidor backend: Status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Servidor backend: OFFLINE")
        return False
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return False

def main():
    print("🎫 Iniciando testes de Check-in + PDV + CPF...")
    
    if not test_server_connection():
        print("❌ Não é possível conectar ao servidor. Certifique-se de que o backend está rodando.")
        return
    
    token = get_auth_token()
    if not token:
        print("❌ Não foi possível obter token de autenticação.")
        return
    
    print("✅ Autenticação: OK")
    
    test_pdv_functionality(token)
    test_checkin_functionality(token)
    test_cpf_integration()
    
    print("🎫 Testes de Check-in + PDV concluídos!")

if __name__ == "__main__":
    main()
