#!/bin/bash


set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

mkdir -p "$BACKUP_DIR"

log "Iniciando backup do banco de dados..."

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h postgres \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --verbose \
    --no-owner \
    --no-privileges \
    --format=custom \
    > "$BACKUP_DIR/eventos_db_$DATE.backup"

if [ $? -eq 0 ]; then
    log "Backup do banco de dados criado: eventos_db_$DATE.backup"
else
    error "Falha ao criar backup do banco de dados"
    exit 1
fi

if [ -d "/app/uploads" ]; then
    log "Criando backup dos arquivos de upload..."
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C /app uploads/
    log "Backup dos uploads criado: uploads_$DATE.tar.gz"
fi

if [ -d "/app/logs" ]; then
    log "Criando backup dos logs..."
    tar -czf "$BACKUP_DIR/logs_$DATE.tar.gz" -C /app logs/
    log "Backup dos logs criado: logs_$DATE.tar.gz"
fi

log "Removendo backups antigos (mais de $RETENTION_DAYS dias)..."
find "$BACKUP_DIR" -name "eventos_db_*.backup" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "logs_*.tar.gz" -mtime +$RETENTION_DAYS -delete

BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l)

log "Backup concluído com sucesso!"
log "Tamanho total dos backups: $BACKUP_SIZE"
log "Número de arquivos de backup: $BACKUP_COUNT"

if [ ! -z "$BACKUP_WEBHOOK_URL" ]; then
    curl -X POST "$BACKUP_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Backup do Sistema de Eventos concluído com sucesso\", \"date\": \"$DATE\", \"size\": \"$BACKUP_SIZE\"}" \
        || warn "Falha ao enviar notificação de backup"
fi

log "Script de backup finalizado."
