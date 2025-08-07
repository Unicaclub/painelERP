import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { notificacoesService } from '../../services/api';

interface ConfiguracoesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfiguracoesModal: React.FC<ConfiguracoesModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    n8n_webhook_url: '',
    n8n_api_key: '',
    whatsapp_ativo: true,
    whatsapp_numero: '',
    sms_ativo: false,
    sms_api_key: '',
    sms_remetente: '',
    email_ativo: false,
    email_smtp_host: '',
    email_smtp_port: 587,
    email_usuario: '',
    email_senha: '',
    email_remetente: ''
  });

  useEffect(() => {
    if (isOpen) {
      carregarConfiguracoes();
    }
  }, [isOpen]);

  const carregarConfiguracoes = async () => {
    try {
      const config = await notificacoesService.obterConfiguracoes();
      setFormData({
        n8n_webhook_url: config.n8n_webhook_url || '',
        n8n_api_key: config.n8n_api_key || '',
        whatsapp_ativo: config.whatsapp_ativo !== undefined ? config.whatsapp_ativo : true,
        whatsapp_numero: config.whatsapp_numero || '',
        sms_ativo: config.sms_ativo !== undefined ? config.sms_ativo : false,
        sms_api_key: config.sms_api_key || '',
        sms_remetente: config.sms_remetente || '',
        email_ativo: config.email_ativo !== undefined ? config.email_ativo : false,
        email_smtp_host: config.email_smtp_host || '',
        email_smtp_port: config.email_smtp_port || 587,
        email_usuario: config.email_usuario || '',
        email_senha: config.email_senha || '',
        email_remetente: config.email_remetente || ''
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await notificacoesService.atualizarConfiguracoes(formData);
      
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso"
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações de Notificação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* N8N Configuration */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Configurações N8N</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="n8n_webhook_url">URL do Webhook N8N</Label>
                <Input
                  id="n8n_webhook_url"
                  value={formData.n8n_webhook_url}
                  onChange={(e) => setFormData({ ...formData, n8n_webhook_url: e.target.value })}
                  placeholder="https://n8n.exemplo.com/webhook/..."
                />
              </div>
              <div>
                <Label htmlFor="n8n_api_key">Chave da API N8N</Label>
                <Input
                  id="n8n_api_key"
                  type="password"
                  value={formData.n8n_api_key}
                  onChange={(e) => setFormData({ ...formData, n8n_api_key: e.target.value })}
                  placeholder="Chave da API"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configurações WhatsApp</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="whatsapp_ativo"
                  checked={formData.whatsapp_ativo}
                  onChange={(e) => setFormData({ ...formData, whatsapp_ativo: e.target.checked })}
                />
                <Label htmlFor="whatsapp_ativo">Ativo</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="whatsapp_numero">Número do WhatsApp</Label>
              <Input
                id="whatsapp_numero"
                value={formData.whatsapp_numero}
                onChange={(e) => setFormData({ ...formData, whatsapp_numero: e.target.value })}
                placeholder="+5511999999999"
                disabled={!formData.whatsapp_ativo}
              />
            </div>
          </div>

          {/* SMS Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configurações SMS</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sms_ativo"
                  checked={formData.sms_ativo}
                  onChange={(e) => setFormData({ ...formData, sms_ativo: e.target.checked })}
                />
                <Label htmlFor="sms_ativo">Ativo</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sms_api_key">Chave da API SMS</Label>
                <Input
                  id="sms_api_key"
                  type="password"
                  value={formData.sms_api_key}
                  onChange={(e) => setFormData({ ...formData, sms_api_key: e.target.value })}
                  placeholder="Chave da API (Twilio, etc.)"
                  disabled={!formData.sms_ativo}
                />
              </div>
              <div>
                <Label htmlFor="sms_remetente">Remetente SMS</Label>
                <Input
                  id="sms_remetente"
                  value={formData.sms_remetente}
                  onChange={(e) => setFormData({ ...formData, sms_remetente: e.target.value })}
                  placeholder="Nome do remetente"
                  disabled={!formData.sms_ativo}
                />
              </div>
            </div>
          </div>

          {/* Email Configuration */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Configurações E-mail</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="email_ativo"
                  checked={formData.email_ativo}
                  onChange={(e) => setFormData({ ...formData, email_ativo: e.target.checked })}
                />
                <Label htmlFor="email_ativo">Ativo</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email_smtp_host">Servidor SMTP</Label>
                <Input
                  id="email_smtp_host"
                  value={formData.email_smtp_host}
                  onChange={(e) => setFormData({ ...formData, email_smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  disabled={!formData.email_ativo}
                />
              </div>
              <div>
                <Label htmlFor="email_smtp_port">Porta SMTP</Label>
                <Input
                  id="email_smtp_port"
                  type="number"
                  value={formData.email_smtp_port}
                  onChange={(e) => setFormData({ ...formData, email_smtp_port: parseInt(e.target.value) })}
                  placeholder="587"
                  disabled={!formData.email_ativo}
                />
              </div>
              <div>
                <Label htmlFor="email_usuario">Usuário E-mail</Label>
                <Input
                  id="email_usuario"
                  value={formData.email_usuario}
                  onChange={(e) => setFormData({ ...formData, email_usuario: e.target.value })}
                  placeholder="usuario@exemplo.com"
                  disabled={!formData.email_ativo}
                />
              </div>
              <div>
                <Label htmlFor="email_senha">Senha E-mail</Label>
                <Input
                  id="email_senha"
                  type="password"
                  value={formData.email_senha}
                  onChange={(e) => setFormData({ ...formData, email_senha: e.target.value })}
                  placeholder="Senha do e-mail"
                  disabled={!formData.email_ativo}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="email_remetente">E-mail Remetente</Label>
                <Input
                  id="email_remetente"
                  value={formData.email_remetente}
                  onChange={(e) => setFormData({ ...formData, email_remetente: e.target.value })}
                  placeholder="noreply@exemplo.com"
                  disabled={!formData.email_ativo}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConfiguracoesModal;
