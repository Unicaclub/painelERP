import asyncio
import json
import logging
import aiohttp
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from ..database import get_db
from ..models import (
    NotificacaoEnviada, TemplateNotificacao, ConfiguracaoNotificacao,
    TipoNotificacao, StatusNotificacao, CanalNotificacao,
    Usuario, Evento, Transacao, Checkin, CaixaEvento, PromoterConquista
)
from .whatsapp_service import whatsapp_service

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.templates_cache = {}
        
    async def processar_evento_sistema(self, tipo_evento: str, dados: Dict[str, Any], db: Session):
        """Processar evento do sistema e disparar notificações automáticas"""
        try:
            tipo_notificacao = self._mapear_evento_para_tipo(tipo_evento)
            if not tipo_notificacao:
                return
            
            templates = db.query(TemplateNotificacao).filter(
                TemplateNotificacao.tipo_notificacao == tipo_notificacao,
                TemplateNotificacao.ativo == True
            ).all()
            
            for template in templates:
                await self._processar_template(template, dados, db)
                
        except Exception as e:
            logger.error(f"Erro ao processar evento {tipo_evento}: {e}")
    
    def _mapear_evento_para_tipo(self, evento: str) -> Optional[TipoNotificacao]:
        """Mapear eventos do sistema para tipos de notificação"""
        mapeamento = {
            "venda_aprovada": TipoNotificacao.VENDA_CONFIRMADA,
            "checkin_realizado": TipoNotificacao.CHECKIN_REALIZADO,
            "caixa_fechado": TipoNotificacao.CAIXA_FECHADO,
            "alerta_financeiro": TipoNotificacao.ALERTA_FINANCEIRO,
            "aniversario_hoje": TipoNotificacao.ANIVERSARIANTE,
            "ranking_atualizado": TipoNotificacao.RANKING_ATUALIZADO,
            "conquista_desbloqueada": TipoNotificacao.CONQUISTA_DESBLOQUEADA,
            "evento_criado": TipoNotificacao.EVENTO_CRIADO,
            "lista_criada": TipoNotificacao.LISTA_CRIADA
        }
        return mapeamento.get(evento)
    
    async def _processar_template(self, template: TemplateNotificacao, dados: Dict[str, Any], db: Session):
        """Processar template e enviar notificação"""
        try:
            destinatarios = self._obter_destinatarios(template, dados, db)
            
            for destinatario in destinatarios:
                conteudo_renderizado = self._renderizar_template(template.conteudo, dados, destinatario)
                titulo_renderizado = self._renderizar_template(template.titulo or "", dados, destinatario)
                
                notificacao = NotificacaoEnviada(
                    template_id=template.id,
                    tipo_notificacao=template.tipo_notificacao,
                    canal=template.canal,
                    destinatario=destinatario.get("contato"),
                    titulo=titulo_renderizado,
                    conteudo=conteudo_renderizado,
                    evento_id=dados.get("evento_id"),
                    usuario_id=destinatario.get("usuario_id"),
                    dados_contexto=json.dumps(dados)
                )
                
                db.add(notificacao)
                db.commit()
                db.refresh(notificacao)
                
                await self._enviar_notificacao(notificacao, db)
                
        except Exception as e:
            logger.error(f"Erro ao processar template {template.id}: {e}")
    
    def _obter_destinatarios(self, template: TemplateNotificacao, dados: Dict[str, Any], db: Session) -> List[Dict[str, Any]]:
        """Obter lista de destinatários baseado no tipo de notificação"""
        destinatarios = []
        
        if template.tipo_notificacao == TipoNotificacao.VENDA_CONFIRMADA:
            if dados.get("cpf_comprador") and dados.get("telefone_comprador"):
                destinatarios.append({
                    "contato": dados["telefone_comprador"],
                    "nome": dados.get("nome_comprador"),
                    "usuario_id": None
                })
        
        elif template.tipo_notificacao == TipoNotificacao.CHECKIN_REALIZADO:
            if dados.get("telefone") and dados.get("cpf"):
                destinatarios.append({
                    "contato": dados["telefone"],
                    "nome": dados.get("nome"),
                    "usuario_id": None
                })
        
        elif template.tipo_notificacao == TipoNotificacao.CAIXA_FECHADO:
            evento_id = dados.get("evento_id")
            if evento_id:
                usuarios = db.query(Usuario).filter(
                    or_(
                        Usuario.tipo == "admin",
                        and_(
                            Usuario.tipo == "promoter",
                            Usuario.empresa_id == template.empresa_id
                        )
                    ),
                    Usuario.telefone.isnot(None),
                    Usuario.ativo == True
                ).all()
                
                for usuario in usuarios:
                    destinatarios.append({
                        "contato": usuario.telefone,
                        "nome": usuario.nome,
                        "usuario_id": usuario.id
                    })
        
        elif template.tipo_notificacao == TipoNotificacao.ANIVERSARIANTE:
            if dados.get("telefone") and dados.get("nome"):
                destinatarios.append({
                    "contato": dados["telefone"],
                    "nome": dados["nome"],
                    "usuario_id": dados.get("usuario_id")
                })
        
        elif template.tipo_notificacao == TipoNotificacao.CONQUISTA_DESBLOQUEADA:
            promoter_id = dados.get("promoter_id")
            if promoter_id:
                promoter = db.query(Usuario).filter(Usuario.id == promoter_id).first()
                if promoter and promoter.telefone:
                    destinatarios.append({
                        "contato": promoter.telefone,
                        "nome": promoter.nome,
                        "usuario_id": promoter.id
                    })
        
        return destinatarios
    
    def _renderizar_template(self, template: str, dados: Dict[str, Any], destinatario: Dict[str, Any]) -> str:
        """Renderizar template com variáveis"""
        try:
            variaveis = {
                "nome": destinatario.get("nome", ""),
                "evento_nome": dados.get("evento_nome", ""),
                "data_evento": dados.get("data_evento", ""),
                "local_evento": dados.get("local_evento", ""),
                "valor": dados.get("valor", ""),
                "lista_nome": dados.get("lista_nome", ""),
                "conquista_nome": dados.get("conquista_nome", ""),
                "badge_nivel": dados.get("badge_nivel", ""),
                "posicao_ranking": dados.get("posicao_ranking", ""),
                "total_vendas": dados.get("total_vendas", ""),
                "receita_total": dados.get("receita_total", ""),
                "data_atual": datetime.now().strftime("%d/%m/%Y"),
                "hora_atual": datetime.now().strftime("%H:%M")
            }
            
            conteudo = template
            for var, valor in variaveis.items():
                conteudo = conteudo.replace(f"{{{var}}}", str(valor))
            
            return conteudo
            
        except Exception as e:
            logger.error(f"Erro ao renderizar template: {e}")
            return template
    
    async def _enviar_notificacao(self, notificacao: NotificacaoEnviada, db: Session):
        """Enviar notificação via canal específico"""
        try:
            if notificacao.canal == CanalNotificacao.WHATSAPP:
                await self._enviar_whatsapp(notificacao, db)
            elif notificacao.canal == CanalNotificacao.SMS:
                await self._enviar_sms(notificacao, db)
            elif notificacao.canal == CanalNotificacao.EMAIL:
                await self._enviar_email(notificacao, db)
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação {notificacao.id}: {e}")
            notificacao.status = StatusNotificacao.FALHADA
            notificacao.erro_detalhes = str(e)
            notificacao.tentativas += 1
            db.commit()
    
    async def _enviar_whatsapp(self, notificacao: NotificacaoEnviada, db: Session):
        """Enviar notificação via WhatsApp"""
        try:
            resultado = await whatsapp_service._send_whatsapp_message(
                notificacao.destinatario,
                notificacao.conteudo
            )
            
            notificacao.status = StatusNotificacao.ENVIADA
            notificacao.enviada_em = datetime.now()
            notificacao.resposta_api = json.dumps(resultado)
            
            await self._notificar_n8n(notificacao, db)
            
        except Exception as e:
            raise e
    
    async def _enviar_sms(self, notificacao: NotificacaoEnviada, db: Session):
        """Enviar notificação via SMS (mock)"""
        await asyncio.sleep(0.5)
        notificacao.status = StatusNotificacao.ENVIADA
        notificacao.enviada_em = datetime.now()
        notificacao.resposta_api = json.dumps({"status": "sent", "provider": "mock_sms"})
    
    async def _enviar_email(self, notificacao: NotificacaoEnviada, db: Session):
        """Enviar notificação via Email (mock)"""
        await asyncio.sleep(0.5)
        notificacao.status = StatusNotificacao.ENVIADA
        notificacao.enviada_em = datetime.now()
        notificacao.resposta_api = json.dumps({"status": "sent", "provider": "mock_email"})
    
    async def _notificar_n8n(self, notificacao: NotificacaoEnviada, db: Session):
        """Notificar N8N sobre notificação enviada"""
        try:
            config = db.query(ConfiguracaoNotificacao).filter(
                ConfiguracaoNotificacao.empresa_id == notificacao.template.empresa_id
            ).first()
            
            if not config or not config.n8n_webhook_url:
                return
            
            payload = {
                "source": "notification_service",
                "event_type": "notification_sent",
                "notification_id": notificacao.id,
                "tipo": notificacao.tipo_notificacao.value,
                "canal": notificacao.canal.value,
                "destinatario": notificacao.destinatario,
                "status": notificacao.status.value,
                "timestamp": datetime.now().isoformat()
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(config.n8n_webhook_url, json=payload) as response:
                    logger.info(f"N8N notificado sobre notificação {notificacao.id} - Status: {response.status}")
                    
        except Exception as e:
            logger.error(f"Erro ao notificar N8N: {e}")
    
    async def enviar_notificacao_manual(self, dados: Dict[str, Any], db: Session) -> NotificacaoEnviada:
        """Enviar notificação manual"""
        notificacao = NotificacaoEnviada(
            tipo_notificacao=TipoNotificacao(dados["tipo_notificacao"]),
            canal=CanalNotificacao(dados["canal"]),
            destinatario=dados["destinatario"],
            titulo=dados.get("titulo"),
            conteudo=dados["conteudo"],
            evento_id=dados.get("evento_id"),
            agendada_para=dados.get("agendar_para"),
            dados_contexto=json.dumps(dados)
        )
        
        db.add(notificacao)
        db.commit()
        db.refresh(notificacao)
        
        if not notificacao.agendada_para:
            await self._enviar_notificacao(notificacao, db)
        
        return notificacao

notification_service = NotificationService()
