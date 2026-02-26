import * as v from "valibot";

export const raceOptions = ["branca", "preta", "parda", "amarela", "indigena", "nao informada"] as const;

export const DEFICIENCY_OPTIONS = [
    "Nenhuma",
    "Deficiência física",
    "Deficiência auditiva",
    "Deficiência visual",
    "Deficiência intelectual",
    "Deficiência múltipla",
    "Outro",
] as const;

export const RG_ISSUER_OPTIONS = [
    "SSP/AC",
    "SSP/AL",
    "SSP/AP",
    "SSP/AM",
    "SSP/BA",
    "SSP/CE",
    "SSP/DF",
    "SSP/ES",
    "SSP/GO",
    "SSP/MA",
    "SSP/MT",
    "SSP/MS",
    "SSP/MG",
    "SSP/PA",
    "SSP/PB",
    "SSP/PR",
    "SSP/PE",
    "SSP/PI",
    "SSP/RJ",
    "SSP/RN",
    "SSP/RS",
    "SSP/RO",
    "SSP/RR",
    "SSP/SC",
    "SSP/SP",
    "SSP/SE",
    "SSP/TO",
    "ORGÃO ESTRANGEIRO",
    "OUTRO",
] as const;

export const educationOptions = [
    "fundamental incompleto",
    "fundamental completo",
    "medio cursando",
    "medio completo",
    "superior cursando",
    "superior completo",
] as const;

const hasAtLeastTwoWords = (name: string) => {
    return (
        name
            .trim()
            .split(/\s+/)
            .filter((word) => word.length >= 2).length >= 2
    );
};

export const affiliationIfalOptions = ["aluno", "ex-aluno", "nao-aluno"] as const;

export const UF_OPTIONS = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
] as const;

const MIN_AGE = 14;
const MAX_AGE = 120;
const MAX_FILE_SIZE = 5_000_000; // 5MB

const requiredString = (msg: string) => v.pipe(v.string(), v.trim(), v.minLength(1, msg));

const digitsOnly = (msg: string) =>
    v.pipe(
        v.string(),
        v.transform((v) => v.replaceAll(/\D/g, "")),
        v.regex(/^\d+$/, msg)
    );

const validateCPF = (cpf: string) => {
    const clean = cpf.replaceAll(/\D/g, "");
    if (clean.length !== 11 || /^(\d)\1+$/.test(clean)) return false;

    const calc = (factor: number) => {
        let sum = 0;
        for (let i = 0; i < factor - 1; i++) {
            sum += Number(clean[i]) * (factor - i);
        }
        const rest = (sum * 10) % 11;
        return rest === 10 ? 0 : rest;
    };

    return calc(10) === Number(clean[9]) && calc(11) === Number(clean[10]);
};

const isValidAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age >= MIN_AGE && age <= MAX_AGE;
};

const BRAZIL_PHONE_REGEX = /^(?:[1-9]{2})(?:9\d{8}|\d{8})$/;

const isRepeatedSequence = (rg: string) => {
    const clean = rg.replaceAll(/\D/g, "");
    return /^(\d)\1+$/.test(clean);
};

const RG_REGEX = /^\d{5,14}$/;

const fileSchema = (msg: string) =>
    v.custom<FileList>(
        (val) =>
            val instanceof FileList &&
            val.length > 0 &&
            val[0].size <= MAX_FILE_SIZE &&
            ["image/jpeg", "image/png", "application/pdf"].includes(val[0].type),
        msg
    );

export const courseRegisterSchema = v.pipe(
    v.object({
        name: v.pipe(
            v.string(),
            v.trim(),
            v.minLength(5, "Informe nome e sobrenome"),
            v.check(hasAtLeastTwoWords, "Informe nome e sobrenome")
        ),

        email: v.pipe(
            v.string(),
            v.trim(),
            v.transform((v) => v.toLowerCase()),
            v.email("Email inválido")
        ),

        birthDate: v.pipe(
            v.date("Data de nascimento inválida"),
            v.maxValue(new Date(), "Data não pode ser futura"),
            v.check(isValidAge, `Idade deve estar entre ${MIN_AGE} e ${MAX_AGE} anos`)
        ),

        race: v.picklist(raceOptions, "Selecione uma opção"),

        phone: v.pipe(digitsOnly("Telefone inválido"), v.regex(BRAZIL_PHONE_REGEX, "Telefone inválido")),

        deficiency: v.picklist(DEFICIENCY_OPTIONS, "Selecione uma opção"),
        deficiencyDetail: v.optional(v.pipe(v.string(), v.trim())),
        companionNeeded: v.optional(v.pipe(v.string(), v.trim())),
        companionDetail: v.optional(v.pipe(v.string(), v.trim())),

        cpfFront: fileSchema("Anexe a frente do CPF"),
        cpfBack: fileSchema("Anexe o verso do CPF"),
        rgFront: fileSchema("Anexe a frente do RG"),
        rgBack: fileSchema("Anexe o verso do RG"),

        cpf: v.pipe(
            v.string("Por favor, informe o seu CPF"),
            v.transform((v) => v.replaceAll(/\D/g, "")),
            v.length(11, "CPF deve conter 11 dígitos"),
            v.check(validateCPF, "CPF inválido")
        ),

        rg: v.pipe(
            v.string(),
            v.trim(),
            v.transform((v) => v.replaceAll(/\D/g, "")),
            v.minLength(5, "RG deve conter entre 5 e 14 dígitos"),
            v.maxLength(14, "RG deve conter entre 5 e 14 dígitos"),
            v.regex(RG_REGEX, "RG deve conter apenas números"),
            v.check((rg) => !isRepeatedSequence(rg), "RG não pode ser uma sequência repetida")
        ),

        consignorOrgan: v.picklist(RG_ISSUER_OPTIONS, "Selecione uma opção"),

        consignorDate: v.date("Data inválida"),

        cep: v.pipe(
            v.string("Por favor, informe o seu CEP"),
            v.transform((v) => v.replaceAll(/\D/g, "")),
            v.regex(/^\d+$/, "CEP inválido"),
            v.length(8, "CEP deve conter 8 dígitos")
        ),

        houseNumber: v.pipe(v.number("Número inválido"), v.integer(), v.minValue(1, "Número inválido")),

        road: requiredString("Rua inválida"),
        neighborhood: requiredString("Bairro inválido"),
        city: requiredString("Cidade inválida"),

        state: v.picklist(UF_OPTIONS, "Estado inválido"),

        education: v.picklist(educationOptions, "Selecione uma opção"),
        affiliation: v.picklist(affiliationIfalOptions, "Selecione uma opção"),
    }),
    v.check(
        (data) => data.deficiency !== "Outro" || (data.deficiencyDetail ?? "").trim().length >= 2,
        "Informe qual é a deficiência (mínimo 2 caracteres)"
    ),
    v.check(
        (data) => data.deficiency === "Nenhuma" || !data.deficiency || (data.companionNeeded ?? "").trim().length >= 2,
        "Informe a sua necessidade (mínimo 2 caracteres)"
    )
);

export type CourseRegisterType = v.InferOutput<typeof courseRegisterSchema>;
