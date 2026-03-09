/**
 * prisma/seed.ts
 * Ponto de entrada — chama cada módulo de seed na ordem correta.
 * Execute com: npx prisma db seed
 */

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { seedBadges } from "./seeds/badges";
import { seedCursos } from "./seeds/cursos";
import { seedInventario } from "./seeds/inventario";
import { seedLocais } from "./seeds/locais";
import { seedProjetos } from "./seeds/projetos";
import { seedUsuarios } from "./seeds/usuarios";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Iniciando a seed...\n");

    // A ordem importa: usuários e locais antes de cursos/projetos
    await seedUsuarios(prisma);
    await seedLocais(prisma);
    await seedCursos(prisma);
    await seedProjetos(prisma);
    await seedInventario(prisma);
    await seedBadges(prisma);

    console.log("\n🎉 Seed concluído!");
}

main()
    .catch((e) => {
        console.error("Erro no seed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
