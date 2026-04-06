import { DatePicker } from "@/src/ui/components/ui/date-picker";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import {
    DEFICIENCY_OPTIONS,
    RG_ISSUER_OPTIONS,
    affiliationIfalOptions,
    educationOptions,
    raceOptions,
    type CourseRegisterType,
} from "@/src/ui/forms/schemas/course-registration-schema";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import { IMaskInput } from "react-imask";

import {
    FormField,
    inputClass as baseInputClass,
    maskInputClass as baseMaskInputClass,
} from "../../../landing_page/course_dialog";

const inputClass = baseInputClass + " h-10 mt-1 rounded-md w-full";
const maskInputClass = baseMaskInputClass + " h-10 mt-1";

export type FieldConfig = {
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

export const fieldConfigs: Record<string, FieldConfig[]> = {
    personal: [
        { label: "Nome Completo", name: "name", placeholder: "Ex: João Silva Santos" },
        { label: "E-mail", name: "email", type: "email", placeholder: "Ex: joao@exemplo.com" },
        {
            label: "Data de Nascimento",
            name: "birthDate",
            type: "date",
            placeholder: "Selecione sua data de nascimento",
        },
        {
            label: "WhatsApp",
            name: "phone",
            type: "masked",
            mask: "(00) 00000-0000",
            unmask: true,
            placeholder: "(00) 00000-0000",
        },
        {
            label: "Raça",
            name: "race",
            type: "select",
            options: raceOptions,
            placeholder: "Selecione sua raça",
            formatLabel: formatOption,
        },
        {
            label: "Deficiência",
            name: "deficiency",
            type: "select",
            options: DEFICIENCY_OPTIONS,
            placeholder: "Selecione a deficiência",
            onBlurTrigger: true,
        },
    ],
    documentation: [
        {
            label: "CPF (Número)",
            name: "cpf",
            type: "masked",
            mask: "000.000.000-00",
            placeholder: "000.000.000-00",
        },
        {
            label: "RG (Número)",
            name: "rg",
            type: "masked",
            mask: "00000000000000",
            unmask: true,
            lazy: true,
            placeholder: "Ex: 1234567",
        },
        {
            label: "Órgão Expedidor",
            name: "consignorOrgan",
            type: "select",
            options: RG_ISSUER_OPTIONS,
            placeholder: "Selecione o órgão",
            onBlurTrigger: true,
        },
        {
            label: "Data de Expedição",
            name: "consignorDate",
            type: "date",
            placeholder: "Selecione a data de expedição",
        },
    ],
    address: [
        {
            label: "CEP",
            name: "cep",
            type: "masked",
            mask: "00000-000",
            placeholder: "00000-000",
            useCepBlur: true,
        },
        {
            label: "Número",
            name: "houseNumber",
            type: "number",
            placeholder: "Ex: 123",
            valueAsNumber: true,
        },
        { label: "Rua", name: "road", placeholder: "Ex: Av. Fernandes Lima", colSpan: 2 },
        { label: "Bairro", name: "neighborhood", placeholder: "Ex: Farol" },
        { label: "Cidade", name: "city", placeholder: "Ex: Maceió" },
    ],
    education: [
        {
            label: "Escolaridade",
            name: "education",
            type: "select",
            options: educationOptions,
            placeholder: "Selecione",
            formatLabel: formatOption,
        },
        {
            label: "Vínculo com o IFAL",
            name: "affiliation",
            type: "select",
            options: affiliationIfalOptions,
            placeholder: "Selecione",
            formatLabel: formatOption,
        },
    ],
};

function formatOption(val: string) {
    return val.charAt(0).toUpperCase() + val.slice(1).replace("Nao", "Não");
}

export const ControlledField = ({ type, control, name, onBlurCallback, ...props }: any) => (
    <Controller
        name={name}
        control={control}
        render={({ field }) => {
            const { useCepBlur, ...fieldProps } = props;
            const handleBlur = () => {
                field.onBlur();
                onBlurCallback?.(field.value);
            };

            if (type === "masked") {
                return (
                    <IMaskInput
                        {...field}
                        {...fieldProps}
                        className={maskInputClass}
                        onAccept={field.onChange}
                        onBlur={handleBlur}
                    />
                );
            }

            if (type === "select") {
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
            }

            if (type === "date") {
                return (
                    <DatePicker
                        date={field.value instanceof Date ? field.value : undefined}
                        onDateChange={field.onChange}
                        placeholder={props.placeholder}
                        onBlur={field.onBlur}
                    />
                );
            }

            return <></>;
        }}
    />
);

export const getFieldRegister = (f: FieldConfig, register: UseFormRegister<CourseRegisterType>) => {
    if (f.type === "number") return register(f.name, { valueAsNumber: true });
    if (f.type) return undefined;
    return register(f.name);
};

export const Field = ({ label, error, type, control, name, register, ...props }: any) => (
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
