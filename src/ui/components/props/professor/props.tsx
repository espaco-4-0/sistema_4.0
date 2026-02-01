export type StatusProjeto = "em-andamento" | "concluido" | "atrasado" | "pendente" | "cancelado";
export type StatusTarefa = "concluida" | "em-andamento" | "pendente" | "bloqueada";

export interface Membro {
    id: number;
    nome: string;
    email: string;
    papel: "admin" | "estudante" | "orientador" | "observador";
    avatar?: string;
}

export interface Anexo {
    id: number;
    nome: string;
    tipo: string;
    tamanhoBytes: number;
    url: string;
    dataUpload: string;
}

export interface Comentario {
    id: number;
    autorId: number;
    autorNome?: string;
    texto: string;
    data: string;
}

export interface Tarefa {
    id: number;
    titulo: string;
    descricao?: string;
    responsavelId?: number;
    status: StatusTarefa;
    prioridade: "baixa" | "media" | "alta";
    prazo: string;
    dataConclusao?: string;
}

export interface Projeto {
    id: number;
    nome: string;
    descricao: string;

    estudanteId: number;
    orientadorId?: number | null;

    dataInicio: string;
    prazo: string;
    dataConclusao?: string;

    status: StatusProjeto;
    progresso: number;

    categoria: string;
    objetivos: string[];
    tecnologias: string[];

    orcamento: number;
    gastoAtual: number;
    moeda: string;

    membros: Membro[];
    tarefas: Tarefa[];
    comentarios: Comentario[];
    anexos: Anexo[];

    criadoEm: string;
    atualizadoEm: string;
}

export type StatusProjetoResumo = "em-andamento" | "concluido" | "atrasado" | "pendente";
export type StatusTarefaResumo = "concluida" | "em-andamento" | "pendente";

export interface ProjetoTarefaResumo {
    id: number;
    titulo: string;
    responsavel: string;
    status: StatusTarefaResumo;
    prazo: string;
}

export interface ProjetoMembroResumo {
    id: number;
    nome: string;
    papel: string;
    avatar: string;
}

export interface ProjetoComentarioResumo {
    id: number;
    autor: string;
    texto: string;
    data: string;
}

export interface ProjetoAnexoResumo {
    id: number;
    nome: string;
    tipo: string;
    tamanho: string;
}

export interface ProjetoResumo {
    id: number;
    nome: string;
    descricao: string;
    estudante: string;
    orientador: string | null;
    dataInicio: string;
    prazo: string;
    status: StatusProjetoResumo;
    progresso: number;
    categoria: string;
    orcamento: number;
    gastoAtual: number;
    membros: ProjetoMembroResumo[];
    tarefas: ProjetoTarefaResumo[];
    comentarios: ProjetoComentarioResumo[];
    anexos: ProjetoAnexoResumo[];
    objetivos: string[];
    tecnologias: string[];
}

export interface ProjetoDetalhesModalProps {
    open: boolean;
    projeto: ProjetoResumo | null;
    activeTab: string;
    onTabChange: (tab: string) => void;
    onClose: () => void;
}
