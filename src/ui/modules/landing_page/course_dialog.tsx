"use client";

import { useSyncExternalStore } from "react";
import { Alert, AlertDescription } from "@/src/ui/components/ui/alert";
import { Button } from "@/src/ui/components/ui/button";
import { Checkbox } from "@/src/ui/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Separator } from "@/src/ui/components/ui/separator";
import {
    affiliationIfalOptions,
    consignorOrganOptions,
    courseRegisterSchema,
    educationOptions,
    raceOptions,
    type CourseRegisterType,
} from "@/src/ui/forms/schemas/course-registration-schema";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { AlertCircle, Cog } from "lucide-react";
import { Controller, FieldError, useForm, useWatch } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

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

interface CourseDialogProps {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
    readonly curso: string;
}

export const FormField = ({ label, error, children }: FormFieldProps) => (
    <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        {children}
        {error?.message && <p className="text-xs font-medium text-red-500">{error.message}</p>}
    </div>
);

export const FormSection = ({ title, children }: FormSectionProps) => (
    <section className="mt-8 space-y-4">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        <Separator />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
);

export default function CourseDialog({ open, setOpen, curso }: CourseDialogProps) {
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

    const deficiencyValue = useWatch({
        control,
        name: "deficiency",
    });

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

    const inputClass = "focus-visible:ring-2 focus-visible:ring-yellow-primary-light outline-none";
    const maskInputClass =
        inputClass + " flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

    if (!isMounted) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto p-0">
                <div className="relative p-6">
                    {isSubmitting && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
                            <Cog className="h-10 w-10 animate-spin text-yellow-primary" />
                            <p className="mt-2 text-sm font-semibold">Enviando...</p>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit(async (data) => {
                            console.log("Submit Data:", data);
                            await new Promise((resolve) => setTimeout(resolve, 2000));
                            toast.success("Inscrição realizada com sucesso!");
                            setOpen(false);
                        })}
                    >
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold">
                                Inscrição: <span className="text-yellow-muted">{curso}</span>
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">
                                        Preencha os dados abaixo para efetivar sua inscrição.
                                    </p>
                                    <p className="text-sm font-medium text-yellow-muted-light">
                                        Todos os campos são obrigatórios.
                                    </p>
                                    <Alert className="border-yellow-back-icon-dark bg-yellow-back-icon-light">
                                        <AlertCircle className="h-4 w-4" color="var(--color-yellow-icon)" />
                                        <AlertDescription className="font-semibold text-yellow-icon">
                                            A inscrição não garante sua entrada no curso.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </DialogDescription>
                        </DialogHeader>

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
                                            unmask={true}
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
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            onOpenChange={(o) => !o && field.onBlur()}
                                        >
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Selecione sua raça" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {raceOptions.map((r) => (
                                                    <SelectItem key={r} value={r} className="cursor-pointer">
                                                        {(r.charAt(0).toUpperCase() + r.slice(1)).replace("Nao", "Não")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>

                            <div className="flex items-end pb-2">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        className="cursor-pointer rounded-sm"
                                        id="pcd"
                                        checked={pcd}
                                        onCheckedChange={(v) =>
                                            setValue("deficiency", v ? "" : "Nenhuma", { shouldValidate: true })
                                        }
                                    />
                                    <Label htmlFor="pcd" className="cursor-pointer">
                                        Pessoa com deficiência
                                    </Label>
                                </div>
                            </div>

                            {pcd && (
                                <FormField label="Qual deficiência?" error={errors.deficiency}>
                                    <Input
                                        {...register("deficiency")}
                                        className={inputClass}
                                        placeholder="Ex: Deficiência visual parcial"
                                    />
                                </FormField>
                            )}
                        </FormSection>

                        <FormSection title="Documentação">
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
                                        className={`${inputClass} cursor-pointer text-start file:cursor-pointer file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-yellow-primary hover:file:text-yellow-primary-dark`}
                                        {...register(fileField.id)}
                                    />
                                </FormField>
                            ))}

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
                                <Input {...register("rg")} className={inputClass} placeholder="Ex: 1234567-8" />
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
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Selecione o órgão" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {consignorOrganOptions.map((o) => (
                                                    <SelectItem key={o} value={o} className="cursor-pointer">
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
                                            unmask={true}
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

                            <FormField label="Rua" error={errors.road}>
                                <Input
                                    {...register("road")}
                                    className={inputClass}
                                    placeholder="Ex: Av. Fernandes Lima"
                                />
                            </FormField>

                            <FormField label="Bairro" error={errors.neighborhood}>
                                <Input {...register("neighborhood")} className={inputClass} placeholder="Ex: Farol" />
                            </FormField>

                            <FormField label="Cidade" error={errors.city}>
                                <Input {...register("city")} className={inputClass} placeholder="Ex: Maceió" />
                            </FormField>

                            <FormField label="Estado (UF)" error={errors.state}>
                                <Input
                                    {...register("state")}
                                    className={inputClass}
                                    placeholder="Ex: AL"
                                    maxLength={2}
                                />
                            </FormField>
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
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Selecione sua escolaridade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {educationOptions.map((e) => (
                                                    <SelectItem key={e} value={e} className="cursor-pointer">
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
                                            <SelectTrigger className="cursor-pointer">
                                                <SelectValue placeholder="Selecione seu vínculo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {affiliationIfalOptions.map((a) => (
                                                    <SelectItem key={a} value={a} className="cursor-pointer">
                                                        {(a.charAt(0).toUpperCase() + a.slice(1)).replace(
                                                            "Nao",
                                                            "Não"
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </FormField>
                        </FormSection>

                        <div className="mt-10 flex justify-end gap-3">
                            <Button
                                type="button"
                                className="cursor-pointer"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="cursor-pointer bg-yellow-primary px-8 font-bold text-black hover:bg-yellow-primary/90"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <Cog className="h-4 w-4 animate-spin" />
                                        Enviando...
                                    </div>
                                ) : (
                                    "Finalizar Inscrição"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
