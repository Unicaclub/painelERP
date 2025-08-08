#!/bin/bash

echo "🚀 Iniciando conferência final do Sistema de Eventos CPF Supreme..."
sleep 1

echo "🔐 Etapa 1: Autenticação por CPF e JWT..."
pytest tests/security/test_jwt_cpf.py

echo "🎫 Etapa 2: Check-in + PDV + Cartão/CPF..."
python3 scripts/test_checkin_pdv.py

echo "🧾 Etapa 3: Listas de Promoters + Convidados..."
python3 scripts/test_promoters_listas.py

echo "📲 Etapa 4: Envio de notificações (WhatsApp + E-mail + SMS)..."
python3 scripts/test_notificacoes.py

echo "📊 Etapa 5: Abertura do Painel IA no navegador..."
xdg-open http://localhost:3000/dashboard || start http://localhost:3000/dashboard

echo "✅ FIM: Conferência finalizada com sucesso. Pronto para Deploy Supremo."
