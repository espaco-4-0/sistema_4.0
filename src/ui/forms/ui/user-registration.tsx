import { useState } from "react";
import { Education, IfalAffiliation, Race } from "@/src/generated/prisma/enums";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Control, Controller, FieldValues, Path, useForm } from "react-hook-form";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

import { Button } from "../../components/ui/button";
import { DatePicker } from "../../components/ui/date-picker";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "../../components/ui/input-group";
import { cn } from "../../lib/utils";
import {
    DeficiencyOption,
    userRegistrationFrontSchema,
    type UserRegistrationFrontData,
} from "../schemas/user-registration-schema";

type SelectOption<T = string> = { value: T; label: string };

export const raceOptions: SelectOption<Race>[] = [
    { value: Race.BRANCA, label: "Branco" },
    { value: Race.PRETA, label: "Preto" },
    { value: Race.PARDA, label: "Pardo" },
    { value: Race.AMARELA, label: "Amarelo" },
    { value: Race.INDIGENA, label: "Indígena" },
];

export const educationOptions: SelectOption<Education>[] = [
    { value: Education.FUNDAMENTAL_INCOMPLETO, label: "Fundamental incompleto" },
    { value: Education.FUNDAMENTAL_COMPLETO, label: "Fundamental completo" },
    { value: Education.MEDIO_CURSANDO, label: "Ensino médio incompleto" },
    { value: Education.MEDIO_COMPLETO, label: "Ensino médio completo" },
    { value: Education.SUPERIOR_CURSANDO, label: "Superior incompleto" },
    { value: Education.SUPERIOR_COMPLETO, label: "Superior completo" },
];

export const ifalOptions: SelectOption<IfalAffiliation>[] = [
    { value: IfalAffiliation.ALUNO, label: "Aluno" },
    { value: IfalAffiliation.EX_ALUNO, label: "Ex-aluno" },
    { value: IfalAffiliation.NAO_ALUNO, label: "Não aluno" },
];

const deficiencyOptions: SelectOption<DeficiencyOption>[] = Object.values(DeficiencyOption).map((value) => ({
    value,
    label: value,
}));

const inputCn =
    "text-foreground! file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

function FieldWrapper<T extends FieldValues>({
    name,
    control,
    label,
    children,
}: Readonly<{
    name: Path<T>;
    control: Control<T>;
    label: string;
    children: (field: any, fieldState: any) => React.ReactNode;
}>) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="gap-1">
                    <FieldLabel className="text-[13px] text-foreground!" htmlFor={name}>
                        {label}
                    </FieldLabel>
                    {children(field, fieldState)}
                    {fieldState.error && <FieldError className="text-[11px]" errors={[fieldState.error]} />}
                </Field>
            )}
        />
    );
}

export function InputText<T extends FieldValues>({
    name,
    label,
    placeholder,
    control,
    type,
}: Readonly<{ name: Path<T>; label: string; placeholder: string; control: Control<T>; type?: string }>) {
    const [viewPassword, setViewPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <FieldWrapper name={name} control={control} label={label}>
            {(field, _) => (
                <InputGroup>
                    <InputGroupInput
                        className="py-5 placeholder:text-[13px] text-[13px] text-foreground!"
                        {...field}
                        id={name}
                        placeholder={placeholder}
                        type={isPassword && viewPassword ? "text" : type}
                    />
                    {isPassword && (
                        <InputGroupAddon align="inline-end">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewPassword((p) => !p)}
                                aria-label={viewPassword ? "Ocultar senha" : "Mostrar senha"}
                                className="cursor-pointer"
                            >
                                {viewPassword ? <Eye /> : <EyeClosed />}
                            </Button>
                        </InputGroupAddon>
                    )}
                </InputGroup>
            )}
        </FieldWrapper>
    );
}

function InputSelect<T extends FieldValues, TValue extends string>({
    name,
    control,
    label,
    options,
    placeholder,
    onChange,
}: Readonly<{
    name: Path<T>;
    control: Control<T>;
    label: string;
    options: SelectOption<TValue>[];
    placeholder?: string;
    onChange?: (value: TValue) => void;
}>) {
    return (
        <FieldWrapper name={name} control={control} label={label}>
            {(field) => (
                <Select
                    value={field.value}
                    onValueChange={(val: TValue) => {
                        field.onChange(val);
                        onChange?.(val);
                    }}
                >
                    <SelectTrigger className="w-full h-9 py-5 text-[13px]">
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-40">
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </FieldWrapper>
    );
}

export default function UserRegistrationForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<UserRegistrationFrontData>({
        resolver: zodResolver(userRegistrationFrontSchema as any),
        defaultValues: {
            completeName: "",
            email: "",
            password: "",
            confirmPassword: "",
            dateOfBirth: "",
            telephone: "",
            race: undefined,
            education: undefined,
            ifalAffiliation: undefined,
            deficiency: undefined,
            deficiencyNeeds: "",
            otherDeficiency: "",
        },
        mode: "onTouched",
    });

    const deficiencyValue = form.watch("deficiency");
    const isOtherDeficiency = deficiencyValue === DeficiencyOption.Outro;
    const isNenhuma = deficiencyValue === DeficiencyOption.Nenhuma;

    async function onSubmit(data: UserRegistrationFrontData) {
        setIsLoading(true);
        try {
            const { confirmPassword, otherDeficiency, deficiencyNeeds, ...rest } = data;
            const payload = {
                ...rest,
                deficiency: isOtherDeficiency ? otherDeficiency! : data.deficiency,
                ...(!isNenhuma && deficiencyNeeds?.trim() && { deficiencyNeeds: deficiencyNeeds.trim() }),
            };

            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                toast.error(body?.message ?? "Erro ao realizar cadastro. Tente novamente.");
                return;
            }

            toast.success("Cadastro realizado com sucesso! Você será redirecionado(a).");
            form.reset();
            router.push("/login");
        } catch {
            toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form id="register" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <InputText name="completeName" label="Nome Completo" placeholder="Ex.: João Silva" control={form.control} />
            <InputText name="email" label="E-mail" placeholder="nome@exemplo.com" control={form.control} type="email" />

            <div className="grid grid-cols-2 gap-3">
                <InputText
                    name="password"
                    label="Senha"
                    placeholder="Insira a senha"
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

                <FieldWrapper name="dateOfBirth" control={form.control} label="Data de Nascimento">
                    {(field, _) => (
                        <DatePicker
                            date={field.value ? new Date(field.value) : undefined}
                            onDateChange={(date) => field.onChange(date ? date.toISOString() : "")}
                            placeholder="dd/mm/aaaa"
                            className="py-5 placeholder:text-[13px] text-[13px] text-foreground!"
                        />
                    )}
                </FieldWrapper>

                <FieldWrapper name="telephone" control={form.control} label="Telefone">
                    {(field, _) => (
                        <IMaskInput
                            {...field}
                            data-slot="input"
                            id="telephone"
                            mask="(00) 00000-0000"
                            onAccept={(value: string) => field.onChange(value)}
                            onBlur={field.onBlur}
                            placeholder="(00) 00000-0000"
                            className={cn(inputCn)}
                        />
                    )}
                </FieldWrapper>

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
                    options={educationOptions}
                    placeholder="Selecione"
                />
                <InputSelect
                    name="ifalAffiliation"
                    control={form.control}
                    label="Vinculo com IFAL"
                    options={ifalOptions}
                    placeholder="Selecione"
                />
                <InputSelect
                    name="deficiency"
                    control={form.control}
                    label="Deficiência"
                    options={deficiencyOptions}
                    placeholder="Selecione"
                    onChange={(val) => {
                        if (val !== DeficiencyOption.Outro) {
                            form.setValue("otherDeficiency", "");
                            form.clearErrors("otherDeficiency");
                        }
                        if (val === DeficiencyOption.Nenhuma) {
                            form.setValue("deficiencyNeeds", "");
                            form.clearErrors("deficiencyNeeds");
                        }
                    }}
                />

                {isOtherDeficiency && (
                    <InputText
                        name="otherDeficiency"
                        label="Especifique a deficiência"
                        placeholder="Descreva"
                        control={form.control}
                    />
                )}
                {deficiencyValue && !isNenhuma && (
                    <InputText
                        name="deficiencyNeeds"
                        label="Necessidade especial"
                        placeholder="Ex.: Acompanhante"
                        control={form.control}
                    />
                )}
            </div>

            <Button
                className="w-full hover:cursor-pointer h-12 text-base font-semibold bg-black text-yellow-primary hover:bg-black/90 mt-2"
                type="submit"
                form="register"
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin w-4 h-4" />
                        Registrando...
                    </span>
                ) : (
                    "Registrar"
                )}
            </Button>
        </form>
    );
}
