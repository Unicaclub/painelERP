# 📱 Manual Completo - Notificações Inteligentes com SMS e E-mail

## 🎯 Visão Geral

O módulo **Notificações Inteligentes** permite enviar mensagens automáticas e manuais para clientes, promoters e administradores via **WhatsApp**, **SMS** e **E-mail**. O sistema é totalmente integrado aos eventos e possui templates customizáveis, histórico completo e configurações avançadas por canal.

---

## 🚀 Canais de Notificação Disponíveis

### 📱 WhatsApp
- **Uso**: Notificações instantâneas e interativas
- **Integração**: N8N + API WhatsApp Business
- **Formato**: Mensagens com emojis e formatação
- **Taxa de entrega**: ~95%

### 📧 SMS
- **Uso**: Notificações críticas e confirmações
- **Integração**: Twilio (configurável)
- **Formato**: Texto simples, até 160 caracteres
- **Taxa de entrega**: ~98%

### ✉️ E-mail
- **Uso**: Notificações detalhadas e relatórios
- **Integração**: SMTP (Gmail, Outlook, etc.)
- **Formato**: HTML com formatação rica
- **Taxa de entrega**: ~90%

---

## 📊 Dashboard - Visão Geral por Canal

### Métricas Principais:
- **Enviadas Hoje**: Total por canal nas últimas 24h
- **Taxa de Sucesso**: Percentual de entrega por canal
- **Tempo Médio**: Velocidade de envio por canal
- **Status**: Pendentes, enviadas, falhadas por canal

### Gráficos Disponíveis:
- **Distribuição por Canal**: Pizza mostrando uso de cada canal
- **Evolução Temporal**: Linha mostrando envios ao longo do tempo
- **Taxa de Sucesso**: Comparativo de performance entre canais

---

## 📝 Gestão de Templates por Canal

### Como Criar Templates Específicos:

#### **Template WhatsApp:**
```
Nome: Venda Confirmada - WhatsApp
Canal: WhatsApp
Título: 🎉 Compra Confirmada!

Conteúdo:
Olá {nome}! 

Sua compra foi confirmada:
🎫 {evento_nome}
📅 {data_evento}
💰 R$ {valor}

Para check-in, responda:
*CHECKIN [CPF] [3 DÍGITOS]*

Nos vemos lá! 🚀
```

#### **Template SMS:**
```
Nome: Venda Confirmada - SMS
Canal: SMS

Conteúdo:
Compra confirmada! {evento_nome} em {data_evento}. 
Valor: R$ {valor}. 
Check-in: WhatsApp (11)99999-9999
```

#### **Template E-mail:**
```
Nome: Venda Confirmada - Email
Canal: E-mail
Título: Compra Confirmada - {evento_nome}

Conteúdo:
<h2>🎉 Compra Confirmada!</h2>

<p>Olá <strong>{nome}</strong>,</p>

<p>Sua compra foi confirmada com sucesso:</p>

<table style="border: 1px solid #ddd; padding: 10px;">
  <tr><td><strong>Evento:</strong></td><td>{evento_nome}</td></tr>
  <tr><td><strong>Data:</strong></td><td>{data_evento}</td></tr>
  <tr><td><strong>Local:</strong></td><td>{local_evento}</td></tr>
  <tr><td><strong>Valor:</strong></td><td>R$ {valor}</td></tr>
</table>

<p>Para fazer check-in, utilize nosso WhatsApp ou acesse o link do evento.</p>

<p>Nos vemos lá!</p>
```

### Variáveis por Tipo de Notificação:

#### **Venda Confirmada:**
- `{nome}` - Nome do comprador
- `{evento_nome}` - Nome do evento
- `{data_evento}` - Data e hora do evento
- `{local_evento}` - Local do evento
- `{valor}` - Valor pago
- `{lista_nome}` - Nome da lista

#### **Check-in Realizado:**
- `{nome}` - Nome da pessoa
- `{evento_nome}` - Nome do evento
- `{hora_atual}` - Horário do check-in
- `{data_atual}` - Data atual

#### **Caixa Fechado:**
- `{evento_nome}` - Nome do evento
- `{receita_total}` - Receita total
- `{total_vendas}` - Número de vendas
- `{data_atual}` - Data do fechamento

---

## ⚙️ Configurações Avançadas por Canal

### 📱 Configuração WhatsApp:
1. **N8N Webhook**: URL do workflow N8N
2. **API Key**: Chave de autenticação
3. **Número**: Número do WhatsApp Business
4. **Ativo**: Liga/desliga o canal

### 📧 Configuração SMS (Twilio):
1. **API Key**: Account SID do Twilio
2. **Auth Token**: Token de autenticação
3. **Remetente**: Número ou nome do remetente
4. **Ativo**: Liga/desliga o canal

### ✉️ Configuração E-mail (SMTP):
1. **Servidor SMTP**: Ex: smtp.gmail.com
2. **Porta**: Ex: 587 (TLS) ou 465 (SSL)
3. **Usuário**: E-mail de login
4. **Senha**: Senha do e-mail ou app password
5. **Remetente**: E-mail que aparece como remetente
6. **Ativo**: Liga/desliga o canal

---

## 🔧 Configuração Passo a Passo

### WhatsApp via N8N:

#### 1. Configurar N8N:
```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "notificacoes",
        "httpMethod": "POST"
      }
    },
    {
      "name": "WhatsApp Business",
      "type": "n8n-nodes-base.whatsappBusiness",
      "parameters": {
        "operation": "sendMessage",
        "chatId": "={{$json.destinatario}}",
        "message": "={{$json.conteudo}}"
      }
    }
  ]
}
```

#### 2. No Sistema:
- Configurações → N8N Webhook URL
- Ativar WhatsApp
- Testar envio

### SMS via Twilio:

#### 1. Conta Twilio:
- Criar conta em twilio.com
- Obter Account SID e Auth Token
- Configurar número de telefone

#### 2. No Sistema:
- Configurações → SMS
- Inserir credenciais Twilio
- Ativar SMS
- Testar envio

### E-mail via SMTP:

#### 1. Gmail (exemplo):
- Ativar autenticação de 2 fatores
- Gerar senha de app
- Usar smtp.gmail.com:587

#### 2. No Sistema:
- Configurações → E-mail
- Inserir dados SMTP
- Ativar E-mail
- Testar envio

---

## 📤 Envio Manual por Canal

### Como Enviar:
1. **Botão "Envio Manual"**
2. **Selecionar Canal**: WhatsApp, SMS ou E-mail
3. **Destinatário**: 
   - WhatsApp: +5511999999999
   - SMS: +5511999999999
   - E-mail: usuario@exemplo.com
4. **Conteúdo**: Personalizar mensagem
5. **Enviar** ou **Agendar**

### Dicas por Canal:

#### **WhatsApp:**
- Use emojis e formatação (*negrito*, _itálico_)
- Máximo 4096 caracteres
- Suporte a quebras de linha

#### **SMS:**
- Máximo 160 caracteres (1 SMS)
- Texto simples, sem formatação
- Evite caracteres especiais

#### **E-mail:**
- Suporte a HTML
- Sem limite de caracteres
- Inclua assunto atrativo

---

## 📋 Histórico Avançado com Filtros por Canal

### Filtros Disponíveis:
- **Canal**: WhatsApp, SMS, E-mail
- **Status**: Enviada, Pendente, Falhada
- **Período**: Data início/fim
- **Evento**: Filtrar por evento específico
- **Destinatário**: Buscar por telefone/e-mail

### Informações Detalhadas:
- **Tempo de Envio**: Diferença entre criação e envio
- **Tentativas**: Número de tentativas de reenvio
- **Resposta da API**: Log técnico do provedor
- **Erro**: Detalhes de falhas (se houver)

---

## 📊 Relatórios e Exportação

### Dados Exportados:
- **Excel**: Planilha formatada com gráficos
- **CSV**: Dados brutos para análise
- **Filtros**: Aplicados automaticamente

### Métricas Incluídas:
- **Por Canal**: Distribuição de uso
- **Por Status**: Taxa de sucesso/falha
- **Por Período**: Evolução temporal
- **Por Evento**: Performance por evento

---

## 🔔 Notificações Automáticas por Canal

### Estratégia Multi-Canal:

#### **Venda Confirmada:**
1. **WhatsApp**: Confirmação imediata com detalhes
2. **SMS**: Backup se WhatsApp falhar
3. **E-mail**: Comprovante detalhado

#### **Check-in Realizado:**
1. **WhatsApp**: Boas-vindas interativas
2. **SMS**: Confirmação simples

#### **Caixa Fechado:**
1. **E-mail**: Relatório completo para admins
2. **WhatsApp**: Resumo para promoters

#### **Conquista Desbloqueada:**
1. **WhatsApp**: Parabenização com emoji
2. **E-mail**: Certificado digital

---

## 🧪 Testes de Canal

### Como Testar:
1. **Dashboard** → **Configurações**
2. **Testar Canal** → Selecionar canal
3. **Inserir destinatário** de teste
4. **Enviar** mensagem de teste
5. **Verificar** resultado e logs

### Mensagem de Teste Padrão:
```
🧪 Teste de Notificação

Esta é uma mensagem de teste do canal [CANAL]. 
Sistema funcionando corretamente!

Data: [DATA_ATUAL]
Horário: [HORA_ATUAL]
```

---

## 📈 Monitoramento e Alertas

### Métricas de Performance:
- **Taxa de Entrega**: % de mensagens entregues
- **Tempo Médio**: Velocidade de envio
- **Falhas**: Erros por canal
- **Custo**: Estimativa de gastos (SMS/E-mail)

### Alertas Automáticos:
- **Taxa baixa**: < 80% de entrega
- **Muitas falhas**: > 10% de erro
- **Canal inativo**: Sem envios em 24h
- **Configuração**: Credenciais expiradas

---

## 🔒 Segurança e Compliance

### Proteção de Dados:
- **Criptografia**: Credenciais criptografadas
- **Logs**: Não expõem dados sensíveis
- **LGPD**: Consentimento para envios
- **Opt-out**: Opção de descadastro

### Controle de Spam:
- **Rate Limiting**: Máximo de envios por hora
- **Blacklist**: Lista de números/e-mails bloqueados
- **Horários**: Respeitar horários comerciais
- **Frequência**: Evitar envios excessivos

---

## 🚨 Solução de Problemas por Canal

### WhatsApp:
- **Erro 401**: Verificar webhook N8N
- **Não entrega**: Número inválido ou bloqueado
- **Formatação**: Verificar caracteres especiais

### SMS:
- **Erro Twilio**: Verificar credenciais
- **Não entrega**: Número inválido ou DDD
- **Custo alto**: Monitorar uso

### E-mail:
- **SMTP Error**: Verificar servidor/porta
- **Spam**: Verificar reputação do domínio
- **Não entrega**: E-mail inválido ou cheio

---

## 💡 Boas Práticas por Canal

### WhatsApp:
- ✅ Use emojis moderadamente
- ✅ Mantenha mensagens conversacionais
- ✅ Inclua call-to-action claro
- ❌ Evite spam ou mensagens muito longas

### SMS:
- ✅ Seja conciso e direto
- ✅ Inclua identificação da empresa
- ✅ Use para informações críticas
- ❌ Evite links longos ou formatação

### E-mail:
- ✅ Use assunto atrativo
- ✅ Inclua imagens e formatação
- ✅ Adicione assinatura profissional
- ❌ Evite palavras que ativam spam

---

## 📞 Suporte Técnico

### Contatos por Canal:
- **WhatsApp**: Suporte via chat
- **SMS**: E-mail técnico
- **E-mail**: Telefone de emergência

### Documentação:
- **API**: Swagger UI completo
- **Integrações**: Guias específicos
- **Troubleshooting**: Base de conhecimento

---

**Versão:** 2.0 - SMS e E-mail  
**Última Atualização:** Janeiro 2024  
**Sistema:** Gestão de Eventos - Notificações Multi-Canal
