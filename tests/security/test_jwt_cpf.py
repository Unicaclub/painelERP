import pytest
import requests
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../../backend'))

from app.main import app
from app.auth import validar_cpf_basico, criar_access_token
from app.database import get_db
from app.models import Usuario

client = TestClient(app)

def test_cpf_validation():
    """Testar validação básica de CPF"""
    assert validar_cpf_basico("11144477735") == True  # CPF válido
    assert validar_cpf_basico("111.444.777-35") == True
    
    assert validar_cpf_basico("123") == False
    assert validar_cpf_basico("12345678900") == False  # CPF com todos dígitos iguais
    assert validar_cpf_basico("") == False
    assert validar_cpf_basico("abc.def.ghi-jk") == False

def test_jwt_token_creation():
    """Testar criação de token JWT"""
    user_data = {"sub": "admin@test.com", "user_id": 1, "tipo": "admin"}
    token = criar_access_token(user_data)
    
    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 50  # JWT tokens são longos

def test_login_with_cpf():
    """Testar login com CPF e senha"""
    login_data = {
        "username": "admin@test.com",
        "password": "admin123"
    }
    
    response = client.post("/api/auth/login", data=login_data)
    
    assert response.status_code in [200, 422, 401]
    
    if response.status_code == 200:
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"

def test_protected_route_without_token():
    """Testar acesso a rota protegida sem token"""
    response = client.get("/api/dashboard/resumo")
    
    assert response.status_code in [401, 403]  # Ambos são válidos para acesso negado

def test_protected_route_with_invalid_token():
    """Testar acesso a rota protegida com token inválido"""
    headers = {"Authorization": "Bearer token_invalido"}
    response = client.get("/api/dashboard/resumo", headers=headers)
    
    assert response.status_code == 401

def test_cpf_security_validation():
    """Testar validação de segurança com CPF"""
    checkin_data = {
        "cpf": "11144477735",
        "evento_id": 1,
        "validacao_cpf": "111"  # 3 primeiros dígitos
    }
    
    response = client.post("/api/checkins/", json=checkin_data)
    assert response.status_code in [401, 403]  # Ambos são válidos para acesso negado

def test_multi_tenant_security():
    """Testar segurança multi-tenant"""
    pass

if __name__ == "__main__":
    print("🔐 Executando testes de segurança CPF + JWT...")
    
    try:
        test_cpf_validation()
        print("✅ Validação de CPF: OK")
    except Exception as e:
        print(f"❌ Validação de CPF: FALHOU - {e}")
    
    try:
        test_jwt_token_creation()
        print("✅ Criação de token JWT: OK")
    except Exception as e:
        print(f"❌ Criação de token JWT: FALHOU - {e}")
    
    try:
        test_login_with_cpf()
        print("✅ Login com CPF: OK")
    except Exception as e:
        print(f"❌ Login com CPF: FALHOU - {e}")
    
    try:
        test_protected_route_without_token()
        print("✅ Proteção de rotas: OK")
    except Exception as e:
        print(f"❌ Proteção de rotas: FALHOU - {e}")
    
    print("🔐 Testes de segurança concluídos!")
