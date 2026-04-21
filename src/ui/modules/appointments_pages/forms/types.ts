export type ParadaId = string;

export interface RoteiroStop {
    id: ParadaId;
    label: string;
    dur: number;
}
export type CalendarFormInput = {
    instituicao: string;
    professor: string;
    email: string;
    whatsapp: string;
    quantidade: string;
    hora: string;
    horaSaida: string;
    anexos: FileList | null;
    confirmacaoDocumentos: boolean;
    mensagem: string;
    paradas: string[];
};
