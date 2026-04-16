import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/ui/components/ui/button";
import { DatePicker } from "@/src/ui/components/ui/date-picker";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import {
    DEFICIENCY_OPTIONS,
    RG_ISSUER_OPTIONS,
    UF_OPTIONS,
    affiliationIfalOptions,
    courseRegisterSchema,
    educationOptions,
    raceOptions,
    type CourseRegisterType,
} from "@/src/ui/forms/schemas/course-registration-schema";
import { useCep } from "@/src/ui/hooks/useCep";
import { useIsMounted } from "@/src/ui/hooks/useIsMounted";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Cog } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import { FormField, FormSection } from "../landing_page/course_dialog";
import SubscribeSucess from "./subscribe_sucess";

interface CourseFormProps {
    readonly course: string;
    readonly courseId: string;
    readonly setCloseCourse: (value: boolean) => void;
}

const LoadingState = ({ ref }: { ref: React.RefObject<HTMLDivElement | null> }) => (
    <div
        ref={ref}
        className="mx-auto flex h-auto w-full max-w-4xl flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center shadow-lg transition-all hover:shadow-xl md:p-12 lg:h-170 2xl:p-16"
    >
        <Cog className="h-16 w-16 animate-spin text-yellow-primary" />
        <span className="mt-4 text-sm font-semibold text-gray-400 uppercase">Enviando inscrição...</span>
    </div>
);

export default function CourseForm({ course, courseId, setCloseCourse }: CourseFormProps) {
    const [formComplete, setFormComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const isMounted = useIsMounted();
    const loadingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (loading && loadingRef.current) {
            loadingRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [loading]);

    const form = useForm<CourseRegisterType>({
        resolver: valibotResolver(courseRegisterSchema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            road: "",
            city: "",
            neighborhood: "",
            state: undefined,
            deficiency: undefined,
            deficiencyDetail: "",
            companionNeeded: "",
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
    const isOtherDeficiency = deficiencyValue === "Outro";
    const needsCompanionInfo = Boolean(deficiencyValue && deficiencyValue !== "Nenhuma");

    const handleCepBlur = useCep(setValue);

    const inputClass =
        "focus-visible:ring-2 focus-visible:ring-yellow-primary outline-none h-10 mt-1 rounded-md w-full";

    const maskInputClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-yellow-primary outline-none mt-1";

    if (!isMounted) return null;

    const renderContent = () => {
        if (formComplete) {
            return <SubscribeSucess course={course} setCloseCourse={setCloseCourse} />;
        }
        if (loading) {
            return <LoadingState ref={loadingRef} />;
        }

        return (
            <form
                onSubmit={handleSubmit(async (data) => {
                    try {
                        setLoading(true);

                        const response = await fetch(`/api/courses/${courseId}/subscribe`, {
                            method: "POST",
                        });

                        if (!response.ok) {
                            const payload = (await response.json().catch(() => ({}))) as { message?: string };
                            throw new Error(payload.message ?? "Erro ao enviar inscricao");
                        }

                        toast.success("Inscrição realizada com sucesso!");
                        setFormComplete(true);

                        window.scrollTo({ top: 0, behavior: "smooth" });
                    } catch (error) {
                        const message = error instanceof Error ? error.message : "Erro ao enviar inscricao";
                        toast.error(message);
                    } finally {
                        setLoading(false);
                    }
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
                            <Input {...register("name")} className={inputClass} placeholder="Ex: João Silva Santos" />
                        </FormField>

                        <FormField label="E-mail" error={errors.email}>
                            <Input
                                {...register("email")}
                                type="email"
                                className={inputClass}
                                placeholder="Ex: joao@exemplo.com"
                            />
                        </FormField>

                        <FormField label="Data de Nascimento" error={errors.birthDate}>
                            <Controller
                                name="birthDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value instanceof Date ? field.value : undefined}
                                        onDateChange={field.onChange}
                                        placeholder="Selecione sua data de nascimento"
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField label="WhatsApp" error={errors.phone}>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <IMaskInput
                                        {...field}
                                        mask="(00) 00000-0000"
                                        unmask={true}
                                        className={maskInputClass}
                                        placeholder="(00) 00000-0000"
                                        onAccept={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField label="Raça" error={errors.race}>
                            <Controller
                                name="race"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        onOpenChange={(o) => !o && field.onBlur()}
                                    >
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

                        <FormField label="Deficiência" error={errors.deficiency}>
                            <Controller
                                name="deficiency"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || ""}
                                        onOpenChange={(o) => !o && field.onBlur()}
                                    >
                                        <SelectTrigger className="mt-1 cursor-pointer">
                                            <SelectValue placeholder="Selecione a deficiência" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEFICIENCY_OPTIONS.map((option) => (
                                                <SelectItem key={option} value={option} className="cursor-pointer">
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormField>

                        {isOtherDeficiency && (
                            <FormField label="Qual deficiência?" error={errors.deficiencyDetail}>
                                <Input
                                    {...register("deficiencyDetail")}
                                    className={inputClass}
                                    placeholder="Ex: Deficiência visual parcial"
                                />
                            </FormField>
                        )}

                        {needsCompanionInfo && (
                            <FormField label="Qual a sua necessidade?" error={errors.companionNeeded}>
                                <Input
                                    {...register("companionNeeded")}
                                    className={inputClass}
                                    placeholder="Ex: Acompanhante, tradutor de libras"
                                />
                            </FormField>
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
                                        className={`${inputClass} className="h-10 file:leading-none" cursor-pointer leading-none file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-yellow-50 file:px-4 file:py-1 file:text-xs file:font-semibold file:text-yellow-700 hover:file:bg-yellow-100`}
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
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField label="RG (Número)" error={errors.rg}>
                            <Controller
                                name="rg"
                                control={control}
                                render={({ field }) => (
                                    <IMaskInput
                                        {...field}
                                        mask="00000000000000"
                                        unmask={true}
                                        lazy={true}
                                        className={maskInputClass}
                                        placeholder="Ex: 1234567"
                                        onAccept={field.onChange}
                                        onBlur={field.onBlur}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField label="Órgão Expedidor" error={errors.consignorOrgan}>
                            <Controller
                                name="consignorOrgan"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        onOpenChange={(o) => !o && field.onBlur()}
                                    >
                                        <SelectTrigger className="mt-1 cursor-pointer">
                                            <SelectValue placeholder="Selecione o órgão" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RG_ISSUER_OPTIONS.map((o) => (
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
                            <Controller
                                name="consignorDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        date={field.value instanceof Date ? field.value : undefined}
                                        onDateChange={field.onChange}
                                        placeholder="Selecione a data de expedição"
                                        onBlur={field.onBlur}
                                    />
                                )}
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
                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            onOpenChange={(o) => !o && field.onBlur()}
                                        >
                                            <SelectTrigger className="mt-1 cursor-pointer">
                                                <SelectValue placeholder="UF" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {UF_OPTIONS.map((uf) => (
                                                    <SelectItem key={uf} value={uf} className="cursor-pointer">
                                                        {uf}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
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
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        onOpenChange={(o) => !o && field.onBlur()}
                                    >
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
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        onOpenChange={(o) => !o && field.onBlur()}
                                    >
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
                        disabled={isSubmitting || loading}
                        className="h-12 w-full cursor-pointer bg-yellow-secondary text-lg font-semibold text-black shadow-md transition-all hover:bg-yellow-secondary-dark active:scale-95 md:w-2/3"
                    >
                        {isSubmitting ? "Enviando..." : "Finalizar Inscrição"}
                    </Button>
                    <p className="text-xs text-gray-400">Certifique-se de que todos os dados estão corretos.</p>
                </footer>
            </form>
        );
    };

    return renderContent();
}
