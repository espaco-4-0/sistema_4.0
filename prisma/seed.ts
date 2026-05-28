import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { seedBadges } from "./seeds/badges";
import { seedBlog } from "./seeds/blog";
import { seedCursos } from "./seeds/cursos";
import { seedInventario } from "./seeds/inventario";
import { seedLocais } from "./seeds/locais";
import { seedProjetos } from "./seeds/projetos";
import { seedUsuarios } from "./seeds/usuarios";
import { seedVisits } from "./seeds/visits";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Iniciando a seed...\n");
    await seedUsuarios(prisma);
    await seedLocais(prisma);
    await seedCursos(prisma);
    await seedProjetos(prisma);
    await seedInventario(prisma);
    await seedBadges(prisma);
    await seedBlog(prisma);
    await seedVisits(prisma);

    console.log("\n Seed concluído!");
}

main()
    .catch((e) => {
        console.error("Erro no seed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
