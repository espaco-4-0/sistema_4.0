import { useEffect, useState } from "react";
import {
    DEFICIENCY_OPTIONS,
    courseRegisterSchema,
    type CourseRegisterType,
} from "@/src/ui/forms/schemas/course-registration-schema";
import { useCep } from "@/src/ui/hooks/useCep";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ProfileForm } from "./profile-form/profile-form";

type ProfileApiData = {
    id: string;
    nomeCompleto: string;
    email: string;
    role: "ADMIN" | "PROFESSOR" | "MONITOR" | "PESQUISADOR" | "VISITANTE";
    avatarUrl: string | null;
    telefone: string;
    dataNascimento: string;
    raca: "BRANCA" | "PRETA" | "PARDA" | "AMARELA" | "INDIGENA" | "NAO_INFORMADA";
    educacao:
        | "FUNDAMENTAL_INCOMPLETO"
        | "FUNDAMENTAL_COMPLETO"
        | "MEDIO_CURSANDO"
        | "MEDIO_COMPLETO"
        | "SUPERIOR_CURSANDO"
        | "SUPERIOR_COMPLETO";
    ifalAfiliacao: "ALUNO" | "EX_ALUNO" | "NAO_ALUNO" | "SERVIDOR";
    deficiencia: string | null;
    necessidadeEspecial: string | null;
};

const initialProfileData: CourseRegisterType & { matricula: string } = {
    name: "",
    email: "",
    birthDate: new Date("2000-01-01"),
    race: "nao informada",
    phone: "11999999999",
    deficiency: "Nenhuma",
    deficiencyDetail: undefined,
    companionNeeded: undefined,
    companionDetail: undefined,
    cpfFront: undefined as any,
    cpfBack: undefined as any,
    rgFront: undefined as any,
    rgBack: undefined as any,
    cpf: "00000000000",
    rg: "0000000",
    consignorOrgan: "SSP/AL",
    consignorDate: new Date("2018-01-01"),
    cep: "57000000",
    houseNumber: 1,
    road: "Não informado",
    neighborhood: "Não informado",
    city: "Não informado",
    state: "AL",
    education: "medio completo",
    affiliation: "nao-aluno",
    matricula: "-",
};

function createMockFileList() {
    if (globalThis.window === undefined) return undefined;
    const file = new File(["placeholder"], "documento.pdf", { type: "application/pdf" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    return dataTransfer.files;
}

function mapRaceToForm(value: ProfileApiData["raca"]): CourseRegisterType["race"] {
    const map: Record<ProfileApiData["raca"], CourseRegisterType["race"]> = {
        BRANCA: "branca",
        PRETA: "preta",
        PARDA: "parda",
        AMARELA: "amarela",
        INDIGENA: "indigena",
        NAO_INFORMADA: "nao informada",
    };
    return map[value];
}

function mapEducationToForm(value: ProfileApiData["educacao"]): CourseRegisterType["education"] {
    const map: Record<ProfileApiData["educacao"], CourseRegisterType["education"]> = {
        FUNDAMENTAL_INCOMPLETO: "fundamental incompleto",
        FUNDAMENTAL_COMPLETO: "fundamental completo",
        MEDIO_CURSANDO: "medio cursando",
        MEDIO_COMPLETO: "medio completo",
        SUPERIOR_CURSANDO: "superior cursando",
        SUPERIOR_COMPLETO: "superior completo",
    };
    return map[value];
}

function mapAffiliationToForm(value: ProfileApiData["ifalAfiliacao"]): CourseRegisterType["affiliation"] {
    const map: Record<ProfileApiData["ifalAfiliacao"], CourseRegisterType["affiliation"]> = {
        ALUNO: "aluno",
        EX_ALUNO: "ex-aluno",
        NAO_ALUNO: "nao-aluno",
        SERVIDOR: "nao-aluno",
    };
    return map[value];
}

function mapDeficiencyToForm(value: string | null): CourseRegisterType["deficiency"] {
    if (value && (DEFICIENCY_OPTIONS as readonly string[]).includes(value)) {
        return value as CourseRegisterType["deficiency"];
    }

    return "Nenhuma";
}

function mapRoleToMatricula(role: ProfileApiData["role"]) {
    const map: Record<ProfileApiData["role"], string> = {
        ADMIN: "ADM",
        PROFESSOR: "PRO",
        MONITOR: "MON",
        PESQUISADOR: "PES",
        VISITANTE: "VIS",
    };
    return map[role];
}

function mapFormToRace(value: CourseRegisterType["race"]): ProfileApiData["raca"] {
    const map: Record<CourseRegisterType["race"], ProfileApiData["raca"]> = {
        branca: "BRANCA",
        preta: "PRETA",
        parda: "PARDA",
        amarela: "AMARELA",
        indigena: "INDIGENA",
        "nao informada": "NAO_INFORMADA",
    };
    return map[value];
}

function mapFormToEducation(value: CourseRegisterType["education"]): ProfileApiData["educacao"] {
    const map: Record<CourseRegisterType["education"], ProfileApiData["educacao"]> = {
        "fundamental incompleto": "FUNDAMENTAL_INCOMPLETO",
        "fundamental completo": "FUNDAMENTAL_COMPLETO",
        "medio cursando": "MEDIO_CURSANDO",
        "medio completo": "MEDIO_COMPLETO",
        "superior cursando": "SUPERIOR_CURSANDO",
        "superior completo": "SUPERIOR_COMPLETO",
    };
    return map[value];
}

function mapFormToAffiliation(value: CourseRegisterType["affiliation"]): ProfileApiData["ifalAfiliacao"] {
    const map: Record<CourseRegisterType["affiliation"], ProfileApiData["ifalAfiliacao"]> = {
        aluno: "ALUNO",
        "ex-aluno": "EX_ALUNO",
        "nao-aluno": "NAO_ALUNO",
    };
    return map[value];
}

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isBlur, setIsBlur] = useState(true);
    const [savedData, setSavedData] = useState<CourseRegisterType>(initialProfileData);
    const [matricula, setMatricula] = useState(initialProfileData.matricula);
    const [savedMatricula, setSavedMatricula] = useState(initialProfileData.matricula);

    const form = useForm<CourseRegisterType>({
        resolver: valibotResolver(courseRegisterSchema),
        mode: "onBlur",
        shouldFocusError: false,
        defaultValues: initialProfileData,
    });

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        getValues,
        register,
        formState: { errors },
    } = form;

    const deficiencyValue = useWatch({ control, name: "deficiency" });
    const isOtherDeficiency = deficiencyValue === "Outro";
    const handleCepBlur = useCep(setValue);

    const applyMockDocuments = () => {
        const fileList = createMockFileList();
        if (!fileList) return;

        setValue("cpfFront", fileList);
        setValue("cpfBack", fileList);
        setValue("rgFront", fileList);
        setValue("rgBack", fileList);
    };

    useEffect(() => {
        const currentCpfFront = getValues("cpfFront");
        if (currentCpfFront && currentCpfFront instanceof FileList && currentCpfFront.length > 0) return;

        applyMockDocuments();
    }, [getValues, setValue]);

    useEffect(() => {
        async function loadProfile() {
            try {
                const response = await fetch("/api/profile/me", { cache: "no-store" });
                const body = (await response.json().catch(() => null)) as {
                    data?: ProfileApiData;
                    message?: string;
                } | null;

                if (!response.ok || !body?.data) {
                    toast.error(body?.message ?? "Falha ao carregar perfil");
                    return;
                }

                const data = body.data;
                const mappedData: CourseRegisterType = {
                    ...initialProfileData,
                    name: data.nomeCompleto,
                    email: data.email,
                    birthDate: new Date(data.dataNascimento),
                    race: mapRaceToForm(data.raca),
                    phone: data.telefone.replaceAll(/\D/g, ""),
                    deficiency: mapDeficiencyToForm(data.deficiencia),
                    deficiencyDetail: data.deficiencia ?? undefined,
                    companionNeeded: data.necessidadeEspecial ?? undefined,
                    education: mapEducationToForm(data.educacao),
                    affiliation: mapAffiliationToForm(data.ifalAfiliacao),
                };

                setSavedData(mappedData);
                reset(mappedData);
                applyMockDocuments();

                const generatedMatricula = `${mapRoleToMatricula(data.role)}-${data.id.slice(0, 6).toUpperCase()}`;
                setMatricula(generatedMatricula);
                setSavedMatricula(generatedMatricula);
            } catch {
                toast.error("Erro de conexão ao carregar perfil");
            }
        }

        loadProfile();
    }, [reset]);

    const handleCancel = () => {
        reset(savedData);
        applyMockDocuments();
        setMatricula(savedMatricula);
        setIsEditing(false);
    };

    const handleSave = handleSubmit(async (data) => {
        setIsSaving(true);
        try {
            const payload = {
                nomeCompleto: data.name,
                email: data.email,
                telefone: data.phone,
                dataNascimento: data.birthDate.toISOString().slice(0, 10),
                raca: mapFormToRace(data.race),
                educacao: mapFormToEducation(data.education),
                ifalAfiliacao: mapFormToAffiliation(data.affiliation),
                deficiencia: data.deficiency === "Nenhuma" ? null : data.deficiency,
                necessidadeEspecial: data.companionNeeded?.trim() || null,
            };

            const response = await fetch("/api/profile/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const body = (await response.json().catch(() => null)) as { message?: string } | null;

            if (!response.ok) {
                throw new Error(body?.message ?? "Não foi possível salvar");
            }

            setSavedData(data);
            setSavedMatricula(matricula);
            reset(data);
            applyMockDocuments();
            setIsEditing(false);

            toast.success("Perfil atualizado com sucesso!", {
                description: "Suas informações foram salvas.",
            });
        } catch (err) {
            toast.error("Erro ao salvar", {
                description: err instanceof Error ? err.message : "Não foi possível salvar as alterações.",
            });
        } finally {
            setIsSaving(false);
        }
    });

    return (
        <ProfileForm
            isEditing={isEditing}
            isSaving={isSaving}
            isBlur={isBlur}
            formDataValues={form.watch()}
            matricula={matricula}
            control={control}
            register={register}
            errors={errors}
            onCancel={handleCancel}
            onSubmit={handleSave}
            onToggleBlur={() => setIsBlur((prev) => !prev)}
            onEdit={() => setIsEditing(true)}
            onMatriculaChange={setMatricula}
            onCepBlur={handleCepBlur}
            isOtherDeficiency={isOtherDeficiency}
        />
    );
}
