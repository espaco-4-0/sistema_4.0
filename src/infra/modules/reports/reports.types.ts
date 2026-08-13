// Tipos puros, sem import de prisma: este arquivo é consumido pelo client e
// não pode arrastar código de servidor para o bundle.
export type ReportsData = {
    resumo: {
        projetosTotais: number;
        projetosConcluidos: number;
        estudantesAtivos: number;
        taxaConclusaoPercent: number;
        cursosAtivos: number;
        matriculas: number;
    };
    projetosPorMes: { mes: string; iniciados: number; concluidos: number }[];
    estudantesPorCurso: { curso: string; total: number }[];
    statusProjetos: { name: string; value: number; color: string }[];
    alunosMaisAtivos: { nome: string; projetos: number; presencas: number }[];
    taxaConclusao: { mes: string; taxa: number }[];
    presencaPorMes: { mes: string; alunos: number; presencas: number }[];
    tarefas: { mes: string; concluidas: number; pendentes: number }[];
};
