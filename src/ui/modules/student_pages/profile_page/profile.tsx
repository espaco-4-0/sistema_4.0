import { useState } from "react";
import { ProfileData, profileDataMock } from "@/src/infra/modules/student/profile-card-mock";
import { Button } from "@/src/ui/components/ui/button";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Separator } from "@/src/ui/components/ui/separator";
import { GraduationCap, Loader2, Mail, MapPin, Save, User, X } from "lucide-react";
import { toast } from "sonner";

import { ProfileCard } from "./profile_card";

const INPUT_STYLES =
    "bg-white text-base lg:text-lg 2xl:text-base h-9 lg:h-10 2xl:h-10 border-gray-300 focus:border-yellow-primary focus:ring-yellow-primary/20 transition-all duration-200";

type FieldConfig = {
    key: keyof ProfileData;
    label: string;
    type?: string;
};

type SectionConfig = {
    title: string;
    icon: React.ElementType;
    fields: FieldConfig[];
};

const SECTIONS: SectionConfig[] = [
    {
        title: "Dados Pessoais",
        icon: User,
        fields: [
            { key: "nome", label: "NOME" },
            { key: "sobrenome", label: "SOBRENOME" },
            { key: "cpf", label: "CPF" },
            { key: "rg", label: "RG" },
            { key: "dataNascimento", label: "DATA DE NASCIMENTO" },
            { key: "idade", label: "IDADE" },
        ],
    },
    {
        title: "Informações de Contato",
        icon: Mail,
        fields: [
            { key: "email", label: "E-MAIL", type: "email" },
            { key: "senha", label: "SENHA", type: "password" },
            { key: "telefone", label: "TELEFONE" },
            { key: "celular", label: "CELULAR" },
        ],
    },
    {
        title: "Endereço",
        icon: MapPin,
        fields: [
            { key: "rua", label: "RUA" },
            { key: "numero", label: "NÚMERO" },
            { key: "complemento", label: "COMPLEMENTO" },
            { key: "bairro", label: "BAIRRO" },
            { key: "cidade", label: "CIDADE" },
            { key: "estado", label: "ESTADO" },
            { key: "cep", label: "CEP" },
        ],
    },
    {
        title: "Informações Acadêmicas",
        icon: GraduationCap,
        fields: [
            { key: "instituicao", label: "INSTITUIÇÃO DE ENSINO" },
            { key: "curso", label: "CURSO" },
            { key: "matricula", label: "MATRÍCULA" },
        ],
    },
];

function FormField({
    label,
    value,
    isEditing,
    type = "text",
    onChange,
}: {
    label: string;
    value: string;
    type?: string;
    isEditing: boolean;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex flex-col gap-1 group">
            <Label className="text-gray-500 text-xs lg:text-sm 2xl:text-xs font-medium transition-colors group-focus-within:text-yellow-primary">
                {label}
            </Label>
            {isEditing ? (
                <Input className={INPUT_STYLES} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
            ) : (
                <span className="text-sm lg:text-base 2xl:text-sm text-gray-800 py-2">{value}</span>
            )}
        </div>
    );
}

function Section({
    title,
    icon: Icon,
    fields,
    data,
    isEditing,
    onChange,
}: {
    title: string;
    icon: React.ElementType;
    fields: FieldConfig[];
    data: ProfileData;
    isEditing: boolean;
    onChange: (key: keyof ProfileData, value: string) => void;
}) {
    return (
        <div className="mt-6 lg:mt-8 2xl:mt-8 w-full p-5 lg:p-6 2xl:p-6 bg-white shadow-sm hover:shadow-md rounded-xl lg:rounded-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-1 text-lg lg:text-xl 2xl:text-lg font-semibold text-gray-800">
                <div className="flex justify-center items-center rounded-lg lg:rounded-xl size-9 lg:size-10 2xl:size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-2.5 lg:mr-3 2xl:mr-3 shadow-sm">
                    <Icon className="text-white size-4 lg:size-5 2xl:size-5" />
                </div>
                {title}
            </div>

            <Separator className="my-4 lg:my-5 2xl:my-4 bg-gray-100" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 2xl:gap-5">
                {fields.map(({ key, label, type }) => (
                    <FormField
                        key={key}
                        label={label}
                        type={type}
                        value={data[key]}
                        isEditing={isEditing}
                        onChange={(value) => onChange(key, value)}
                    />
                ))}
            </div>
        </div>
    );
}

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [initialData, setInitialData] = useState(profileDataMock);
    const [formData, setFormData] = useState(profileDataMock);

    const handleChange = (key: keyof ProfileData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(initialData);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise((r) => setTimeout(r, 1500));
            setInitialData(formData);
            setIsEditing(false);

            toast.success("Perfil atualizado com sucesso!", {
                description: "Suas informações foram salvas.",
            });
        } catch {
            toast.error("Erro ao salvar", {
                description: "Não foi possível salvar as alterações.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="px-4 pb-6 lg:px-8 lg:pb-8 2xl:px-15 2xl:pb-10">
            <ProfileCard
                name={`${formData.nome} ${formData.sobrenome}`}
                role={formData.role}
                course={formData.curso}
                matricula={formData.matricula}
                editorModeFunction={() => setIsEditing(true)}
                isEditing={isEditing}
            />

            {isEditing && (
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:p-5 2xl:p-4 mt-5 lg:mt-7 2xl:mt-7 gap-3 lg:gap-0 rounded-xl border-2 bg-yellow-back-icon-light border-yellow-primary-light text-yellow-icon-dark font-semibold shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-yellow-primary to-yellow-secondary" />
                            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-linear-to-br from-yellow-primary to-yellow-secondary animate-ping opacity-75" />
                        </div>
                        <span className="text-sm lg:text-base 2xl:text-sm">Modo de edição ativado</span>
                    </div>

                    <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            className="flex gap-2 h-9 lg:h-10 2xl:h-9 text-sm lg:text-md 2xl:text-sm flex-1 lg:flex-none hover:bg-gray-50 transition-all"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <X className="size-4" />
                            <span className="hidden sm:inline">Cancelar</span>
                        </Button>

                        <Button
                            className="flex gap-2 h-9 lg:h-10 2xl:h-9 text-sm lg:text-md 2xl:text-sm bg-yellow-secondary hover:bg-yellow-secondary-dark text-black flex-1 lg:flex-none shadow-md hover:shadow-lg transition-all"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin size-4" />
                                    <span className="hidden sm:inline">Processando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span className="hidden sm:inline">Salvar alterações</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {SECTIONS.map((section) => (
                <Section
                    key={section.title}
                    {...section}
                    data={formData}
                    isEditing={isEditing}
                    onChange={handleChange}
                />
            ))}
        </div>
    );
}
