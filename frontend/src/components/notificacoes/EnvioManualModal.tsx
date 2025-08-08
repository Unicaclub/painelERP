import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { notificacoesService, eventoService } from '../../services/api';

interface EnvioManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
}

const EnvioManualModal: React.FC<EnvioManualModalProps> = ({
  isOpen,
  onClose,
  onSend
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [canais, setCanais] = useState([]);
  
  const [formData, setFormData] = useState({
    template_id: '',
    tipo_notificacao: 'venda_confirmada',
    canal: 'whatsapp',
    destinatario: '',
    titulo: '',
    conteudo: '',
    evento_id: '',
    agendar_para: ''
  });

  useEffect(() => {
    if (isOpen) {
      carregarDados();
      setFormData({
        template_id: '',
        tipo_notificacao: 'venda_confirmada',
        canal: 'whatsapp',
        destinatario: '',
        titulo: '',
        conteudo: '',
        evento_id: '',
        agendar_para: ''
      });
    }
  }, [isOpen]);

  const carregarDados = async () => {
    try {
      const [templatesData, eventosData, canaisData] = await Promise.all([
        notificacoesService.listarTemplates(),
        eventoService.listar(),
        notificacoesService.obterCanaisDisponiveis()
      ]);
      setTemplates(templatesData);
      setEventos(eventosData);
      setCanais(canaisData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (template) {
      setFormData({
        ...formData,
        template_id: templateId,
        tipo_notificacao: template.tipo_notificacao,
        canal: template.canal,
        titulo: template.titulo || '',
        conteudo: template.conteudo
      });
    } else {
      setFormData({
        ...formData,
        template_id: templateId
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.destinatario || !formData.conteudo) {
      toast({
        title: "Erro",
        description: "Preencha destinatário e conteúdo",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      await notificacoesService.enviarManual({
        ...formData,
        template_id: formData.template_id ? parseInt(formData.template_id) : null,
        evento_id: formData.evento_id ? parseInt(formData.evento_id) : null,
        agendar_para: formData.agendar_para || null
      });
      
      toast({
        title: "Sucesso",
        description: "Notificação enviada com sucesso"
      });
      
      onSend();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Notificação Manual</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template">Template (opcional)</Label>
              <select
                id="template"
                className="w-full p-2 border rounded-md"
                value={formData.template_id}
                onChange={(e) => handleTemplateChange(e.target.value)}
              >
                <option value="">Selecione um template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="canal">Canal *</Label>
              <select
                id="canal"
                className="w-full p-2 border rounded-md"
                value={formData.canal}
                onChange={(e) => setFormData({ ...formData, canal: e.target.value })}
              >
                {canais.map((canal) => (
                  <option key={canal.value} value={canal.value}>
                    {canal.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="destinatario">Destinatário *</Label>
              <Input
                id="destinatario"
                value={formData.destinatario}
                onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                placeholder="Telefone, email ou CPF"
              />
            </div>

            <div>
              <Label htmlFor="evento">Evento (opcional)</Label>
              <select
                id="evento"
                className="w-full p-2 border rounded-md"
                value={formData.evento_id}
                onChange={(e) => setFormData({ ...formData, evento_id: e.target.value })}
              >
                <option value="">Selecione um evento</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="titulo">Título (opcional)</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Título da notificação"
            />
          </div>

          <div>
            <Label htmlFor="conteudo">Conteúdo da Mensagem *</Label>
            <Textarea
              id="conteudo"
              rows={6}
              value={formData.conteudo}
              onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
              placeholder="Digite o conteúdo da mensagem..."
            />
          </div>

          <div>
            <Label htmlFor="agendar">Agendar Para (opcional)</Label>
            <Input
              id="agendar"
              type="datetime-local"
              value={formData.agendar_para}
              onChange={(e) => setFormData({ ...formData, agendar_para: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnvioManualModal;
