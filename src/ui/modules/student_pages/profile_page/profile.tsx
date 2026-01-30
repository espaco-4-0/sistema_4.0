import { useEffect, useState } from "react";
import { createMockFileList, profileDataMock } from "@/src/infra/modules/student/profile-card-mock";
import { DatePicker } from "@/src/ui/components/ui/date-picker";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import {
    CourseRegisterType,
    DEFICIENCY_OPTIONS,
    RG_ISSUER_OPTIONS,
    UF_OPTIONS,
    affiliationIfalOptions,
    courseRegisterSchema,
    educationOptions,
    raceOptions,
} from "@/src/ui/forms/schemas/course-registration-schema";
import { useCep } from "@/src/ui/hooks/useCep";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { GraduationCap, Mail, MapPin, User } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import {
    FormField,
    inputClass as baseInputClass,
    maskInputClass as baseMaskInputClass,
} from "../../landing_page/course_dialog";
import { EditModeBar } from "./edit_card";
import { ProfileCard } from "./profile_card";

const inputClass = baseInputClass + " h-10 mt-1 rounded-md w-full";
const maskInputClass = baseMaskInputClass + " h-10 mt-1";

const ControlledField = ({ type, control, name, onBlurCallback, ...props }: any) => (
    <Controller
        name={name}
        control={control}
        render={({ field }) => {
            const handleBlur = () => {
                field.onBlur();
                onBlurCallback?.(field.value);
            };
            if (type === "masked")
                return (
                    <IMaskInput
                        {...field}
                        {...props}
                        className={maskInputClass}
                        onAccept={field.onChange}
                        onBlur={handleBlur}
                    />
                );
            if (type === "select")
                return (
                    <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        onOpenChange={(o) => !o && props.onBlurTrigger && field.onBlur()}
                    >
                        <SelectTrigger className="mt-1 cursor-pointer">
                            <SelectValue placeholder={props.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {props.options.map((opt: string) => (
                                <SelectItem key={opt} value={opt} className="cursor-pointer">
                                    {props.formatLabel ? props.formatLabel(opt) : opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            if (type === "date")
                return (
                    <DatePicker
                        date={field.value instanceof Date ? field.value : undefined}
                        onDateChange={field.onChange}
                        placeholder={props.placeholder}
                        onBlur={field.onBlur}
                    />
                );
            return <></>;
        }}
    />
);

const formatOption = (val: string) => val.charAt(0).toUpperCase() + val.slice(1).replace("Nao", "Não");

const getFieldRegister = (f: FieldConfig, register: any) => {
    if (f.type === "number") return register(f.name, { valueAsNumber: true });
    if (f.type) return undefined;
    return register(f.name);
};

type FieldConfig = {
    label: string;
    name: keyof CourseRegisterType;
    placeholder: string;
    type?: "masked" | "select" | "date" | "email" | "number";
    mask?: string;
    unmask?: boolean;
    lazy?: boolean;
    options?: readonly string[];
    formatLabel?: (val: string) => string;
    onBlurTrigger?: boolean;
    useCepBlur?: boolean;
    valueAsNumber?: boolean;
    colSpan?: number;
};

const fieldConfigs: Record<string, FieldConfig[]> = {
    personal: [
        { label: "Nome Completo", name: "name" as const, placeholder: "Ex: João Silva Santos" },
        { label: "E-mail", name: "email" as const, type: "email" as const, placeholder: "Ex: joao@exemplo.com" },
        {
            label: "Data de Nascimento",
            name: "birthDate" as const,
            type: "date" as const,
            placeholder: "Selecione sua data de nascimento",
        },
        {
            label: "WhatsApp",
            name: "phone" as const,
            type: "masked" as const,
            mask: "(00) 00000-0000",
            unmask: true,
            placeholder: "(00) 00000-0000",
        },
        {
            label: "Raça",
            name: "race" as const,
            type: "select" as const,
            options: raceOptions,
            placeholder: "Selecione sua raça",
            formatLabel: formatOption,
        },
        {
            label: "Deficiência",
            name: "deficiency" as const,
            type: "select" as const,
            options: DEFICIENCY_OPTIONS,
            placeholder: "Selecione a deficiência",
            onBlurTrigger: true,
        },
    ],
    documentation: [
        {
            label: "CPF (Número)",
            name: "cpf" as const,
            type: "masked" as const,
            mask: "000.000.000-00",
            placeholder: "000.000.000-00",
        },
        {
            label: "RG (Número)",
            name: "rg" as const,
            type: "masked" as const,
            mask: "00000000000000",
            unmask: true,
            lazy: true,
            placeholder: "Ex: 1234567",
        },
        {
            label: "Órgão Expedidor",
            name: "consignorOrgan" as const,
            type: "select" as const,
            options: RG_ISSUER_OPTIONS,
            placeholder: "Selecione o órgão",
            onBlurTrigger: true,
        },
        {
            label: "Data de Expedição",
            name: "consignorDate" as const,
            type: "date" as const,
            placeholder: "Selecione a data de expedição",
        },
    ],
    address: [
        {
            label: "CEP",
            name: "cep" as const,
            type: "masked" as const,
            mask: "00000-000",
            placeholder: "00000-000",
            useCepBlur: true,
        },
        {
            label: "Número",
            name: "houseNumber" as const,
            type: "number" as const,
            placeholder: "Ex: 123",
            valueAsNumber: true,
        },
        { label: "Rua", name: "road" as const, placeholder: "Ex: Av. Fernandes Lima", colSpan: 2 },
        { label: "Bairro", name: "neighborhood" as const, placeholder: "Ex: Farol" },
        { label: "Cidade", name: "city" as const, placeholder: "Ex: Maceió" },
    ],
    education: [
        {
            label: "Escolaridade",
            name: "education" as const,
            type: "select" as const,
            options: educationOptions,
            placeholder: "Selecione",
            formatLabel: formatOption,
        },
        {
            label: "Vínculo com o IFAL",
            name: "affiliation" as const,
            type: "select" as const,
            options: affiliationIfalOptions,
            placeholder: "Selecione",
            formatLabel: formatOption,
        },
    ],
};

const Field = ({ label, error, type, control, name, register, ...props }: any) => (
    <FormField label={label} error={error}>
        {type && control ? (
            <ControlledField type={type} control={control} name={name} {...props} />
        ) : (
            <Input
                {...(register || { value: props.value, onChange: props.onChange })}
                type={type || "text"}
                className={props.className || inputClass}
                placeholder={props.placeholder}
            />
        )}
    </FormField>
);

const formatDate = (d?: Date) => (d instanceof Date ? new Intl.DateTimeFormat("pt-BR").format(d) : "-");
const DisplayField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 py-2">{value || "-"}</p>
    </div>
);
const getDisplayValue = (f: any, data: any) => {
    if (f.type === "date") return formatDate(data[f.name]);
    if (f.formatLabel) return formatOption(data[f.name]);
    return data[f.name];
};

type SectionProps = {
    readonly title: string;
    readonly icon: React.ElementType;
    readonly children: React.ReactNode;
};

function Section({ title, icon: Icon, children }: SectionProps) {
    return (
        <div className="mt-6 lg:mt-8 2xl:mt-8 w-full p-5 lg:p-6 2xl:p-6 bg-white shadow-sm hover:shadow-md rounded-xl lg:rounded-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-1 text-lg lg:text-xl 2xl:text-lg font-semibold text-gray-800">
                <div className="flex justify-center items-center rounded-lg lg:rounded-xl size-9 lg:size-10 2xl:size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-2.5 lg:mr-3 2xl:mr-3 shadow-sm">
                    <Icon className="text-white size-4 lg:size-5 2xl:size-5" />
                </div>
                {title}
            </div>

            <div className="my-4 lg:my-5 2xl:my-4 h-px bg-gray-100" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 2xl:gap-5">{children}</div>
        </div>
    );
}

const sections = [
    {
        title: "Dados Pessoais",
        icon: User,
        fields: "personal",
        extra: (d: any) =>
            d.deficiency === "Outro" ? <DisplayField label="Qual deficiência?" value={d.deficiencyDetail} /> : null,
    },
    { title: "Documentação", icon: Mail, fields: "documentation" },
    {
        title: "Endereço",
        icon: MapPin,
        fields: "address",
        extra: (d: any) => <DisplayField label="UF" value={d.state} />,
    },
    {
        title: "Formação e Vínculo",
        icon: GraduationCap,
        fields: "education",
        extra: (_: any, m: string) => <DisplayField label="Matrícula" value={m} />,
    },
];

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedData, setSavedData] = useState<CourseRegisterType>(profileDataMock);
    const [matricula, setMatricula] = useState(profileDataMock.matricula);
    const [savedMatricula, setSavedMatricula] = useState(profileDataMock.matricula);

    const form = useForm<CourseRegisterType>({
        resolver: valibotResolver(courseRegisterSchema),
        mode: "onBlur",
        shouldFocusError: false,
        defaultValues: profileDataMock,
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        reset,
        getValues,
        formState: { errors },
    } = form;
    const deficiencyValue = useWatch({ control, name: "deficiency" });
    const isOtherDeficiency = deficiencyValue === "Outro";
    const handleCepBlur = useCep(setValue);

    useEffect(() => {
        const currentCpfFront = getValues("cpfFront");
        if (currentCpfFront && currentCpfFront instanceof FileList && currentCpfFront.length > 0) return;

        const fileList = createMockFileList();
        if (!fileList) return;

        setValue("cpfFront", fileList);
        setValue("cpfBack", fileList);
        setValue("rgFront", fileList);
        setValue("rgBack", fileList);
    }, [getValues, setValue]);

    const handleCancel = () => {
        reset(savedData);
        setMatricula(savedMatricula);
        setIsEditing(false);
    };

    const handleSave = handleSubmit(async (data) => {
        setIsSaving(true);
        try {
            await new Promise((r) => setTimeout(r, 1500));
            setSavedData(data);
            setSavedMatricula(matricula);
            reset(data);
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
    });

    const formDataValues = form.watch();

    return (
        <div className="px-4 pb-6 lg:px-8 lg:pb-8 2xl:px-15 2xl:pb-10">
            <ProfileCard
                name={formDataValues.name}
                role={formDataValues.affiliation}
                course={formDataValues.education}
                matricula={matricula}
                editorModeFunction={() => setIsEditing(true)}
                isEditing={isEditing}
            />

            {isEditing && <EditModeBar onCancel={handleCancel} onSave={handleSave} isSaving={isSaving} />}

            {isEditing ? (
                <form className="space-y-2 mt-8">
                    <Section title="Dados Pessoais" icon={User}>
                        {fieldConfigs.personal.map((f) => (
                            <Field
                                key={f.name}
                                {...f}
                                error={errors[f.name]}
                                control={control}
                                register={f.type ? undefined : register(f.name)}
                                onBlurCallback={f.useCepBlur ? handleCepBlur : undefined}
                            />
                        ))}
                        {isOtherDeficiency && (
                            <Field
                                label="Qual deficiência?"
                                error={errors.deficiencyDetail}
                                register={register("deficiencyDetail")}
                                placeholder="Ex: Deficiência visual parcial"
                            />
                        )}
                    </Section>
                    <Section title="Documentação" icon={Mail}>
                        {fieldConfigs.documentation.map((f) => (
                            <Field key={f.name} {...f} error={errors[f.name]} control={control} />
                        ))}
                    </Section>
                    <Section title="Endereço" icon={MapPin}>
                        {fieldConfigs.address.slice(0, 2).map((f) => (
                            <Field
                                key={f.name}
                                {...f}
                                error={errors[f.name]}
                                control={f.type === "masked" ? control : undefined}
                                register={getFieldRegister(f, register)}
                                onBlurCallback={f.useCepBlur ? handleCepBlur : undefined}
                            />
                        ))}
                        <div className="md:col-span-2">
                            <Field {...fieldConfigs.address[2]} error={errors.road} register={register("road")} />
                        </div>
                        <Field
                            {...fieldConfigs.address[3]}
                            error={errors.neighborhood}
                            register={register("neighborhood")}
                        />
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                                <Field {...fieldConfigs.address[4]} error={errors.city} register={register("city")} />
                            </div>
                            <div className="pl-2">
                                <FormField label="UF" error={errors.state}>
                                    <div className="mt-1">
                                        <ControlledField
                                            type="select"
                                            control={control}
                                            name="state"
                                            options={UF_OPTIONS}
                                            placeholder="UF"
                                        />
                                    </div>
                                </FormField>
                            </div>
                        </div>
                    </Section>
                    <Section title="Formação e Vínculo" icon={GraduationCap}>
                        {fieldConfigs.education.map((f) => (
                            <Field key={f.name} {...f} error={errors[f.name]} control={control} />
                        ))}
                        <Field
                            label="Matrícula"
                            value={matricula}
                            onChange={(e: any) => setMatricula(e.target.value)}
                            placeholder="Ex: 20231234567"
                        />
                    </Section>
                </form>
            ) : (
                <div className="space-y-2">
                    {sections.map((s) => (
                        <Section key={s.title} title={s.title} icon={s.icon}>
                            {fieldConfigs[s.fields].map((f: any) => (
                                <DisplayField key={f.name} label={f.label} value={getDisplayValue(f, formDataValues)} />
                            ))}
                            {s.extra?.(formDataValues, matricula)}
                        </Section>
                    ))}
                </div>
            )}
        </div>
    );
}
