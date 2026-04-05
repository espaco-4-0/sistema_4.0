import { VisitProcessStage } from "@/src/infra/modules/professor/agenda-visitas-mock";

export type StageFilter = "todos" | VisitProcessStage;

export const stageLabels: Record<VisitProcessStage, string> = {
    aguardando_email: "Aguardando recebimento de e-mail",
    email_recebido: "Recebimento do e-mail concluído",
    documentacao_em_analise: "Documentação em análise",
    aguardando_aprovacao_ifal: "Aguardando aprovação IFAL",
    aprovado_ifal: "Aprovado pelo IFAL",
    negado_admin: "Negado no admin",
    negado_ifal: "Negado pelo IFAL",
};

export function stageBadge(stage: VisitProcessStage): string {
    if (stage === "aprovado_ifal") return "bg-green-100 text-green-700 border-green-200";
    if (stage === "negado_admin" || stage === "negado_ifal") return "bg-red-100 text-red-700 border-red-200";
    if (stage === "aguardando_aprovacao_ifal") return "bg-indigo-100 text-indigo-700 border-indigo-200";
    if (stage === "documentacao_em_analise") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-amber-100 text-amber-800 border-amber-200";
}
