import type { CourseRegisterType } from "@/src/ui/forms/schemas/course-registration-schema";

export interface ProfileCardProps {
    name: string;
    role: string;
    course: string;
    matricula: string;
}

export interface ProfileCardFunctionProps extends ProfileCardProps {
    editorModeFunction: () => void;
    editorBlurFunction: () => void;
    isEditing: boolean;
    isBlur: boolean;
}

export interface ProfileData {
    nome: string;
    sobrenome: string;
    cpf: string;
    rg: string;
    dataNascimento: string;
    idade: string;
    email: string;
    senha: string;
    telefone: string;
    celular: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    instituicao: string;
    curso: string;
    matricula: string;
    role: string;
}

export const profileDataMock: CourseRegisterType & { matricula: string } = {
    name: "João Pedro Silva",
    email: "joao.silva@estudante.ifal.edu.br",
    birthDate: new Date("2000-03-15"),
    race: "parda",
    phone: "11987654321",
    deficiency: "Nenhuma",
    deficiencyDetail: undefined,
    cpfFront: undefined as any,
    cpfBack: undefined as any,
    rgFront: undefined as any,
    rgBack: undefined as any,
    cpf: "52998224725",
    rg: "123456789",
    consignorOrgan: "SSP/SP",
    consignorDate: new Date("2016-06-20"),
    cep: "57000000",
    houseNumber: 123,
    road: "Rua das Flores",
    neighborhood: "Centro",
    city: "Maceio",
    state: "AL",
    education: "superior completo",
    affiliation: "aluno",
    matricula: "20231234567",
};

export const createMockFileList = () => {
    if (globalThis.window === undefined) return undefined;
    const file = new File(["placeholder"], "documento.pdf", { type: "application/pdf" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer.files;
};
