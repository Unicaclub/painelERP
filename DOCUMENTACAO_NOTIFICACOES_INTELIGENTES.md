# 📱 Documentação Técnica - Módulo Notificações Inteligentes

## 📋 Resumo do Módulo

O módulo **Notificações Inteligentes** é um sistema completo de comunicação automática integrado ao sistema de gestão de eventos. Permite envio de notificações via múltiplos canais (WhatsApp, SMS, E-mail) com templates customizáveis, triggers automáticos e histórico auditável.

### Principais Funcionalidades

- **Templates Customizáveis**: Criação e edição de templates com variáveis dinâmicas
- **Triggers Automáticos**: Notificações disparadas automaticamente em eventos do sistema
- **Múltiplos Canais**: WhatsApp, SMS, E-mail e Push Notifications
- **Histórico Auditável**: Registro completo de todas as notificações enviadas
- **Dashboard Visual**: Métricas em tempo real e estatísticas de envio
- **Envio Manual**: Possibilidade de envio manual de notificações (admin only)
- **Integração N8N**: Webhooks para automações avançadas
- **Exportação**: Relatórios em Excel e CSV

## 🗄️ Modelos de Dados

### TemplateNotificacao

Armazena templates de mensagens customizáveis por tipo e canal.

```python
class TemplateNotificacao(Base):
    __tablename__ = "templates_notificacoes"
    
    id: int                           # ID único do template
    nome: str                         # Nome identificador do template
    tipo_notificacao: TipoNotificacao # Tipo de evento que dispara
    canal: CanalNotificacao           # Canal de envio (WhatsApp, SMS, etc)
    titulo: str                       # Título da notificação (opcional)
    conteudo: str                     # Conteúdo da mensagem com variáveis
    variaveis_disponiveis: str        # Lista de variáveis disponíveis
    ativo: bool                       # Se o template está ativo
    empresa_id: int                   # ID da empresa proprietária
    criado_por_id: int               # ID do usuário que criou
    criado_em: datetime              # Data de criação
    atualizado_em: datetime          # Data da última atualização
```

**Campos Principais:**
- `tipo_notificacao`: Enum com tipos como `VENDA_CONFIRMADA`, `CHECKIN_REALIZADO`, `CAIXA_FECHADO`
- `canal`: Enum com canais `WHATSAPP`, `SMS`, `EMAIL`, `PUSH`
- `conteudo`: Texto com variáveis no formato `{nome}`, `{evento_nome}`, etc.

### NotificacaoEnviada

Registra todas as notificações enviadas para auditoria e controle.

```python
class NotificacaoEnviada(Base):
    __tablename__ = "notificacoes_enviadas"
    
    id: int                          # ID único da notificação
    template_id: int                 # ID do template usado (opcional)
    tipo_notificacao: TipoNotificacao # Tipo da notificação
    canal: CanalNotificacao          # Canal utilizado
    destinatario: str                # Telefone, email ou identificador
    titulo: str                      # Título enviado
    conteudo: str                    # Conteúdo final enviado
    evento_id: int                   # ID do evento relacionado (opcional)
    usuario_id: int                  # ID do usuário relacionado (opcional)
    status: StatusNotificacao        # Status: PENDENTE, ENVIADA, FALHADA, CANCELADA
    tentativas: int                  # Número de tentativas de envio
    max_tentativas: int              # Máximo de tentativas permitidas
    dados_contexto: str              # JSON com dados do evento
    resposta_api: str                # Resposta da API externa
    erro_detalhes: str               # Detalhes de erro (se houver)
    agendada_para: datetime          # Data/hora agendada (opcional)
    enviada_em: datetime             # Data/hora do envio
    criada_em: datetime              # Data de criação
```

**Campos de Controle:**
- `status`: Controla o estado da notificação
- `tentativas`: Sistema de retry automático
- `dados_contexto`: Preserva contexto para auditoria
- `resposta_api`: Log da resposta do serviço externo

### ConfiguracaoNotificacao

Configurações por empresa para integração com serviços externos.

```python
class ConfiguracaoNotificacao(Base):
    __tablename__ = "configuracoes_notificacoes"
    
    id: int                    # ID único
    empresa_id: int            # ID da empresa
    
    # Configurações N8N
    n8n_webhook_url: str       # URL do webhook N8N
    n8n_api_key: str          # Chave da API N8N
    
    # Configurações WhatsApp
    whatsapp_ativo: bool       # Se WhatsApp está ativo
    whatsapp_numero: str       # Número do WhatsApp
    
    # Configurações SMS
    sms_ativo: bool           # Se SMS está ativo
    sms_api_key: str          # Chave da API SMS (Twilio, etc)
    sms_remetente: str        # Nome do remetente
    
    # Configurações E-mail
    email_ativo: bool         # Se e-mail está ativo
    email_smtp_host: str      # Servidor SMTP
    email_smtp_port: int      # Porta SMTP
    email_usuario: str        # Usuário SMTP
    email_senha: str          # Senha SMTP
    email_remetente: str      # E-mail remetente
```

## 🔗 Endpoints REST

### Templates de Notificação (Admin Only)

#### `GET /api/notificacoes/templates`
Lista templates de notificação com filtros opcionais.

**Parâmetros:**
- `tipo_notificacao` (opcional): Filtrar por tipo
- `canal` (opcional): Filtrar por canal
- `ativo` (opcional): Filtrar por status ativo

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Venda Confirmada - WhatsApp",
    "tipo_notificacao": "venda_confirmada",
    "canal": "whatsapp",
    "titulo": "🎉 Compra Confirmada!",
    "conteudo": "Olá {nome}! Sua compra foi confirmada...",
    "ativo": true,
    "criado_em": "2024-01-15T10:30:00Z"
  }
]
```

#### `POST /api/notificacoes/templates`
Cria novo template de notificação.

**Payload:**
```json
{
  "nome": "Novo Template",
  "tipo_notificacao": "venda_confirmada",
  "canal": "whatsapp",
  "titulo": "Título da Notificação",
  "conteudo": "Olá {nome}, sua compra do evento {evento_nome} foi confirmada!"
}
```

#### `PUT /api/notificacoes/templates/{template_id}`
Atualiza template existente.

#### `DELETE /api/notificacoes/templates/{template_id}`
Desativa template (soft delete).

### Histórico de Notificações

#### `GET /api/notificacoes/historico`
Obtém histórico de notificações com filtros avançados.

**Parâmetros:**
- `tipo_notificacao`: Filtrar por tipo
- `canal`: Filtrar por canal
- `status`: Filtrar por status
- `evento_id`: Filtrar por evento
- `data_inicio`: Data inicial
- `data_fim`: Data final
- `destinatario`: Buscar por destinatário
- `limit`: Limite de resultados (padrão: 50)
- `offset`: Offset para paginação

**Resposta:**
```json
[
  {
    "id": 123,
    "tipo_notificacao": "venda_confirmada",
    "canal": "whatsapp",
    "destinatario": "+5511999999999",
    "titulo": "🎉 Compra Confirmada!",
    "conteudo": "Olá João! Sua compra foi confirmada...",
    "status": "enviada",
    "tentativas": 1,
    "evento_nome": "Festa de Ano Novo",
    "enviada_em": "2024-01-15T10:35:00Z",
    "criada_em": "2024-01-15T10:30:00Z"
  }
]
```

### Dashboard

#### `GET /api/notificacoes/dashboard`
Dashboard com métricas em tempo real.

**Resposta:**
```json
{
  "total_enviadas_hoje": 45,
  "total_pendentes": 3,
  "total_falhadas": 2,
  "taxa_sucesso": 95.6,
  "notificacoes_recentes": [...],
  "tipos_mais_enviados": [
    {"tipo": "venda_confirmada", "total": 25},
    {"tipo": "checkin_realizado", "total": 15}
  ],
  "canais_estatisticas": [
    {
      "canal": "whatsapp",
      "total": 40,
      "enviadas": 38,
      "taxa_sucesso": 95.0
    }
  ]
}
```

### Envio Manual (Admin Only)

#### `POST /api/notificacoes/enviar-manual`
Envia notificação manual.

**Payload:**
```json
{
  "template_id": 1,
  "tipo_notificacao": "venda_confirmada",
  "canal": "whatsapp",
  "destinatario": "+5511999999999",
  "titulo": "Título personalizado",
  "conteudo": "Mensagem personalizada",
  "evento_id": 5,
  "agendar_para": "2024-01-20T15:00:00Z"
}
```

### Exportação

#### `GET /api/notificacoes/export/{formato}`
Exporta histórico em Excel ou CSV.

**Parâmetros:**
- `formato`: "excel" ou "csv"
- Mesmos filtros do histórico

### Configurações (Admin Only)

#### `GET /api/notificacoes/configuracoes`
Obtém configurações da empresa.

#### `PUT /api/notificacoes/configuracoes`
Atualiza configurações.

**Payload:**
```json
{
  "n8n_webhook_url": "https://n8n.exemplo.com/webhook/abc123",
  "n8n_api_key": "chave_secreta",
  "whatsapp_ativo": true,
  "whatsapp_numero": "+5511999999999",
  "sms_ativo": false,
  "email_ativo": true,
  "email_smtp_host": "smtp.gmail.com",
  "email_smtp_port": 587
}
```

### Utilitários

#### `GET /api/notificacoes/tipos-disponiveis`
Lista tipos de notificação disponíveis com variáveis.

#### `GET /api/notificacoes/canais-disponiveis`
Lista canais de notificação disponíveis.

## 🔧 Configuração N8N/WhatsApp

### Passo 1: Configurar N8N

1. **Criar Workflow N8N:**
   - Adicione um nó "Webhook" como trigger
   - Configure URL: `https://seu-n8n.com/webhook/notificacoes`
   - Método: POST

2. **Configurar WhatsApp Node:**
   - Adicione nó do WhatsApp (Baileys ou oficial)
   - Configure credenciais da API
   - Mapeie campos: `destinatario`, `conteudo`

3. **Configurar Resposta:**
   - Adicione nó "Respond to Webhook"
   - Retorne status de sucesso/erro

### Passo 2: Configurar no Sistema

1. **Acesse Configurações:**
   - Menu: Notificações Inteligentes → Configurações
   - Preencha URL do webhook N8N
   - Adicione chave da API (se necessária)

2. **Ativar WhatsApp:**
   - Marque "WhatsApp Ativo"
   - Configure número do WhatsApp

### Passo 3: Testar Integração

```bash
# Teste manual via curl
curl -X POST "https://seu-n8n.com/webhook/notificacoes" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "notification_service",
    "event_type": "notification_sent",
    "destinatario": "+5511999999999",
    "conteudo": "Teste de integração"
  }'
```

## 🧪 Testes e Migração

### Executar Migração

```bash
# Criar tabelas de notificações
cd /home/ubuntu/sistema-eventos/backend
python create_notificacoes_tables.py

# Criar templates padrão
python seed_templates_notificacoes.py
```

### Executar Testes

```bash
# Testes unitários
poetry run pytest tests/test_notificacoes.py -v

# Testes de integração
poetry run pytest tests/test_notificacoes_integration.py -v

# Cobertura de testes
poetry run pytest --cov=app.routers.notificacoes --cov-report=html
```

### Restaurar Templates Padrão

```bash
# Re-executar seeds para restaurar templates
python seed_templates_notificacoes.py
```

## 🔒 Segurança e Permissões

### Controle de Acesso

- **Admin Only:**
  - Criar/editar/excluir templates
  - Configurar integrações
  - Envio manual de notificações
  - Visualizar todas as notificações

- **Promoter:**
  - Visualizar histórico da própria empresa
  - Dashboard de métricas

### Auditoria

Todas as ações são registradas em `LogAuditoria`:
```python
{
  "cpf_usuario": "12345678901",
  "acao": "criar_template_notificacao",
  "tabela_afetada": "templates_notificacoes",
  "dados_anteriores": null,
  "dados_novos": {...},
  "ip_origem": "192.168.1.100",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Proteção de Dados

- Senhas e chaves criptografadas no banco
- Logs de API não expõem dados sensíveis
- Rate limiting para evitar spam
- Validação de destinatários

## 📊 Exportação de Histórico

### Excel

```python
# Gera arquivo .xlsx com:
# - Planilha formatada com headers
# - Dados completos de notificações
# - Filtros aplicados
# - Formatação condicional por status
```

### CSV

```python
# Gera arquivo .csv com:
# - Separador vírgula
# - Encoding UTF-8
# - Headers em português
# - Dados filtrados
```

### Campos Exportados

- ID da Notificação
- Tipo de Notificação
- Canal Utilizado
- Destinatário
- Título
- Status
- Tentativas
- Evento Relacionado
- Data de Envio
- Data de Criação
- Detalhes de Erro (se houver)

## 🔗 Links Importantes

### Swagger UI
- **Desenvolvimento:** `http://localhost:8000/docs#/Notificações%20Inteligentes`
- **Produção:** `https://api.exemplo.com/docs#/Notificações%20Inteligentes`

### Rotas Principais
- Dashboard: `/notificacoes`
- Templates: `/notificacoes/templates`
- Histórico: `/notificacoes/historico`
- Configurações: `/notificacoes/configuracoes`

### Webhooks N8N
- Endpoint: `/api/n8n/webhook/notificacoes`
- Método: POST
- Autenticação: API Key (opcional)

## 🚀 Triggers Automáticos

### Eventos que Disparam Notificações

1. **Venda Confirmada** (`venda_aprovada`)
   - Disparado em: PDV, vendas online
   - Destinatário: Comprador
   - Variáveis: `{nome}`, `{evento_nome}`, `{valor}`, `{data_evento}`

2. **Check-in Realizado** (`checkin_realizado`)
   - Disparado em: Sistema de check-in
   - Destinatário: Pessoa que fez check-in
   - Variáveis: `{nome}`, `{evento_nome}`, `{hora_atual}`

3. **Caixa Fechado** (`caixa_fechado`)
   - Disparado em: Fechamento do caixa
   - Destinatário: Admins e promoters
   - Variáveis: `{evento_nome}`, `{receita_total}`, `{total_vendas}`

4. **Conquista Desbloqueada** (`conquista_desbloqueada`)
   - Disparado em: Sistema de gamificação
   - Destinatário: Promoter que conquistou
   - Variáveis: `{nome}`, `{conquista_nome}`, `{badge_nivel}`

5. **Aniversariante** (`aniversario_hoje`)
   - Disparado em: Scheduler diário
   - Destinatário: Aniversariante
   - Variáveis: `{nome}`, `{evento_nome}`

### Integração com Módulos

```python
# Exemplo de trigger no módulo PDV
from ..services.notification_service import notification_service

background_tasks.add_task(
    notification_service.processar_evento_sistema,
    "venda_aprovada",
    {
        "evento_id": venda.evento_id,
        "evento_nome": evento.nome,
        "cpf_comprador": venda.cpf_comprador,
        "nome_comprador": venda.nome_comprador,
        "telefone_comprador": venda.telefone_comprador,
        "valor": float(venda.valor_final),
        "lista_nome": "PDV"
    },
    db
)
```

## 📱 Interface Frontend

### Componentes Principais

- **NotificacoesModule**: Componente principal com tabs
- **TemplateModal**: Modal para criar/editar templates
- **EnvioManualModal**: Modal para envio manual
- **ConfiguracoesModal**: Modal de configurações

### Funcionalidades da Interface

- Dashboard visual com métricas em tempo real
- Listagem de templates com filtros
- Histórico paginado com busca avançada
- Exportação com um clique
- Formulários validados
- Feedback visual de status
- Responsivo para mobile

---

**Versão:** 1.0  
**Última Atualização:** Janeiro 2024  
**Autor:** Sistema de Gestão de Eventos  
**Suporte:** Equipe de Desenvolvimento
