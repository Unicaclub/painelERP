import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { notificacoesService } from '../../services/api';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: any;
  onSave: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onSave
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tipos, setTipos] = useState([]);
  const [canais, setCanais] = useState([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo_notificacao: '',
    canal: '',
    titulo: '',
    conteudo: '',
    ativo: true
  });

  useEffect(() => {
    if (isOpen) {
      carregarTiposECanais();
      if (template) {
        setFormData({
          nome: template.nome || '',
          tipo_notificacao: template.tipo_notificacao || '',
          canal: template.canal || '',
          titulo: template.titulo || '',
          conteudo: template.conteudo || '',
          ativo: template.ativo !== undefined ? template.ativo : true
        });
      } else {
        setFormData({
          nome: '',
          tipo_notificacao: '',
          canal: '',
          titulo: '',
          conteudo: '',
          ativo: true
        });
      }
    }
  }, [isOpen, template]);

  const carregarTiposECanais = async () => {
    try {
      const [tiposData, canaisData] = await Promise.all([
        notificacoesService.obterTiposDisponiveis(),
        notificacoesService.obterCanaisDisponiveis()
      ]);
      setTipos(tiposData);
      setCanais(canaisData);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar tipos e canais",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.tipo_notificacao || !formData.canal || !formData.conteudo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (template) {
        await notificacoesService.atualizarTemplate(template.id, formData);
        toast({
          title: "Sucesso",
          description: "Template atualizado com sucesso"
        });
      } else {
        await notificacoesService.criarTemplate(formData);
        toast({
          title: "Sucesso",
          description: "Template criado com sucesso"
        });
      }
      
      onSave();
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const tipoSelecionado = tipos.find(t => t.value === formData.tipo_notificacao);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Template *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Venda Confirmada - WhatsApp"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Notificação *</Label>
              <select
                id="tipo"
                className="w-full p-2 border rounded-md"
                value={formData.tipo_notificacao}
                onChange={(e) => setFormData({ ...formData, tipo_notificacao: e.target.value })}
              >
                <option value="">Selecione o tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
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
                <option value="">Selecione o canal</option>
                {canais.map((canal) => (
                  <option key={canal.value} value={canal.value}>
                    {canal.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ativo"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
              />
              <Label htmlFor="ativo">Template Ativo</Label>
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

          {tipoSelecionado && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Variáveis Disponíveis:</h4>
              <p className="text-sm text-blue-700">
                {tipoSelecionado.variaveis}
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Use as variáveis acima no conteúdo da mensagem. Elas serão substituídas automaticamente pelos valores reais.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateModal;
