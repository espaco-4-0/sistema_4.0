/**
 * Colunas do template de importação, na ordem em que aparecem no CSV.
 *
 * Fica separado do service porque o modal (client component) precisa dessa
 * lista, e o service importa prisma/bcrypt — que não podem ir para o bundle.
 */
export const IMPORT_COLUMNS = [
    "nomeCompleto",
    "email",
    "senha",
    "dataNascimento",
    "telefone",
    "raca",
    "educacao",
    "ifalAfiliacao",
    "role",
] as const;
