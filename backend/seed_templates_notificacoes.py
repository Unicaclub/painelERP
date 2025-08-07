#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_db
from app.models import TemplateNotificacao, TipoNotificacao, CanalNotificacao, Empresa, Usuario

def seed_templates_notificacoes():
    """Criar templates padrão de notificações"""
    db = next(get_db())
    
    empresa = db.query(Empresa).first()
    admin = db.query(Usuario).filter(Usuario.tipo == "admin").first()
    
    if not empresa or not admin:
        print("❌ Empresa ou admin não encontrados. Execute seed_test_data.py primeiro.")
        return
    
    templates_padrao = [
        {
            "nome": "Venda Confirmada - WhatsApp",
            "tipo_notificacao": TipoNotificacao.VENDA_CONFIRMADA,
            "canal": CanalNotificacao.WHATSAPP,
            "titulo": "🎉 Compra Confirmada!",
            "conteudo": """🎉 *COMPRA CONFIRMADA!*

Olá {nome}!

Sua compra foi confirmada com sucesso:
🎫 Evento: {evento_nome}
📅 Data: {data_evento}
📍 Local: {local_evento}
💰 Valor: R$ {valor}

Para fazer check-in no evento, responda:
*CHECKIN [SEU CPF] [3 PRIMEIROS DÍGITOS]*

Nos vemos lá! 🚀""",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Check-in Realizado - WhatsApp",
            "tipo_notificacao": TipoNotificacao.CHECKIN_REALIZADO,
            "canal": CanalNotificacao.WHATSAPP,
            "titulo": "✅ Check-in Confirmado!",
            "conteudo": """✅ *CHECK-IN REALIZADO!*

Olá {nome}!

Seu check-in foi realizado com sucesso:
🎫 Evento: {evento_nome}
📅 Data: {data_evento}
📍 Local: {local_evento}
⏰ Horário: {hora_atual}

Bem-vindo(a) ao evento! Aproveite! 🎉""",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Caixa Fechado - WhatsApp",
            "tipo_notificacao": TipoNotificacao.CAIXA_FECHADO,
            "canal": CanalNotificacao.WHATSAPP,
            "titulo": "💰 Caixa Fechado",
            "conteudo": """💰 *CAIXA DO EVENTO FECHADO*

Evento: {evento_nome}
📊 Total de Vendas: {total_vendas}
💵 Receita Total: R$ {receita_total}
📅 Data: {data_atual}

Relatório completo disponível no sistema.

Equipe de Gestão 📋""",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Aniversariante - WhatsApp",
            "tipo_notificacao": TipoNotificacao.ANIVERSARIANTE,
            "canal": CanalNotificacao.WHATSAPP,
            "titulo": "🎂 Feliz Aniversário!",
            "conteudo": """🎂 *FELIZ ANIVERSÁRIO {nome}!*

Hoje é seu dia especial! 🎉

Como presente, você tem desconto especial nos nossos próximos eventos.

Confira nossa agenda e garante sua presença:
📅 Próximo evento: {evento_nome}
📍 Local: {local_evento}

Que este novo ano seja repleto de alegrias! 🎈✨""",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Conquista Desbloqueada - WhatsApp",
            "tipo_notificacao": TipoNotificacao.CONQUISTA_DESBLOQUEADA,
            "canal": CanalNotificacao.WHATSAPP,
            "titulo": "🏆 Nova Conquista!",
            "conteudo": """🏆 *PARABÉNS {nome}!*

Você desbloqueou uma nova conquista:
🎖️ {conquista_nome}
⭐ Nível: {badge_nivel}

Continue assim e alcance novos patamares!
Acesse o sistema para ver seu ranking atualizado.

Você é incrível! 🚀""",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Venda Confirmada - SMS",
            "tipo_notificacao": TipoNotificacao.VENDA_CONFIRMADA,
            "canal": CanalNotificacao.SMS,
            "conteudo": "Compra confirmada! Evento: {evento_nome} em {data_evento}. Valor: R$ {valor}. Para check-in, acesse nosso WhatsApp.",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Check-in Realizado - SMS",
            "tipo_notificacao": TipoNotificacao.CHECKIN_REALIZADO,
            "canal": CanalNotificacao.SMS,
            "conteudo": "Check-in realizado com sucesso! {evento_nome} - {data_evento}. Bem-vindo(a) ao evento!",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        },
        
        {
            "nome": "Venda Confirmada - Email",
            "tipo_notificacao": TipoNotificacao.VENDA_CONFIRMADA,
            "canal": CanalNotificacao.EMAIL,
            "titulo": "Compra Confirmada - {evento_nome}",
            "conteudo": """<h2>Compra Confirmada!</h2>
            
<p>Olá <strong>{nome}</strong>!</p>

<p>Sua compra foi confirmada com sucesso:</p>

<ul>
<li><strong>Evento:</strong> {evento_nome}</li>
<li><strong>Data:</strong> {data_evento}</li>
<li><strong>Local:</strong> {local_evento}</li>
<li><strong>Valor:</strong> R$ {valor}</li>
</ul>

<p>Para fazer check-in no evento, utilize nosso sistema via WhatsApp ou acesse o link do evento.</p>

<p>Nos vemos lá!</p>""",
            "empresa_id": empresa.id,
            "criado_por_id": admin.id
        }
    ]
    
    for template_data in templates_padrao:
        existing = db.query(TemplateNotificacao).filter(
            TemplateNotificacao.nome == template_data["nome"],
            TemplateNotificacao.empresa_id == empresa.id
        ).first()
        
        if not existing:
            template = TemplateNotificacao(**template_data)
            db.add(template)
    
    db.commit()
    print("✅ Templates de notificação padrão criados com sucesso!")

if __name__ == "__main__":
    seed_templates_notificacoes()
