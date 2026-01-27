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

export const profileCardMock: ProfileCardProps = {
    name: "João Silva",
    role: "Estudante",
    course: "Engenharia de Software",
    matricula: "2024001",
};
