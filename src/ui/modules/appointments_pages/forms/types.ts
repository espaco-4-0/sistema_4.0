export type ParadaId = string;

export interface RoteiroStop {
    id: ParadaId;
    label: string;
    dur: number;
}

export interface CalendarFormInput {
    instituicao: string;
    professor: string;
    email: string;
    whatsapp: string;
    quantidade: string;
    hora: string;
    horaSaida: string;
    paradas: ParadaId[];
    anexos: FileList | null;
    confirmacaoDocumentos: boolean;
    mensagem: string;
}
