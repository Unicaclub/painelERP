import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useToast } from '../../hooks/use-toast';
import { 
  Bell, MessageSquare, Mail, Smartphone, Settings, 
  Download, Filter, Plus, Edit,
  Send, Clock, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { notificacoesService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import TemplateModal from './TemplateModal';
import EnvioManualModal from './EnvioManualModal';
import ConfiguracoesModal from './ConfiguracoesModal';

interface Template {
  id: number;
  nome: string;
  tipo_notificacao: string;
  canal: string;
  titulo?: string;
  conteudo: string;
  ativo: boolean;
  criado_em: string;
}

interface NotificacaoHistorico {
  id: number;
  tipo_notificacao: string;
  canal: string;
  destinatario: string;
  titulo?: string;
  conteudo: string;
  status: string;
  tentativas: number;
  evento_nome?: string;
  usuario_nome?: string;
  enviada_em?: string;
  criada_em: string;
  erro_detalhes?: string;
}

interface DashboardData {
  total_enviadas_hoje: number;
  total_pendentes: number;
  total_falhadas: number;
  taxa_sucesso: number;
  notificacoes_recentes: NotificacaoHistorico[];
  tipos_mais_enviados: Array<{tipo: string; total: number}>;
  canais_estatisticas: Array<{canal: string; total: number; enviadas: number; taxa_sucesso: number}>;
}

const NotificacoesModule: React.FC = () => {
  const { usuario } = useAuth();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [historico, setHistorico] = useState<NotificacaoHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filtros, setFiltros] = useState({
    tipo_notificacao: '',
    canal: '',
    status: '',
    evento_id: '',
    destinatario: '',
    data_inicio: '',
    data_fim: ''
  });
  
  const [templateModal, setTemplateModal] = useState<{ open: boolean; template: Template | null }>({ open: false, template: null });
  const [envioManualModal, setEnvioManualModal] = useState(false);
  const [configuracoesModal, setConfiguracoesModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      carregarDashboard();
    } else if (activeTab === 'templates') {
      carregarTemplates();
    } else if (activeTab === 'historico') {
      carregarHistorico();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'historico') {
      carregarHistorico();
    }
  }, [filtros]);

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const data = await notificacoesService.obterDashboard();
      setDashboard(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dashboard de notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarTemplates = async () => {
    try {
      setLoading(true);
      const data = await notificacoesService.listarTemplates();
      setTemplates(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      setLoading(true);
      const data = await notificacoesService.obterHistorico(filtros);
      setHistorico(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async (formato: 'excel' | 'csv') => {
    try {
      const blob = await notificacoesService.exportarHistorico(formato, filtros);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notificacoes.${formato === 'excel' ? 'xlsx' : formato}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Sucesso",
        description: `Histórico exportado em ${formato.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar histórico",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      'enviada': <CheckCircle className="h-4 w-4 text-green-600" />,
      'pendente': <Clock className="h-4 w-4 text-yellow-600" />,
      'falhada': <XCircle className="h-4 w-4 text-red-600" />,
      'cancelada': <AlertTriangle className="h-4 w-4 text-gray-600" />
    };
    return icons[status] || <Clock className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'enviada': 'bg-green-100 text-green-800 border-green-200',
      'pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'falhada': 'bg-red-100 text-red-800 border-red-200',
      'cancelada': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCanalIcon = (canal: string) => {
    const icons: Record<string, JSX.Element> = {
      'whatsapp': <MessageSquare className="h-4 w-4 text-green-600" />,
      'sms': <Smartphone className="h-4 w-4 text-blue-600" />,
      'email': <Mail className="h-4 w-4 text-purple-600" />,
      'push': <Bell className="h-4 w-4 text-orange-600" />
    };
    return icons[canal] || <Bell className="h-4 w-4 text-gray-400" />;
  };

  const getCanalColor = (canal: string) => {
    const colors: Record<string, string> = {
      'whatsapp': 'bg-green-100 text-green-800 border-green-200',
      'sms': 'bg-blue-100 text-blue-800 border-blue-200',
      'email': 'bg-purple-100 text-purple-800 border-purple-200',
      'push': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[canal] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleTestarCanal = async (canal: string) => {
    const destinatario = prompt(`Digite o destinatário para teste do ${canal.toUpperCase()}:`);
    if (!destinatario) return;

    try {
      setLoading(true);
      const resultado = await notificacoesService.testarCanal(canal, destinatario);
      
      toast({
        title: resultado.sucesso ? "Sucesso" : "Erro",
        description: resultado.mensagem,
        variant: resultado.sucesso ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao testar canal",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Enviadas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {dashboard.total_enviadas_hoje}
              </div>
              <div className="text-sm text-green-600 font-medium">
                Taxa: {dashboard.taxa_sucesso}%
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-yellow-700">
                <Clock className="h-4 w-4 mr-2" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {dashboard.total_pendentes}
              </div>
              <div className="text-sm text-yellow-600 font-medium">
                Aguardando envio
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-red-700">
                <XCircle className="h-4 w-4 mr-2" />
                Falhadas Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {dashboard.total_falhadas}
              </div>
              <div className="text-sm text-red-600 font-medium">
                Requer atenção
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-blue-700">
                <Bell className="h-4 w-4 mr-2" />
                Taxa Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {dashboard.taxa_sucesso}%
              </div>
              <div className="text-sm text-blue-600 font-medium">
                Últimas 24h
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.notificacoes_recentes.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhuma notificação recente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboard?.notificacoes_recentes.map((notif) => (
                <div key={notif.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCanalIcon(notif.canal)}
                      <div>
                        <p className="font-medium">{notif.tipo_notificacao.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">{notif.destinatario}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(notif.status)}>
                        {getStatusIcon(notif.status)}
                        {notif.status}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatDate(notif.criada_em)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 truncate">
                    {notif.conteudo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Templates de Notificação</h2>
          <p className="text-gray-600">Gerencie templates para notificações automáticas</p>
        </div>
        
        {usuario?.tipo === 'admin' && (
          <Button 
            onClick={() => setTemplateModal({ open: true, template: null })}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum template encontrado</p>
            </div>
          ) : (
            <div className="divide-y">
              {templates.map((template) => (
                <div key={template.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{template.nome}</h3>
                        <Badge className={template.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <Badge className={`flex items-center gap-1 ${getCanalColor(template.canal)}`}>
                          {getCanalIcon(template.canal)}
                          {template.canal.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Tipo: {template.tipo_notificacao.replace('_', ' ')}
                      </p>
                      
                      {template.titulo && (
                        <p className="text-sm font-medium mb-1">
                          Título: {template.titulo}
                        </p>
                      )}
                      
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {template.conteudo}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Criado em: {formatDate(template.criado_em)}
                      </p>
                    </div>
                    
                    {usuario?.tipo === 'admin' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTemplateModal({ open: true, template })}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderHistorico = () => (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Histórico de Notificações</h2>
          <p className="text-gray-600">Visualize todas as notificações enviadas</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => handleExportar('excel')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => handleExportar('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Canal</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={filtros.canal}
                onChange={(e) => setFiltros({ ...filtros, canal: e.target.value })}
              >
                <option value="">Todos os canais</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">E-mail</option>
              </select>
            </div>
            
            <div>
              <Label>Status</Label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              >
                <option value="">Todos os status</option>
                <option value="enviada">Enviada</option>
                <option value="pendente">Pendente</option>
                <option value="falhada">Falhada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filtros.data_inicio}
                onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filtros.data_fim}
                onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando histórico...</p>
            </div>
          ) : historico.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            <div className="divide-y">
              {historico.map((notif) => (
                <div key={notif.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getCanalIcon(notif.canal)}
                      <div>
                        <h3 className="font-semibold">{notif.tipo_notificacao.replace('_', ' ')}</h3>
                        <p className="text-sm text-gray-600">{notif.destinatario}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(notif.status)}>
                        {getStatusIcon(notif.status)}
                        {notif.status}
                      </Badge>
                      
                      {notif.tentativas > 1 && (
                        <Badge variant="outline">
                          {notif.tentativas} tentativas
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {notif.titulo && (
                    <p className="font-medium mb-2">{notif.titulo}</p>
                  )}
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {notif.conteudo}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Criada: {formatDate(notif.criada_em)}</span>
                    {notif.enviada_em && (
                      <span>Enviada: {formatDate(notif.enviada_em)}</span>
                    )}
                    {notif.evento_nome && (
                      <span>Evento: {notif.evento_nome}</span>
                    )}
                    {notif.erro_detalhes && (
                      <span className="text-red-600">Erro: {notif.erro_detalhes}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Notificações Inteligentes
          </h1>
          <p className="text-gray-600">Sistema de notificações automáticas via WhatsApp, SMS e E-mail</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {usuario?.tipo === 'admin' && (
            <>
              <Button 
                onClick={() => setEnvioManualModal(true)}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Envio Manual
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setConfiguracoesModal(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Bell },
            { id: 'templates', label: 'Templates', icon: MessageSquare },
            { id: 'historico', label: 'Histórico', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'historico' && renderHistorico()}

      <TemplateModal
        isOpen={templateModal.open}
        onClose={() => setTemplateModal({ open: false, template: null })}
        template={templateModal.template}
        onSave={() => {
          setTemplateModal({ open: false, template: null });
          carregarTemplates();
        }}
      />
      
      <EnvioManualModal
        isOpen={envioManualModal}
        onClose={() => setEnvioManualModal(false)}
        onSend={() => {
          setEnvioManualModal(false);
          if (activeTab === 'historico') carregarHistorico();
        }}
      />
      
      <ConfiguracoesModal
        isOpen={configuracoesModal}
        onClose={() => setConfiguracoesModal(false)}
      />
    </div>
  );
};

export default NotificacoesModule;
