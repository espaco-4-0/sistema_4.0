
import { Search, MoreVertical, User, Calendar, AlertCircle, CheckCircle, Clock, X, Users, ListTodo, DollarSign, FileText, MessageSquare, Paperclip, Edit, Share2, Archive, ChevronRight, TrendingUp, Target, Zap } from 'lucide-react';
import { useState } from 'react';

interface Tarefa {
  id: number;
  titulo: string;
  responsavel: string;
  status: 'concluida' | 'em-andamento' | 'pendente';
  prazo: string;
}

interface Membro {
  id: number;
  nome: string;
  papel: string;
  avatar: string;
}

interface Comentario {
  id: number;
  autor: string;
  texto: string;
  data: string;
}

interface Anexo {
  id: number;
  nome: string;
  tipo: string;
  tamanho: string;
}

interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  estudante: string;
  orientador: string | null;
  dataInicio: string;
  prazo: string;
  status: 'em-andamento' | 'concluido' | 'atrasado' | 'pendente';
  progresso: number;
  categoria: string;
  orcamento: number;
  gastoAtual: number;
  membros: Membro[];
  tarefas: Tarefa[];
  comentarios: Comentario[];
  anexos: Anexo[];
  objetivos: string[];
  tecnologias: string[];
}

const projetos: Projeto[] = [
  {
    id: 1,
    nome: 'Braço Robótico IoT',
    descricao: 'Desenvolvimento de braço robótico controlado via Internet com 6 graus de liberdade',
    estudante: 'João Silva',
    orientador: null,
    dataInicio: '15/01/2026',
    prazo: '30/03/2026',
    status: 'pendente',
    progresso: 25,
    categoria: 'Robótica',
    orcamento: 5000,
    gastoAtual: 1200,
    membros: [
      { id: 1, nome: 'João Silva', papel: 'Líder do Projeto', avatar: 'JS' },
      { id: 2, nome: 'Maria Costa', papel: 'Desenvolvedor', avatar: 'MC' }
    ],
    tarefas: [
      { id: 1, titulo: 'Design 3D das peças', responsavel: 'João Silva', status: 'concluida', prazo: '20/01/2026' },
      { id: 2, titulo: 'Programação de motores', responsavel: 'Maria Costa', status: 'em-andamento', prazo: '10/02/2026' },
      { id: 3, titulo: 'Interface de controle', responsavel: 'João Silva', status: 'pendente', prazo: '01/03/2026' },
      { id: 4, titulo: 'Testes de precisão', responsavel: 'Maria Costa', status: 'pendente', prazo: '20/03/2026' }
    ],
    comentarios: [
      { id: 1, autor: 'João Silva', texto: 'Precisamos revisar o orçamento para sensores', data: '18/01/2026' },
      { id: 2, autor: 'Maria Costa', texto: 'Design aprovado pela equipe', data: '20/01/2026' }
    ],
    anexos: [
      { id: 1, nome: 'design-braco.pdf', tipo: 'PDF', tamanho: '2.3 MB' },
      { id: 2, nome: 'codigo-arduino.ino', tipo: 'CODE', tamanho: '45 KB' }
    ],
    objetivos: [
      'Criar braço robótico funcional com 6 graus de liberdade',
      'Implementar controle remoto via WiFi',
      'Desenvolver interface web intuitiva'
    ],
    tecnologias: ['Arduino', 'ESP32', 'React', 'Servomotores']
  },
  {
    id: 2,
    nome: 'Sistema de Automação Residencial',
    descricao: 'Casa inteligente com sensores e controle por app',
    estudante: 'Maria Santos',
    orientador: 'Prof. Carlos Mendes',
    dataInicio: '10/01/2026',
    prazo: '26/01/2026',
    status: 'atrasado',
    progresso: 65,
    categoria: 'IoT',
    orcamento: 3500,
    gastoAtual: 2800,
    membros: [
      { id: 1, nome: 'Maria Santos', papel: 'Líder do Projeto', avatar: 'MS' },
      { id: 2, nome: 'Pedro Lima', papel: 'Hardware', avatar: 'PL' },
      { id: 3, nome: 'Ana Paula', papel: 'Software', avatar: 'AP' }
    ],
    tarefas: [
      { id: 1, titulo: 'Instalação de sensores', responsavel: 'Pedro Lima', status: 'concluida', prazo: '15/01/2026' },
      { id: 2, titulo: 'Desenvolvimento do app', responsavel: 'Ana Paula', status: 'em-andamento', prazo: '22/01/2026' },
      { id: 3, titulo: 'Integração com assistente de voz', responsavel: 'Maria Santos', status: 'em-andamento', prazo: '25/01/2026' },
      { id: 4, titulo: 'Testes de segurança', responsavel: 'Pedro Lima', status: 'pendente', prazo: '26/01/2026' }
    ],
    comentarios: [
      { id: 1, autor: 'Prof. Carlos Mendes', texto: 'Excelente progresso! Foco nos testes finais', data: '20/01/2026' },
      { id: 2, autor: 'Maria Santos', texto: 'App está 80% completo', data: '22/01/2026' }
    ],
    anexos: [
      { id: 1, nome: 'diagrama-sistema.png', tipo: 'IMG', tamanho: '1.5 MB' },
      { id: 2, nome: 'manual-usuario.pdf', tipo: 'PDF', tamanho: '3.2 MB' }
    ],
    objetivos: [
      'Automatizar iluminação e climatização',
      'Criar sistema de segurança integrado',
      'Desenvolver app mobile multiplataforma'
    ],
    tecnologias: ['Raspberry Pi', 'Flutter', 'MQTT', 'Firebase']
  },
  {
    id: 3,
    nome: 'Impressora 3D de Alta Precisão',
    descricao: 'Construção e calibração de impressora 3D',
    estudante: 'Pedro Oliveira',
    orientador: 'Prof. Ana Costa',
    dataInicio: '05/01/2026',
    prazo: '15/02/2026',
    status: 'em-andamento',
    progresso: 45,
    categoria: 'Fabricação Digital',
    orcamento: 4200,
    gastoAtual: 1800,
    membros: [
      { id: 1, nome: 'Pedro Oliveira', papel: 'Líder do Projeto', avatar: 'PO' },
      { id: 2, nome: 'Lucas Dias', papel: 'Mecânica', avatar: 'LD' }
    ],
    tarefas: [
      { id: 1, titulo: 'Montagem da estrutura', responsavel: 'Pedro Oliveira', status: 'concluida', prazo: '15/01/2026' },
      { id: 2, titulo: 'Calibração de eixos', responsavel: 'Lucas Dias', status: 'em-andamento', prazo: '25/01/2026' },
      { id: 3, titulo: 'Testes de impressão', responsavel: 'Pedro Oliveira', status: 'pendente', prazo: '05/02/2026' }
    ],
    comentarios: [
      { id: 1, autor: 'Prof. Ana Costa', texto: 'Ótima precisão nos testes iniciais', data: '18/01/2026' }
    ],
    anexos: [
      { id: 1, nome: 'especificacoes.pdf', tipo: 'PDF', tamanho: '890 KB' }
    ],
    objetivos: [
      'Alcançar precisão de 0.05mm',
      'Otimizar velocidade de impressão',
      'Reduzir custo de produção'
    ],
    tecnologias: ['Marlin', 'CAD', 'Slicing Software', 'Motores NEMA']
  },
  {
    id: 4,
    nome: 'Drone de Monitoramento',
    descricao: 'Drone autônomo para inspeção agrícola',
    estudante: 'Lucas Ferreira',
    orientador: 'Prof. Roberto Lima',
    dataInicio: '20/12/2025',
    prazo: '10/01/2026',
    status: 'concluido',
    progresso: 100,
    categoria: 'Drones',
    orcamento: 6000,
    gastoAtual: 5800,
    membros: [
      { id: 1, nome: 'Lucas Ferreira', papel: 'Líder do Projeto', avatar: 'LF' },
      { id: 2, nome: 'Carla Souza', papel: 'Visão Computacional', avatar: 'CS' },
      { id: 3, nome: 'Rafael Nunes', papel: 'Eletrônica', avatar: 'RN' }
    ],
    tarefas: [
      { id: 1, titulo: 'Montagem do drone', responsavel: 'Rafael Nunes', status: 'concluida', prazo: '28/12/2025' },
      { id: 2, titulo: 'Sistema de visão', responsavel: 'Carla Souza', status: 'concluida', prazo: '05/01/2026' },
      { id: 3, titulo: 'Voos de teste', responsavel: 'Lucas Ferreira', status: 'concluida', prazo: '09/01/2026' }
    ],
    comentarios: [
      { id: 1, autor: 'Prof. Roberto Lima', texto: 'Projeto exemplar! Parabéns à equipe', data: '10/01/2026' }
    ],
    anexos: [
      { id: 1, nome: 'relatorio-final.pdf', tipo: 'PDF', tamanho: '5.7 MB' },
      { id: 2, nome: 'video-demonstracao.mp4', tipo: 'VIDEO', tamanho: '45 MB' }
    ],
    objetivos: [
      'Voo autônomo com GPS',
      'Detecção de pragas por IA',
      'Mapeamento de áreas agrícolas'
    ],
    tecnologias: ['Pixhawk', 'OpenCV', 'Python', 'TensorFlow']
  },
  {
    id: 5,
    nome: 'Estação Meteorológica',
    descricao: 'Coleta e análise de dados climáticos',
    estudante: 'Ana Paula',
    orientador: 'Prof. Carlos Mendes',
    dataInicio: '08/01/2026',
    prazo: '20/02/2026',
    status: 'em-andamento',
    progresso: 30,
    categoria: 'Sensoriamento',
    orcamento: 2500,
    gastoAtual: 900,
    membros: [
      { id: 1, nome: 'Ana Paula', papel: 'Líder do Projeto', avatar: 'AP' },
      { id: 2, nome: 'Bruno Silva', papel: 'Análise de Dados', avatar: 'BS' }
    ],
    tarefas: [
      { id: 1, titulo: 'Aquisição de sensores', responsavel: 'Ana Paula', status: 'concluida', prazo: '12/01/2026' },
      { id: 2, titulo: 'Desenvolvimento de dashboard', responsavel: 'Bruno Silva', status: 'em-andamento', prazo: '30/01/2026' },
      { id: 3, titulo: 'Instalação externa', responsavel: 'Ana Paula', status: 'pendente', prazo: '10/02/2026' }
    ],
    comentarios: [
      { id: 1, autor: 'Ana Paula', texto: 'Sensores chegaram conforme especificado', data: '13/01/2026' }
    ],
    anexos: [
      { id: 1, nome: 'dados-iniciais.csv', tipo: 'DATA', tamanho: '125 KB' }
    ],
    objetivos: [
      'Monitoramento 24/7',
      'Previsão local do tempo',
      'Dashboard em tempo real'
    ],
    tecnologias: ['DHT22', 'BMP280', 'Node-RED', 'InfluxDB']
  },
  {
    id: 6,
    nome: 'Sistema de Irrigação Inteligente',
    descricao: 'Automação de irrigação baseada em sensores',
    estudante: 'Rafael Costa',
    orientador: 'Prof. Ana Costa',
    dataInicio: '12/01/2026',
    prazo: '05/03/2026',
    status: 'em-andamento',
    progresso: 20,
    categoria: 'Agricultura',
    orcamento: 3000,
    gastoAtual: 600,
    membros: [
      { id: 1, nome: 'Rafael Costa', papel: 'Líder do Projeto', avatar: 'RC' }
    ],
    tarefas: [
      { id: 1, titulo: 'Estudo de viabilidade', responsavel: 'Rafael Costa', status: 'concluida', prazo: '18/01/2026' },
      { id: 2, titulo: 'Compra de componentes', responsavel: 'Rafael Costa', status: 'em-andamento', prazo: '25/01/2026' },
      { id: 3, titulo: 'Protótipo inicial', responsavel: 'Rafael Costa', status: 'pendente', prazo: '15/02/2026' }
    ],
    comentarios: [],
    anexos: [],
    objetivos: [
      'Reduzir consumo de água em 40%',
      'Automação baseada em umidade do solo',
      'Integração com previsão do tempo'
    ],
    tecnologias: ['Arduino', 'Sensor de Umidade', 'Válvulas Solenoides', 'API Clima']
  }
];

const statusConfig = {
  'em-andamento': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-700', icon: Clock },
  'concluido': { label: 'Concluído', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'atrasado': { label: 'Atrasado', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: AlertCircle }
};

export function GerenciarProjetos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [activeTab, setActiveTab] = useState('visao-geral');

  const filteredProjetos = projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.estudante.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || projeto.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header com busca e filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar projetos ou estudantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option value="todos">Todos os Status</option>
          <option value="em-andamento">Em Andamento</option>
          <option value="concluido">Concluído</option>
          <option value="atrasado">Atrasado</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      {/* Grid de Projetos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjetos.map((projeto) => {
          const StatusIcon = statusConfig[projeto.status].icon;
          const tarefasConcluidas = projeto.tarefas.filter(t => t.status === 'concluida').length;
          const totalTarefas = projeto.tarefas.length;

          return (
            <button
              key={projeto.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedProjeto(projeto)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{projeto.nome}</h3>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{projeto.descricao}</p>
                  <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">{projeto.categoria}</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Estudante:</span>
                  <span className="font-medium">{projeto.estudante}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Equipe:</span>
                  <div className="flex -space-x-2">
                    {projeto.membros.slice(0, 3).map(membro => (
                      <div
                        key={membro.id}
                        className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs font-medium"
                        title={membro.nome}
                      >
                        {membro.avatar}
                      </div>
                    ))}
                    {projeto.membros.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                        +{projeto.membros.length - 3}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ListTodo className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Tarefas:</span>
                  <span className="font-medium">{tarefasConcluidas}/{totalTarefas} concluídas</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Orçamento:</span>
                  <span className="font-medium">R$ {projeto.gastoAtual.toLocaleString()} / R$ {projeto.orcamento.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">{projeto.progresso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${projeto.progresso}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-4 h-4" />
                  <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[projeto.status].color}`}>
                    {statusConfig[projeto.status].label}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Prazo: {projeto.prazo}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal de Detalhes do Projeto */}
      {selectedProjeto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProjeto(null)}>
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 text-gray-900">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedProjeto.nome}</h2>
                  <p className="text-gray-800 mb-3">{selectedProjeto.descricao}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-3 py-1 bg-white bg-opacity-30 rounded-full">{selectedProjeto.categoria}</span>
                    <span className={`text-xs px-3 py-1 rounded-full ${statusConfig[selectedProjeto.status].color}`}>
                      {statusConfig[selectedProjeto.status].label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProjeto(null)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 transition-colors">
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Editar</span>
                </button>
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Compartilhar</span>
                </button>
                <button className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center gap-2 transition-colors">
                  <Archive className="w-4 h-4" />
                  <span className="text-sm">Arquivar</span>
                </button>
              </div>
            </div>

            {/* Abas de Navegação */}
            <div className="border-b border-gray-200 px-6">
              <div className="flex gap-6 overflow-x-auto">
                {[
                  { id: 'visao-geral', label: 'Visão Geral', icon: Target },
                  { id: 'tarefas', label: 'Tarefas', icon: ListTodo },
                  { id: 'equipe', label: 'Equipe', icon: Users },
                  { id: 'anexos', label: 'Anexos', icon: Paperclip }
                ].map(tab => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-3 px-2 border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-yellow-400 text-yellow-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)]">
              {/* Aba: Visão Geral */}
              {activeTab === 'visao-geral' && (
                <div className="space-y-6">
                  {/* Cards de Métricas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-blue-600">Progresso</span>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{selectedProjeto.progresso}%</p>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${selectedProjeto.progresso}%` }} />
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-green-600">Tarefas</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {selectedProjeto.tarefas.filter(t => t.status === 'concluida').length}/{selectedProjeto.tarefas.length}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {Math.round((selectedProjeto.tarefas.filter(t => t.status === 'concluida').length / selectedProjeto.tarefas.length) * 100)}% concluídas
                      </p>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-purple-600">Orçamento</span>
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {Math.round((selectedProjeto.gastoAtual / selectedProjeto.orcamento) * 100)}%
                      </p>
                      <p className="text-xs text-purple-700 mt-1">
                        R$ {selectedProjeto.gastoAtual.toLocaleString()} usado
                      </p>
                    </div>
                  </div>

                  {/* Informações do Projeto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-yellow-500" />
                        Objetivos do Projeto
                      </h3>
                      <ul className="space-y-2">
                        {selectedProjeto.objetivos.map((objetivo, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{objetivo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Tecnologias Utilizadas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProjeto.tecnologias.map((tech, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-yellow-500" />
                      Cronograma
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-600">Data de Início</p>
                          <p className="font-semibold text-gray-900">{selectedProjeto.dataInicio}</p>
                        </div>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div
                              className="h-2 bg-yellow-400 rounded-full"
                              style={{ width: `${selectedProjeto.progresso}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600">Prazo Final</p>
                          <p className="font-semibold text-gray-900">{selectedProjeto.prazo}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comentários Recentes */}
                  {selectedProjeto.comentarios.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-yellow-500" />
                        Comentários Recentes
                      </h3>
                      <div className="space-y-3">
                        {selectedProjeto.comentarios.map(comentario => (
                          <div key={comentario.id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-medium text-gray-900">{comentario.autor}</span>
                              <span className="text-xs text-gray-500">{comentario.data}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comentario.texto}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Aba: Tarefas */}
              {activeTab === 'tarefas' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Todas as Tarefas</h3>
                    <span className="text-sm text-gray-600">
                      {selectedProjeto.tarefas.filter(t => t.status === 'concluida').length} de {selectedProjeto.tarefas.length} concluídas
                    </span>
                  </div>
                  {selectedProjeto.tarefas.map(tarefa => (
                    <div
                      key={tarefa.id}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                            tarefa.status === 'concluida' ? 'bg-green-100' :
                            tarefa.status === 'em-andamento' ? 'bg-blue-100' :
                            'bg-gray-200'
                          }`}>
                            {tarefa.status === 'concluida' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {tarefa.status === 'em-andamento' && <Clock className="w-4 h-4 text-blue-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium mb-1 ${tarefa.status === 'concluida' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {tarefa.titulo}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {tarefa.responsavel}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {tarefa.prazo}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tarefa.status === 'concluida' ? 'bg-green-100 text-green-700' :
                          tarefa.status === 'em-andamento' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {tarefa.status === 'concluida' ? 'Concluída' :
                           tarefa.status === 'em-andamento' ? 'Em Andamento' :
                           'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Aba: Equipe */}
              {activeTab === 'equipe' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Membros da Equipe</h3>
                  {selectedProjeto.membros.map(membro => (
                    <div
                      key={membro.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-semibold text-gray-900">
                        {membro.avatar}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{membro.nome}</h4>
                        <p className="text-sm text-gray-600">{membro.papel}</p>
                      </div>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ))}

                  {selectedProjeto.orientador && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-4 mt-6">Orientador</h3>
                      <div className="bg-yellow-50 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center font-semibold text-gray-900">
                          {selectedProjeto.orientador.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{selectedProjeto.orientador}</h4>
                          <p className="text-sm text-gray-600">Orientador do Projeto</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Aba: Anexos */}
              {activeTab === 'anexos' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Documentos e Arquivos</h3>
                  {selectedProjeto.anexos.length > 0 ? (
                    selectedProjeto.anexos.map(anexo => (
                      <div
                        key={anexo.id}
                        className="bg-gray-50 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          anexo.tipo === 'PDF' ? 'bg-red-100' :
                          anexo.tipo === 'IMG' ? 'bg-blue-100' :
                          anexo.tipo === 'VIDEO' ? 'bg-purple-100' :
                          anexo.tipo === 'CODE' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <FileText className={`w-6 h-6 ${
                            anexo.tipo === 'PDF' ? 'text-red-600' :
                            anexo.tipo === 'IMG' ? 'text-blue-600' :
                            anexo.tipo === 'VIDEO' ? 'text-purple-600' :
                            anexo.tipo === 'CODE' ? 'text-green-600' :
                            'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{anexo.nome}</h4>
                          <p className="text-sm text-gray-600">{anexo.tipo} • {anexo.tamanho}</p>
                        </div>
                        <button className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium">
                          Baixar
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Nenhum anexo disponível</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
