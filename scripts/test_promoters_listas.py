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

def test_promoters_functionality(token):
    """Testar funcionalidades de promoters"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("👑 Testando Promoters...")
    
    try:
        response = requests.get(f"{BASE_URL}/usuarios/promoters", headers=headers)
        if response.status_code == 200:
            promoters = response.json()
            print(f"✅ Promoters - Lista carregada: {len(promoters)} promoters")
        else:
            print(f"❌ Promoters - Falha ao carregar: {response.status_code}")
    except Exception as e:
        print(f"❌ Promoters - Erro: {e}")
    
    try:
        response = requests.get(f"{BASE_URL}/dashboard/ranking-promoters", headers=headers)
        if response.status_code == 200:
            ranking = response.json()
            print(f"✅ Promoters - Ranking carregado: {len(ranking)} posições")
        else:
            print(f"❌ Promoters - Falha no ranking: {response.status_code}")
    except Exception as e:
        print(f"❌ Promoters - Erro no ranking: {e}")

def test_listas_functionality(token):
    """Testar funcionalidades de listas"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("📋 Testando Listas VIP...")
    
    try:
        response = requests.get(f"{BASE_URL}/listas/evento/1", headers=headers)
        if response.status_code == 200:
            listas = response.json()
            print(f"✅ Listas - Carregadas: {len(listas)} listas")
            
            tipos = set(lista.get('tipo', 'unknown') for lista in listas)
            print(f"✅ Listas - Tipos disponíveis: {', '.join(tipos)}")
        else:
            print(f"❌ Listas - Falha ao carregar: {response.status_code}")
    except Exception as e:
        print(f"❌ Listas - Erro: {e}")
    
    try:
        lista_data = {
            "nome": "Lista Teste VIP",
            "tipo": "vip",
            "preco": 100.0,
            "evento_id": 1,
            "limite_vendas": 50,
            "descricao": "Lista VIP para teste"
        }
        
        response = requests.post(f"{BASE_URL}/listas/", json=lista_data, headers=headers)
        if response.status_code == 201:
            lista = response.json()
            print(f"✅ Listas - Lista criada: {lista.get('nome')}")
            return lista["id"]
        else:
            print(f"❌ Listas - Falha ao criar: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Listas - Erro ao criar: {e}")
        return None

def test_dashboard_listas(token):
    """Testar dashboard de listas"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("📊 Testando Dashboard de Listas...")
    
    try:
        response = requests.get(f"{BASE_URL}/listas/dashboard/1", headers=headers)
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✅ Dashboard Listas - Dados carregados: {dashboard}")
        else:
            print(f"❌ Dashboard Listas - Falha: {response.status_code}")
    except Exception as e:
        print(f"❌ Dashboard Listas - Erro: {e}")

def test_gamificacao_functionality(token):
    """Testar funcionalidades de gamificação"""
    headers = {"Authorization": f"Bearer {token}"}
    
    print("🏆 Testando Gamificação...")
    
    try:
        response = requests.get(f"{BASE_URL}/gamificacao/ranking", headers=headers)
        if response.status_code == 200:
            ranking = response.json()
            print(f"✅ Gamificação - Ranking: {len(ranking)} promoters")
        else:
            print(f"❌ Gamificação - Falha no ranking: {response.status_code}")
    except Exception as e:
        print(f"❌ Gamificação - Erro: {e}")
    
    try:
        response = requests.get(f"{BASE_URL}/gamificacao/dashboard", headers=headers)
        if response.status_code == 200:
            dashboard = response.json()
            print(f"✅ Gamificação - Dashboard carregado")
        else:
            print(f"❌ Gamificação - Falha no dashboard: {response.status_code}")
    except Exception as e:
        print(f"❌ Gamificação - Erro no dashboard: {e}")

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
    print("🧾 Iniciando testes de Promoters e Listas VIP...")
    
    if not test_server_connection():
        print("❌ Não é possível conectar ao servidor. Certifique-se de que o backend está rodando.")
        return
    
    token = get_auth_token()
    if not token:
        print("❌ Não foi possível obter token de autenticação.")
        return
    
    print("✅ Autenticação: OK")
    
    test_promoters_functionality(token)
    test_listas_functionality(token)
    test_dashboard_listas(token)
    test_gamificacao_functionality(token)
    
    print("🧾 Testes de Promoters e Listas concluídos!")

if __name__ == "__main__":
    main()
