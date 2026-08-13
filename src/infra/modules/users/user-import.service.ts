import { invalidateCacheNamespace } from "@/lib/cache";
import { Education, IfalAffiliation, Race } from "@/src/generated/prisma/enums";
import { prisma } from "@/src/infra/data/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { IMPORT_COLUMNS } from "./user-import.constants";
import { VALID_ROLES } from "./user.schema";

export { IMPORT_COLUMNS };

const SALT_ROUNDS = 12;

export const importRowSchema = z.object({
    nomeCompleto: z.string().trim().min(6, "Nome completo deve ter no mínimo 6 caracteres"),
    email: z.string().trim().toLowerCase().email("Email inválido"),
    senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(64),
    dataNascimento: z.string().trim().date("Data de nascimento inválida (use AAAA-MM-DD)"),
    telefone: z.string().trim().min(8, "Telefone inválido"),
    raca: z.enum(Race),
    educacao: z.enum(Education),
    ifalAfiliacao: z.enum(IfalAffiliation),
    role: z.enum(VALID_ROLES).optional(),
});

export const importUsersSchema = z.object({
    usuarios: z.array(z.record(z.string(), z.string())).min(1, "Envie ao menos uma linha").max(500, "Máximo de 500 linhas por importação"),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ImportFailure = {
    linha: number;
    email: string;
    motivo: string;
};

export type ImportResult = {
    importados: number;
    falhas: ImportFailure[];
};

function firstZodMessage(error: z.ZodError): string {
    const issue = error.issues[0];
    return issue ? `${issue.path.join(".") || "linha"}: ${issue.message}` : "Dados inválidos";
}

/**
 * Processa as linhas do CSV. Cada linha é validada isoladamente: uma linha ruim
 * não impede as outras de entrar, e o retorno diz exatamente qual falhou e por quê.
 */
export async function importUsers(rows: Record<string, string>[]): Promise<ImportResult> {
    const falhas: ImportFailure[] = [];
    const validas: ImportRow[] = [];

    rows.forEach((row, index) => {
        // +2: a linha 1 é o cabeçalho e a contagem exibida começa em 1.
        const linha = index + 2;
        const parsed = importRowSchema.safeParse(row);

        if (!parsed.success) {
            falhas.push({ linha, email: row.email ?? "", motivo: firstZodMessage(parsed.error) });
            return;
        }

        validas.push(parsed.data);
    });

    if (validas.length === 0) {
        return { importados: 0, falhas };
    }

    // Duplicatas dentro do próprio arquivo.
    const vistos = new Set<string>();
    const semDuplicatas = validas.filter((row, index) => {
        if (vistos.has(row.email)) {
            falhas.push({ linha: index + 2, email: row.email, motivo: "E-mail repetido no arquivo" });
            return false;
        }
        vistos.add(row.email);
        return true;
    });

    // Duplicatas contra o banco.
    const existentes = await prisma.user.findMany({
        where: { email: { in: semDuplicatas.map((row) => row.email) } },
        select: { email: true },
    });
    const jaCadastrados = new Set(existentes.map((user) => user.email));

    const paraCriar = semDuplicatas.filter((row) => {
        if (jaCadastrados.has(row.email)) {
            falhas.push({ linha: 0, email: row.email, motivo: "E-mail já cadastrado" });
            return false;
        }
        return true;
    });

    if (paraCriar.length === 0) {
        return { importados: 0, falhas };
    }

    const comHash = await Promise.all(
        paraCriar.map(async (row) => ({
            fullName: row.nomeCompleto,
            email: row.email,
            password: await bcrypt.hash(row.senha, SALT_ROUNDS),
            birthDate: new Date(row.dataNascimento),
            phone: row.telefone,
            race: row.raca,
            education: row.educacao,
            ifalAffiliation: row.ifalAfiliacao,
            role: row.role ?? "VISITOR",
            isActive: true,
        }))
    );

    const created = await prisma.user.createMany({ data: comHash, skipDuplicates: true });

    await invalidateCacheNamespace("users:list");

    return { importados: created.count, falhas };
}
