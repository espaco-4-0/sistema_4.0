import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "../../components/ui/button";
import { DatePicker } from "../../components/ui/date-picker";
import { Field, FieldError, FieldLabel } from "../../components/ui/field";
import { Input } from "../../components/ui/input";
import {
    DEFICIENCY_OPTIONS,
    EDUCATION_OPTIONS,
    IFAL_AFFILIATION_OPTIONS,
    raceOptions,
    userRegistrationSchema,
    type userRegistrationData,
} from "../schemas/user-registration-schema";

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
        <form id="register" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                name="completeName"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="completeName">Nome Completo</FieldLabel>
                        <Input {...field} id="completeName" placeholder="Insira seu nome aqui" />
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">E-mail</FieldLabel>
                        <Input {...field} id="email" type="email" placeholder="Insira seu email aqui" />
                        {fieldState.error && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <div className="grid grid-cols-2">
                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="password">Senha</FieldLabel>
                            <Input {...field} id="password" type="password" placeholder="Insira sua senha aqui" />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="confirmPassword"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="confirmPassword">Confirme a senha</FieldLabel>
                            <Input
                                {...field}
                                id="confirmPassword"
                                type="password"
                                placeholder="Insira sua senha aqui novamente"
                            />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="dateOfBirth"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="dateOfBirth">Data de Nascimento</FieldLabel>
                            <DatePicker
                                date={field.value ? new Date(field.value) : undefined}
                                onDateChange={(date) => field.onChange(date ? date.toISOString() : "")}
                                placeholder="Selecione sua data de nascimento"
                            />
                        </Field>
                    )}
                />

                <Controller
                    name="whatsapp"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="whatsapp">Whatsapp</FieldLabel>
                            <Input {...field} id="whatsapp" placeholder="(00) 00000-0000" />
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="race"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="race">Raça</FieldLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="capitalize w-full h-9 border-gray-200 text-xs bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {raceOptions.map((race) => (
                                        <SelectItem className="capitalize" key={race} value={race}>
                                            {race}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="education"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="education">Escolaridade</FieldLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="capitalize w-full h-9 border-gray-200 text-xs bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {EDUCATION_OPTIONS.map((education) => (
                                        <SelectItem className="capitalize" key={education} value={education}>
                                            {education}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="ifal_afiliation"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="ifal_afiliation">Vinculo com IFAL</FieldLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="capitalize w-full h-9 border-gray-200 text-xs bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {IFAL_AFFILIATION_OPTIONS.map((ifal_afiliation) => (
                                        <SelectItem
                                            className="capitalize"
                                            key={ifal_afiliation}
                                            value={ifal_afiliation}
                                        >
                                            {ifal_afiliation}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="deficiency"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor="deficiency">Deficiência</FieldLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="capitalize w-full h-9 border-gray-200 text-xs bg-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white max-h-40">
                                    {DEFICIENCY_OPTIONS.map((deficiency) => (
                                        <SelectItem className="capitalize" key={deficiency} value={deficiency}>
                                            {deficiency}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                {deficiencyValue !== undefined && (
                    <Controller
                        name="deficiencyNeeds"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="deficiencyNeeds">Necessidade especial</FieldLabel>
                                <Input
                                    {...field}
                                    id="deficiencyNeeds"
                                    placeholder="Informe alguma condição ou necessidade especial (opcional)"
                                />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                )}

                {deficiencyValue === "Outro" && (
                    <Controller
                        name="deficiencyDetail"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor="deficiencyDetail">Especifique a deficiência</FieldLabel>
                                <Input {...field} id="deficiencyDetail" placeholder="Descreva a deficiência" />
                                {fieldState.error && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                )}
            </div>

            <Button type="submit" form="register">
                Registrar
            </Button>
        </form>
    );
}
