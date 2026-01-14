"use client";

import { useSyncExternalStore, useState } from "react";
import { useForm, Controller, FieldError, useWatch } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";
import {
    courseRegisterSchema,
    type CourseRegisterType,
    raceOptions,
    consignorOrganOptions,
    educationOptions,
    affiliationIfalOptions,
} from "@/ui/forms/schemas/course-registration-schema";
import SubscribeSucess from "./subscribe_sucess";

function useIsMounted() {
    return useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );
}

interface FormFieldProps {
    readonly label: string;
    readonly error?: FieldError;
    readonly children: React.ReactNode;
}

interface FormSectionProps {
    readonly title: string;
    readonly children: React.ReactNode;
}

const FormField = ({ label, error, children }: FormFieldProps) => (
    <div className="space-y-1.5">
        <Label className="text-sm font-medium">{label}</Label>
        {children}
        {error?.message && (
            <p className="animate-in fade-in slide-in-from-top-1 text-xs font-medium text-red-500">{error.message}</p>
        )}
    </div>
);

const FormSection = ({ title, children }: FormSectionProps) => (
    <section className="mt-8 space-y-4 lg:mt-10">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Separator />
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>
    </section>
);

interface CourseFormProps {
    readonly course: string;
    readonly setCloseCourse: (value: boolean) => void;
}

export default function CourseForm({ course, setCloseCourse }: CourseFormProps) {
    const [formComplete, setFormComplete] = useState(false);
    const isMounted = useIsMounted();

    const form = useForm<CourseRegisterType>({
        resolver: valibotResolver(courseRegisterSchema),
        mode: "onBlur",
        defaultValues: {
            deficiency: "Nenhuma",
            name: "",
            email: "",
            number: "",
            road: "",
            city: "",
            neighborhood: "",
            state: "",
        },
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = form;

    const deficiencyValue = useWatch({ control, name: "deficiency" });
    const pcd = deficiencyValue !== "Nenhuma";

    const handleCepBlur = async (cep: string) => {
        const cleanCep = cep.replaceAll(/\D/g, "");
        if (cleanCep.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                setValue("road", data.logradouro || "", { shouldValidate: true });
                setValue("neighborhood", data.bairro || "", { shouldValidate: true });
                setValue("city", data.localidade || "", { shouldValidate: true });
                setValue("state", data.uf || "", { shouldValidate: true });
            }
        } catch {
            toast.error("Falha ao buscar CEP");
        }
    };

    const inputClass = "focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none h-10 mt-1 rounded-md w-full";

    const maskInputClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-yellow-400 outline-none mt-1";

    if (!isMounted) return null;

    return (
        <>
            {formComplete ? (
                <SubscribeSucess course={course} setCloseCourse={setCloseCourse} />
            ) : (
                <form
                    onSubmit={handleSubmit((data) => {
                        console.log("Submit Data:", data);
                        toast.success("Inscrição realizada com sucesso!");
                        setFormComplete(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    })}
                    className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-100 bg-white px-4 py-6 shadow-lg transition-all hover:shadow-xl md:p-8"
                >
                    <header className="space-y-2 border-b pb-4">
                        <h2 className="text-xl font-bold text-gray-900 md:text-2xl">Formulário de inscrição</h2>
                        <p className="text-sm text-gray-500">Preencha seus dados para se inscrever no curso.</p>
                    </header>

                    <div className="space-y-2">
                        <FormSection title="Dados Pessoais">
                            <FormField label="Nome Completo" error={errors.name}>
                                <Input
                                    {...register("name")}
                                    className={inputClass}
                                    placeholder="Ex: João Silva Santos"
                                />
                            </FormField>

                            <FormField label="E-mail" error={errors.email}>
                                <Input
                                    {...register("email")}
                                    type="email"
                                    className={inputClass}
                                    placeholder="Ex: joao@exemplo.com"
                                />
                            </FormField>

                            <FormField label="Idade" error={errors.age}>
                                <Input
                                    {...register("age", { valueAsNumber: true })}
                                    type="number"
                                    className={inputClass}
                                    placeholder="Ex: 25"
                                />
                            </FormField>

                            <FormField label="WhatsApp" error={errors.number}>
                                <Controller
                                    name="number"
                                    control={control}
                                    render={({ field }) => (
                                        <IMaskInput
                                            {...field}
                                            mask="(00) 00000-0000"
                                            className={maskInputClass}
                                            placeholder="(00) 00000-0000"
                                            onAccept={field.onChange}
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Raça" error={errors.race}>
                                <Controller
                                    name="race"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="mt-1 cursor-pointer">
                                                <SelectValue placeholder="Selecione sua raça" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {raceOptions.map((r) => (
                                                    <SelectItem key={r} value={r} className="cursor-pointer">
                                                        {r.charAt(0).toUpperCase() + r.slice(1).replace("Nao", "Não")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <div className="flex items-end pb-2">
                                <div className="flex h-10 items-center gap-2">
                                    <Checkbox
                                        id="pcd"
                                        checked={pcd}
                                        onCheckedChange={(v) =>
                                            setValue("deficiency", v ? "" : "Nenhuma", { shouldValidate: true })
                                        }
                                    />
                                    <Label htmlFor="pcd" className="cursor-pointer text-sm">
                                        Pessoa com deficiência
                                    </Label>
                                </div>
                            </div>

                            {pcd && (
                                <div className="md:col-span-2">
                                    <FormField label="Qual deficiência?" error={errors.deficiency}>
                                        <Input
                                            {...register("deficiency")}
                                            className={inputClass}
                                            placeholder="Ex: Deficiência visual parcial"
                                        />
                                    </FormField>
                                </div>
                            )}
                        </FormSection>

                        <FormSection title="Documentação">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
                                {(
                                    [
                                        { id: "cpfFront", label: "CPF – Frente" },
                                        { id: "cpfBack", label: "CPF – Verso" },
                                        { id: "rgFront", label: "RG – Frente" },
                                        { id: "rgBack", label: "RG – Verso" },
                                    ] as const
                                ).map((fileField) => (
                                    <FormField
                                        key={fileField.id}
                                        label={fileField.label}
                                        error={errors[fileField.id as keyof CourseRegisterType]}
                                    >
                                        <Input
                                            type="file"
                                            accept="image/*,.pdf"
                                            className={`${inputClass} cursor-pointer file:mr-4 file:rounded-md file:border-0 file:bg-yellow-50 file:px-4 file:py-1 file:text-xs file:font-semibold file:text-yellow-700 hover:file:bg-yellow-100`}
                                            {...register(fileField.id)}
                                        />
                                    </FormField>
                                ))}
                            </div>

                            <FormField label="CPF (Número)" error={errors.cpf}>
                                <Controller
                                    name="cpf"
                                    control={control}
                                    render={({ field }) => (
                                        <IMaskInput
                                            {...field}
                                            mask="000.000.000-00"
                                            className={maskInputClass}
                                            placeholder="000.000.000-00"
                                            onAccept={field.onChange}
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="RG (Número)" error={errors.rg}>
                                <Input {...register("rg")} className={inputClass} placeholder="Ex: 1234567-8" />
                            </FormField>

                            <FormField label="Órgão Expedidor" error={errors.consignorOrgan}>
                                <Controller
                                    name="consignorOrgan"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="mt-1 cursor-pointer">
                                                <SelectValue placeholder="Selecione o órgão" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {consignorOrganOptions.map((o) => (
                                                    <SelectItem className="cursor-pointer" key={o} value={o}>
                                                        {o}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <FormField label="Data de Expedição" error={errors.consignorDate}>
                                <Input
                                    {...register("consignorDate", { valueAsDate: true })}
                                    type="date"
                                    className={inputClass}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection title="Endereço">
                            <FormField label="CEP" error={errors.cep}>
                                <Controller
                                    name="cep"
                                    control={control}
                                    render={({ field }) => (
                                        <IMaskInput
                                            {...field}
                                            mask="00000-000"
                                            className={maskInputClass}
                                            placeholder="00000-000"
                                            onAccept={field.onChange}
                                            onBlur={() => {
                                                field.onBlur();
                                                handleCepBlur(field.value);
                                            }}
                                        />
                                    )}
                                />
                            </FormField>

                            <FormField label="Número" error={errors.houseNumber}>
                                <Input
                                    {...register("houseNumber", { valueAsNumber: true })}
                                    type="number"
                                    className={inputClass}
                                    placeholder="Ex: 123"
                                />
                            </FormField>

                            <div className="md:col-span-2">
                                <FormField label="Rua" error={errors.road}>
                                    <Input
                                        {...register("road")}
                                        className={inputClass}
                                        placeholder="Ex: Av. Fernandes Lima"
                                    />
                                </FormField>
                            </div>

                            <FormField label="Bairro" error={errors.neighborhood}>
                                <Input {...register("neighborhood")} className={inputClass} placeholder="Ex: Farol" />
                            </FormField>

                            <div className="grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <FormField label="Cidade" error={errors.city}>
                                        <Input {...register("city")} className={inputClass} placeholder="Ex: Maceió" />
                                    </FormField>
                                </div>
                                <FormField label="UF" error={errors.state}>
                                    <Input
                                        {...register("state")}
                                        className={inputClass}
                                        placeholder="AL"
                                        maxLength={2}
                                    />
                                </FormField>
                            </div>
                        </FormSection>

                        <FormSection title="Formação e Vínculo">
                            <FormField label="Escolaridade" error={errors.education}>
                                <Controller
                                    name="education"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="mt-1 cursor-pointer">
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {educationOptions.map((e) => (
                                                    <SelectItem className="cursor-pointer" key={e} value={e}>
                                                        {e.charAt(0).toUpperCase() + e.slice(1)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <FormField label="Vínculo com o IFAL" error={errors.affiliation}>
                                <Controller
                                    name="affiliation"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="mt-1 cursor-pointer">
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {affiliationIfalOptions.map((a) => (
                                                    <SelectItem key={a} className="cursor-pointer" value={a}>
                                                        {a.charAt(0).toUpperCase() + a.slice(1).replace("Nao", "Não")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                        </FormSection>
                    </div>

                    <footer className="mt-10 flex flex-col items-center gap-4">
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 w-full cursor-pointer bg-yellow-400 text-lg font-semibold text-white shadow-md transition-all hover:bg-yellow-500 active:scale-95 md:w-2/3"
                        >
                            {isSubmitting ? "Enviando..." : "Finalizar Inscrição"}
                        </Button>
                        <p className="text-xs text-gray-400">Certifique-se de que todos os dados estão corretos.</p>
                    </footer>
                </form>
            )}
        </>
    );
}
