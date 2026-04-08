import { VisitRequest } from "@/src/infra/modules/professor/agenda-visitas-mock";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/ui/components/ui/dialog";
import {
    confirmEmailReceived,
    denyByAdmin,
    sendToIfalApproval,
    setIfalDecision,
    startDocumentationAnalysis,
} from "@/src/ui/lib/visit-requests-storage";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { CheckCircle2, ChevronRight, FileCheck, MailCheck, ShieldCheck, ShieldX } from "lucide-react";

import { stageBadge, stageLabels } from "./constants";

type Props = {
    request: VisitRequest;
    denyReason: string;
    setDenyReason: (text: string) => void;
    refresh: (updater: () => VisitRequest[]) => void;
};

export function RequestCard({ request, denyReason, setDenyReason, refresh }: Props) {
    const visitDate = format(new Date(`${request.data}T00:00:00`), "dd/MM/yyyy", { locale: ptBR });

    const btnBase =
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none";

    const btnStatus = "disabled:opacity-50 disabled:cursor-not-allowed enabled:cursor-pointer";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 transition hover:border-yellow-300 hover:shadow-sm cursor-pointer"
                >
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h4 className="font-semibold text-gray-900">{request.instituicao}</h4>
                            <p className="text-sm text-gray-600">{request.responsavel}</p>
                            <p className="text-xs text-gray-500 mt-1">{visitDate}</p>
                        </div>
                        <ChevronRight className="size-4 text-gray-400" />
                    </div>
                </button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-gray-100 shrink-0">
                    <DialogHeader>
                        <DialogTitle>{request.instituicao}</DialogTitle>
                        <DialogDescription>{request.responsavel} • Painel do Admin (Professor)</DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <p>
                            <strong>Data:</strong> {visitDate}
                        </p>
                        <p>
                            <strong>Horário:</strong> {request.horaInicio} - {request.horaFim}
                        </p>
                        <p>
                            <strong>E-mail:</strong> {request.email}
                        </p>
                        <p>
                            <strong>WhatsApp:</strong> {request.whatsapp}
                        </p>
                        <p>
                            <strong>Alunos:</strong> {request.quantidade}
                        </p>
                        <p>
                            <strong>Status:</strong> {request.status}
                        </p>
                    </div>

                    <span
                        className={`w-fit text-xs px-2.5 py-1 rounded-full border font-semibold inline-flex ${stageBadge(request.processStage)}`}
                    >
                        {stageLabels[request.processStage]}
                    </span>

                    {request.mensagem && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                            <strong>Mensagem da escola:</strong> {request.mensagem}
                        </div>
                    )}

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Documentação anexada</p>
                        {request.documentos.length > 0 ? (
                            <ul className="space-y-1">
                                {request.documentos.map((doc) => (
                                    <li key={doc.id} className="text-xs text-gray-700">
                                        {doc.fileName} ({doc.fileSizeKb} KB)
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-red-600">Nenhum documento anexado.</p>
                        )}
                    </div>

                    {request.motivoNegativa && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                            <strong>Motivo da negativa:</strong> {request.motivoNegativa}
                        </div>
                    )}

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">Histórico do processo</p>
                        <div className="space-y-1.5">
                            {request.processLog.map((entry) => (
                                <p key={entry.id} className="text-xs text-gray-700">
                                    {format(new Date(entry.createdAt), "dd/MM HH:mm", { locale: ptBR })} -{" "}
                                    {entry.description}
                                </p>
                            ))}
                        </div>
                    </div>

                    {request.status === "pendente" && (
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-gray-800">Decisão do admin</p>

                            <textarea
                                value={denyReason}
                                onChange={(event) => setDenyReason(event.target.value)}
                                rows={2}
                                placeholder="Motivo obrigatório para negar (admin/IFAL)"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />

                            <div className="flex flex-wrap gap-2">
                                {request.processStage === "aguardando_email" && (
                                    <button
                                        onClick={() => refresh(() => confirmEmailReceived(request.id))}
                                        className={`${btnBase} ${btnStatus} bg-amber-600 hover:bg-amber-700 text-white`}
                                    >
                                        <MailCheck className="w-4 h-4" />
                                        Aprovar recebimento de e-mail
                                    </button>
                                )}

                                {(request.processStage === "email_recebido" ||
                                    request.processStage === "documentacao_em_analise") && (
                                    <>
                                        <button
                                            onClick={() => refresh(() => startDocumentationAnalysis(request.id, true))}
                                            className={`${btnBase} ${btnStatus} bg-blue-600 hover:bg-blue-700 text-white`}
                                        >
                                            <FileCheck className="w-4 h-4" />
                                            Aprovar documentação
                                        </button>

                                        <button
                                            onClick={() => refresh(() => startDocumentationAnalysis(request.id, false))}
                                            className={`${btnBase} ${btnStatus} bg-zinc-600 hover:bg-zinc-700 text-white`}
                                        >
                                            <ShieldX className="w-4 h-4" />
                                            Marcar documentação incompleta
                                        </button>

                                        <button
                                            onClick={() => refresh(() => sendToIfalApproval(request.id))}
                                            disabled={request.documentacaoStatus !== "conferida"}
                                            className={`${btnBase} ${btnStatus} bg-indigo-600 hover:bg-indigo-700 text-white`}
                                        >
                                            <ShieldCheck className="w-4 h-4" />
                                            Enviar para aprovação do IFAL
                                        </button>

                                        <button
                                            onClick={() => refresh(() => denyByAdmin(request.id, denyReason))}
                                            disabled={!denyReason.trim()}
                                            className={`${btnBase} ${btnStatus} bg-red-600 hover:bg-red-700 text-white`}
                                        >
                                            <ShieldX className="w-4 h-4" />
                                            Negar solicitação no admin
                                        </button>
                                    </>
                                )}

                                {request.processStage === "aguardando_aprovacao_ifal" && (
                                    <>
                                        <button
                                            onClick={() => refresh(() => setIfalDecision(request.id, true))}
                                            className={`${btnBase} ${btnStatus} bg-green-600 hover:bg-green-700 text-white`}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            IFAL aprovou
                                        </button>
                                        <button
                                            onClick={() =>
                                                refresh(() => setIfalDecision(request.id, false, denyReason))
                                            }
                                            disabled={!denyReason.trim()}
                                            className={`${btnBase} ${btnStatus} bg-red-600 hover:bg-red-700 text-white`}
                                        >
                                            <ShieldX className="w-4 h-4" />
                                            IFAL negou
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
