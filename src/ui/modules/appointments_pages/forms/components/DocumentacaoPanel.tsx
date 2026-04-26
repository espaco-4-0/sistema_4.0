import React from "react";
import { FileText } from "lucide-react";
import { UseFormReturn, useWatch } from "react-hook-form";

import type { CalendarFormInput } from "../types";

export type DocumentacaoPanelProps = {
    methods: UseFormReturn<CalendarFormInput>;
    onSubmit: (data: CalendarFormInput) => void;
    onBack?: () => void;
};

export const DocumentacaoPanel: React.FC<DocumentacaoPanelProps> = ({ methods, onSubmit, onBack }) => {
    const anexos = useWatch({ control: methods.control, name: "anexos" }) as FileList | null;
    const confirmed = useWatch({ control: methods.control, name: "confirmacaoDocumentos" }) as boolean | undefined;

    const filesCount = anexos ? anexos.length : 0;
    const canSubmit = filesCount > 0 && !!confirmed;

    return (
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-3">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                Anexe os documentos obrigatórios do pedido (ex.: ofício da escola, lista de alunos, autorização da
                direção). Documentos aceitos: PDF, PNG, JPG, JPEG, DOC, DOCX.
            </div>

            <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    {...methods.register("anexos")}
                    className="w-full border border-gray-200 rounded-md py-2 pl-9 pr-2 text-xs outline-none focus:border-yellow-primary file:mr-2 file:rounded file:border-0 file:bg-yellow-100 file:px-2 file:py-1 file:text-xs file:font-semibold"
                />
            </div>

            <label className="flex items-start gap-2 text-xs text-gray-700">
                <input type="checkbox" {...methods.register("confirmacaoDocumentos")} className="mt-0.5" />
                <span>Confirmo que a documentação anexada está correta para análise administrativa.</span>
            </label>

            {filesCount > 0 ? (
                <div className="rounded-md border border-gray-200 p-2 text-xs">
                    <p className="text-[11px] font-semibold text-gray-600 mb-1">Arquivos selecionados</p>
                    <ul className="space-y-1 max-h-48 overflow-auto">
                        {Array.from(anexos ?? []).map((file, idx) => (
                            <li
                                key={`${file.name}-${idx}`}
                                className="flex items-center justify-between text-[11px] text-gray-700"
                            >
                                <span className="truncate max-w-[70%]">{file.name}</span>
                                <span className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="rounded-md border border-dashed border-gray-200 p-3 text-xs text-gray-500">
                    Nenhum arquivo selecionado
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-1/2 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Voltar
                    </button>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`w-1/2 py-2 rounded-md font-bold text-[11px] uppercase shadow-sm ${
                            canSubmit
                                ? "bg-black text-yellow-primary hover:bg-gray-800"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Confirmar
                    </button>
                </div>

                {!canSubmit && (
                    <div className="text-[11px] text-red-600">
                        {filesCount === 0 ? "Anexe pelo menos 1 documento para prosseguir." : null}
                        {!confirmed ? (filesCount > 0 ? " Confirme a documentação para enviar." : null) : null}
                    </div>
                )}
            </div>
        </form>
    );
};

export default DocumentacaoPanel;
