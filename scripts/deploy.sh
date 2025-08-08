#!/bin/bash


set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

echo -e "${BLUE}"
echo "=========================================="
echo "  SISTEMA DE EVENTOS UNICACLUB"
echo "  Deploy para Produção"
echo "=========================================="
echo -e "${NC}"

if [ ! -f "docker-compose.prod.yml" ]; then
    error "Arquivo docker-compose.prod.yml não encontrado!"
    error "Execute este script no diretório raiz do projeto."
    exit 1
fi

if [ ! -f ".env.production" ]; then
    error "Arquivo .env.production não encontrado!"
    error "Copie .env.production.example e configure as variáveis."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    error "Docker não está instalado!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado!"
    exit 1
fi

log "Iniciando deploy do Sistema de Eventos..."

info "Parando containers existentes..."
docker-compose -f docker-compose.prod.yml --env-file .env.production down || true

if docker volume ls | grep -q "sistema-eventos_postgres_data"; then
    warn "Volume do banco de dados encontrado. Criando backup..."
    docker run --rm \
        -v sistema-eventos_postgres_data:/data \
        -v $(pwd)/backups:/backup \
        alpine tar czf /backup/postgres_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .
    log "Backup criado em ./backups/"
fi

info "Limpando imagens Docker antigas..."
docker system prune -f

log "Construindo imagens Docker..."
docker-compose -f docker-compose.prod.yml --env-file .env.production build --no-cache

log "Iniciando serviços..."
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

log "Aguardando serviços ficarem prontos..."
sleep 30

info "Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

log "Executando migrations do banco de dados..."
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python create_notificacoes_tables.py
docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T backend python seed_templates_notificacoes.py

log "Verificando saúde dos serviços..."

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    log "✅ Backend está respondendo"
else
    error "❌ Backend não está respondendo"
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Frontend está respondendo"
else
    error "❌ Frontend não está respondendo"
fi

if docker-compose -f docker-compose.prod.yml --env-file .env.production exec -T postgres pg_isready > /dev/null 2>&1; then
    log "✅ Banco de dados está respondendo"
else
    error "❌ Banco de dados não está respondendo"
fi

info "Últimos logs dos serviços:"
docker-compose -f docker-compose.prod.yml --env-file .env.production logs --tail=20

echo -e "${GREEN}"
echo "=========================================="
echo "  DEPLOY CONCLUÍDO COM SUCESSO!"
echo "=========================================="
echo -e "${NC}"

log "🚀 Sistema de Eventos está rodando!"
log "📱 Frontend: http://localhost:3000"
log "🔧 Backend API: http://localhost:8000"
log "📚 Documentação: http://localhost:8000/docs"
log "💾 Banco de dados: localhost:5432"

echo ""
warn "PRÓXIMOS PASSOS:"
echo "1. Configure seu domínio para apontar para este servidor"
echo "2. Configure SSL/HTTPS com Let's Encrypt"
echo "3. Configure as APIs externas (WhatsApp, SMS, Email)"
echo "4. Teste todas as funcionalidades"
echo "5. Configure monitoramento e alertas"

echo ""
info "Para ver logs em tempo real:"
echo "docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f"

echo ""
info "Para parar o sistema:"
echo "docker-compose -f docker-compose.prod.yml --env-file .env.production down"

log "Deploy finalizado!"
