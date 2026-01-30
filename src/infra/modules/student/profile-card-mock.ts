export interface ProfileCardProps {
    name: string;
    role: string;
    course: string;
    matricula: string;
}

export interface ProfileCardFunctionProps extends ProfileCardProps {
    editorModeFunction: () => void;
    isEditing: boolean;
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

export const profileDataMock: ProfileData = {
    nome: "João",
    sobrenome: "Silva Santos",
    cpf: "123.456.789-00",
    rg: "12.345.678-9",
    dataNascimento: "15/03/2000",
    idade: "26 anos",
    email: "joao.silva@estudante.ifal.edu.br",
    senha: "******",
    telefone: "(82) 3221-4567",
    celular: "(82) 99876-5432",
    rua: "Rua das Flores",
    numero: "123",
    complemento: "Apto 45",
    bairro: "Centro",
    cidade: "Maceió",
    estado: "Alagoas",
    cep: "57000-000",
    instituicao: "IFAL - Instituto Federal de Alagoas",
    curso: "Análise e Desenvolvimento de Sistemas",
    matricula: "20231234567",
    role: "Estudante",
};
