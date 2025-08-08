# 🔧 Guia de Configuração de APIs Externas

## Sistema de Eventos UnicaClub - Configuração de Produção

Este guia detalha como configurar todas as APIs externas necessárias para o funcionamento completo do sistema de notificações inteligentes.

---

## 📱 WhatsApp Business API

### Opção 1: Z-API (Recomendado para início)

1. **Criar conta na Z-API**
   - Acesse: https://z-api.io
   - Crie sua conta gratuita
   - Conecte seu WhatsApp Business

2. **Obter credenciais**
   ```bash
   # No painel Z-API, copie:
   WHATSAPP_API_URL=https://api.z-api.io
   WHATSAPP_INSTANCE_ID=sua_instance_id
   WHATSAPP_TOKEN=seu_token_zapi
   WHATSAPP_SENDER=+5511999999999
   ```

3. **Configurar webhook (opcional)**
   - URL do webhook: `https://seu-dominio.com/api/whatsapp/webhook`
   - Eventos: message, ack, status

### Opção 2: 360Dialog (Para alto volume)

1. **Criar conta na 360Dialog**
   - Acesse: https://www.360dialog.com
   - Solicite acesso à API
   - Aguarde aprovação do WhatsApp

2. **Configurar no .env.production**
   ```bash
   WHATSAPP_API_URL=https://waba.360dialog.io
   WHATSAPP_TOKEN=seu_token_360dialog
   WHATSAPP_SENDER=+5511999999999
   ```

---

## 📧 Email SMTP

### Opção 1: Gmail (Simples para começar)

1. **Configurar App Password**
   - Acesse: https://myaccount.google.com/security
   - Ative "Verificação em 2 etapas"
   - Gere uma "Senha de app" para "Email"

2. **Configurar no .env.production**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=sistema@unicaclub.com
   SMTP_PASSWORD=sua_senha_de_app_gmail
   SMTP_FROM_EMAIL=sistema@unicaclub.com
   SMTP_FROM_NAME=Sistema de Eventos UnicaClub
   ```

### Opção 2: SendGrid (Para alto volume)

1. **Criar conta na SendGrid**
   - Acesse: https://sendgrid.com
   - Crie conta gratuita (100 emails/dia)
   - Verifique seu domínio

2. **Gerar API Key**
   - Settings > API Keys > Create API Key
   - Permissões: Full Access

3. **Configurar no .env.production**
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=sua_api_key_sendgrid
   SMTP_FROM_EMAIL=sistema@unicaclub.com
   SMTP_FROM_NAME=Sistema de Eventos UnicaClub
   ```

---

## 📱 SMS

### Opção 1: Twilio (Recomendado)

1. **Criar conta na Twilio**
   - Acesse: https://www.twilio.com/console
   - Crie conta gratuita ($15 de crédito)
   - Verifique seu telefone

2. **Obter credenciais**
   - Account SID e Auth Token no Dashboard
   - Compre um número brasileiro

3. **Configurar no .env.production**
   ```bash
   TWILIO_ACCOUNT_SID=seu_account_sid
   TWILIO_AUTH_TOKEN=seu_auth_token
   TWILIO_PHONE_NUMBER=+5511999999999
   ```

### Opção 2: TotalVoice (Nacional)

1. **Criar conta na TotalVoice**
   - Acesse: https://totalvoice.com.br
   - Crie conta e adicione créditos
   - Gere Access Token

2. **Configurar no .env.production**
   ```bash
   TOTALVOICE_ACCESS_TOKEN=seu_access_token
   TOTALVOICE_PHONE_NUMBER=+5511999999999
   ```

---

## 🤖 N8N Integration (Opcional)

### Configurar N8N para Automações

1. **Instalar N8N**
   ```bash
   # Via Docker
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```

2. **Criar Webhook**
   - Acesse: http://localhost:5678
   - Crie workflow com Webhook trigger
   - URL: `https://seu-n8n.com/webhook/eventos`

3. **Configurar no .env.production**
   ```bash
   N8N_WEBHOOK_URL=https://seu-n8n.com/webhook/eventos
   N8N_API_KEY=sua_api_key_n8n
   ```

---

## 🆔 API de Validação de CPF

### Opção 1: ReceitaWS (Gratuita)

```bash
# Gratuita com limitações
CPF_API_URL=https://www.receitaws.com.br/v1/cnpj
# Não precisa de API Key
```

### Opção 2: Serpro (Paga, Confiável)

1. **Criar conta no Serpro**
   - Acesse: https://www.serpro.gov.br
   - Solicite acesso à API de CPF
   - Aguarde aprovação

2. **Configurar no .env.production**
   ```bash
   CPF_API_URL=https://gateway.apiserpro.serpro.gov.br/consulta-cpf/v1/cpf
   CPF_API_KEY=sua_api_key_serpro
   ```

---

## 🔒 SSL/HTTPS com Let's Encrypt

### Configurar certificado SSL gratuito

1. **Instalar Certbot**
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Gerar certificado**
   ```bash
   sudo certbot --nginx -d painel.unicaclub.com -d www.painel.unicaclub.com
   ```

3. **Renovação automática**
   ```bash
   sudo crontab -e
   # Adicionar linha:
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

---

## 🧪 Testes de Configuração

### Script de teste das APIs

```bash
# Testar WhatsApp
curl -X POST "https://api.z-api.io/instances/SUA_INSTANCE/token/SEU_TOKEN/send-text" \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Teste do sistema"}'

# Testar SMS Twilio
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/SEU_SID/Messages.json" \
  --data-urlencode "From=+5511999999999" \
  --data-urlencode "Body=Teste SMS" \
  --data-urlencode "To=+5511888888888" \
  -u SEU_SID:SEU_TOKEN

# Testar Email
curl -X POST "https://api.sendgrid.v3.mail.send" \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"teste@unicaclub.com"}]}],"from":{"email":"sistema@unicaclub.com"},"subject":"Teste","content":[{"type":"text/plain","value":"Teste de email"}]}'
```

---

## 📊 Monitoramento

### Configurar Sentry (Opcional)

1. **Criar conta no Sentry**
   - Acesse: https://sentry.io
   - Crie projeto Python/FastAPI

2. **Configurar no .env.production**
   ```bash
   SENTRY_DSN=sua_dsn_sentry
   ```

---

## ⚠️ Checklist de Segurança

- [ ] Todas as senhas são fortes e únicas
- [ ] API Keys estão no .env.production (não no código)
- [ ] HTTPS está configurado e funcionando
- [ ] Rate limiting está ativo no nginx
- [ ] Backup automático está configurado
- [ ] Logs estão sendo coletados
- [ ] Monitoramento está ativo

---

## 🆘 Troubleshooting

### Problemas Comuns

1. **WhatsApp não envia mensagens**
   - Verifique se o número está verificado
   - Confirme se a instância está conectada
   - Teste com curl primeiro

2. **Email não envia**
   - Verifique senha de app do Gmail
   - Confirme configurações SMTP
   - Verifique logs do container

3. **SMS falha**
   - Confirme créditos na conta Twilio
   - Verifique formato do número (+55...)
   - Teste com API diretamente

4. **SSL não funciona**
   - Confirme DNS apontando para servidor
   - Verifique portas 80/443 abertas
   - Reinicie nginx após certificado

---

## 📞 Suporte

Para dúvidas sobre configuração:
- 📧 Email: suporte@unicaclub.com
- 📱 WhatsApp: +55 11 99999-9999
- 🌐 Documentação: https://docs.unicaclub.com

---

**Última atualização:** Agosto 2025
**Versão:** 1.0.0
