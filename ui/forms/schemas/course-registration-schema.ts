import * as v from "valibot";

export const raceOptions = ["branca", "preta", "parda", "amarela", "indigena", "nao informada"] as const;
export const consignorOrganOptions = ["SSP/AL", "Policia Civil/AL", "Policia Militar/AL", "DETRAN/AL"] as const;
export const educationOptions = ["fundamental incompleto", "fundamental completo", "medio cursando", "medio completo", "superior cursando", "superior completo"] as const;
export const affiliationIfalOptions = ["aluno", "ex-aluno", "nao-aluno"] as const;

const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replaceAll(/[^\d]+/g, '');

  if (cleanCPF.length !== 11 || /^(\d)\1+$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum = sum + Number.parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== Number.parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + Number.parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if ((remainder === 10) || (remainder === 11)) remainder = 0;
  if (remainder !== Number.parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

const requiredString = (msg: string) =>
  v.pipe(v.string(), v.trim(), v.minLength(1, msg));

const digitsOnly = (msg: string) =>
  v.pipe(
    v.string(),
    v.transform((val) => val.replaceAll(/\D/g, "")),
    v.regex(/^\d+$/, msg)
  );

const fileSchema = (msg: string) =>
  v.custom<FileList>(
    (val) => val instanceof FileList && val.length > 0,
    msg
  );

export const courseRegisterSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(3, "Nome deve ter no mínimo 3 caracteres")),

  email: v.pipe(v.string(), v.trim(), v.email("Email inválido")),

  age: v.pipe(v.number("Digite uma idade válida"), v.integer(), v.minValue(0, "Idade deve ser positiva")),

  race: v.picklist(raceOptions, "Por favor, selecione uma opção"),

  number: v.pipe(
    digitsOnly("Digite um número válido"),
    v.minLength(11, "O número deve ter 11 dígitos (com DDD)")
  ),

  deficiency: requiredString('Informe se possui deficiência ou "Nenhuma"'),

  cpfFront: fileSchema("Anexe a frente do CPF"),
  cpfBack: fileSchema("Anexe o verso do CPF"),
  rgFront: fileSchema("Anexe a frente do RG"),
  rgBack: fileSchema("Anexe o verso do RG"),

  cpf: v.pipe(
    v.unknown(),
    v.transform((val) => (typeof val === "string" ? val : "")),
    v.transform((val) => val.replaceAll(/\D/g, "")),
    v.length(11, "CPF deve conter 11 dígitos"),
    v.check(validateCPF, "CPF inválido")
  ),

  rg: requiredString("RG inválido"),

  consignorOrgan: v.picklist(consignorOrganOptions, "Por favor, selecione uma opção"),

  consignorDate: v.date("Digite uma data válida"),

  cep: v.pipe(
    v.unknown(),
    v.transform((val) => (typeof val === "string" ? val : "")),
    v.transform((val) => val.replaceAll(/\D/g, "")),
    v.length(8, "CEP deve conter 8 dígitos")
  ),

  houseNumber: v.pipe(v.number("Número inválido"), v.integer(), v.minValue(1, "Número inválido")),

  road: requiredString("Rua inválida"),

  neighborhood: requiredString("Bairro inválido"),

  city: requiredString("Cidade inválida"),

  state: v.pipe(v.string(), v.length(2, "Use apenas a sigla (ex: AL)")),

  education: v.picklist(educationOptions, "Por favor, selecione uma opção"),

  affiliation: v.picklist(affiliationIfalOptions, "Por favor, selecione uma opção")
});

export type CourseRegisterType = v.InferOutput<typeof courseRegisterSchema>;
