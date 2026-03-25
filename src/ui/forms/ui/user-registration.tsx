import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";

import { Button } from "../../components/ui/button";
import { DatePicker } from "../../components/ui/date-picker";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import { cn } from "../../lib/utils";
import {
    DEFICIENCY_OPTIONS,
    EDUCATION_OPTIONS,
    IFAL_AFFILIATION_OPTIONS,
    raceOptions,
    userRegistrationSchema,
    type userRegistrationData,
} from "../schemas/user-registration-schema";

function InputText({
    name,
    label,
    placeholder,
    control,
    type,
}: Readonly<{
    name: string;
    label: string;
    placeholder: string;
    control: any;
    type?: string;
}>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel className="text-[13px]" htmlFor={name}>
                        {label}
                    </FieldLabel>
                    <Input
                        className="py-5 placeholder:text-[13px] text-[13px]"
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        type={type}
                    />
                    {fieldState.error && <FieldError className="text-[11px]" errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}

function InputSelect({
    name,
    control,
    label,
    options,
    placeholder,
}: Readonly<{ name: string; control: any; label: string; options: readonly string[]; placeholder?: string }>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel htmlFor={name} className="text-[13px]">
                        {label}
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full h-9 border-gray-200 text-xs bg-white py-5 placeholder:text-[13px] text-[13px]">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent className="bg-white max-h-40 ">
                            {options.map((opt) => (
                                <SelectItem className="capitalize" key={opt} value={opt}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {fieldState.error && <FieldError className="text-[11px]" errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}

export default function UserRegistrationForm() {
    const form = useForm<userRegistrationData>({
        resolver: zodResolver(userRegistrationSchema as any),
        defaultValues: {
            completeName: "",
            email: "",
            password: "",
            confirmPassword: "",
            dateOfBirth: "",
            whatsapp: "",
            race: undefined,
            education: undefined,
            ifal_afiliation: undefined,
            deficiency: undefined,
            deficiencyNeeds: "",
            deficiencyDetail: "",
        },
        mode: "onChange",
    });

    const deficiencyValue = form.watch("deficiency");

    function onSubmit(data: userRegistrationData) {
        console.log("DATA:", data);
    }

    return (
        <form id="register" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <InputText name="completeName" label="Nome Completo" placeholder="Ex.: João Silva" control={form.control} />

            <InputText name="email" label="E-mail" placeholder="nome@exemplo.com" control={form.control} type="email" />

            <div className="grid grid-cols-2 gap-3">
                <InputText
                    name="password"
                    label="Senha"
                    placeholder="Mín. 8 caracteres"
                    control={form.control}
                    type="password"
                />

                <InputText
                    name="confirmPassword"
                    label="Confirme a senha"
                    placeholder="Repita a senha"
                    control={form.control}
                    type="password"
                />

                <Controller
                    name="dateOfBirth"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="gap-1">
                            <FieldLabel htmlFor="dateOfBirth" className="text-[13px]">
                                Data de Nascimento
                            </FieldLabel>
                            <DatePicker
                                date={field.value ? new Date(field.value) : undefined}
                                onDateChange={(date) => field.onChange(date ? date.toISOString() : "")}
                                placeholder="dd/mm/aaaa"
                                className="py-5 placeholder:text-[13px] text-[13px]"
                            />
                            {fieldState.error && <FieldError className="text-[11px]" errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="whatsapp"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="gap-1">
                            <FieldLabel htmlFor="whatsapp" className="text-[13px]">
                                Whatsapp
                            </FieldLabel>
                            <IMaskInput
                                {...field}
                                data-slot="input"
                                id="whatsapp"
                                name={field.name}
                                mask="(00) 00000-0000"
                                onAccept={(value: string) => field.onChange(value)}
                                onBlur={field.onBlur}
                                placeholder="(00) 00000-0000"
                                className={cn(
                                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                                )}
                            />
                            {fieldState.error && <FieldError className="text-[11px]" errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <InputSelect
                    name="race"
                    control={form.control}
                    label="Raça"
                    options={raceOptions}
                    placeholder="Selecione"
                />

                <InputSelect
                    name="education"
                    control={form.control}
                    label="Escolaridade"
                    options={EDUCATION_OPTIONS}
                    placeholder="Selecione"
                />

                <InputSelect
                    name="ifal_afiliation"
                    control={form.control}
                    label="Vinculo com IFAL"
                    options={IFAL_AFFILIATION_OPTIONS}
                    placeholder="Selecione"
                />

                <InputSelect
                    name="deficiency"
                    control={form.control}
                    label="Deficiência"
                    options={DEFICIENCY_OPTIONS}
                    placeholder="Selecione"
                />

                {deficiencyValue !== undefined && (
                    <InputText
                        name="deficiencyNeeds"
                        label="Necessidade especial"
                        placeholder="Opcional"
                        control={form.control}
                    />
                )}

                {deficiencyValue === "Outro" && (
                    <InputText
                        name="deficiencyDetail"
                        label="Especifique a deficiência"
                        placeholder="Descreva"
                        control={form.control}
                    />
                )}
            </div>

            <Button
                className="w-full hover:cursor-pointer h-12 text-base font-semibold bg-black text-yellow-primary hover:bg-black/90 mt-2"
                type="submit"
                form="register"
            >
                Registrar
            </Button>
        </form>
    );
}
