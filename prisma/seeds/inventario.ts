import { CategoriaInventario, PrismaClient } from "../../src/generated/prisma/client";

export async function seedInventario(prisma: PrismaClient) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@ifal.edu.br" } });

    const itens = [
        {
            nome: "Notebook Dell Inspiron",
            categoria: CategoriaInventario.EQUIPAMENTO,
            quantidade: 30,
            unidade: "un",
            localizacao: "Laboratório 01",
            responsavelId: admin.id,
        },
        {
            nome: "Projetor Epson X41+",
            categoria: CategoriaInventario.EQUIPAMENTO,
            quantidade: 5,
            unidade: "un",
            localizacao: "Almoxarifado",
            responsavelId: admin.id,
        },
        {
            nome: "Cabo HDMI 2m",
            categoria: CategoriaInventario.MATERIAL,
            quantidade: 20,
            unidade: "un",
            localizacao: "Almoxarifado",
            responsavelId: admin.id,
        },
        {
            nome: "Papel A4",
            categoria: CategoriaInventario.MATERIAL,
            quantidade: 10,
            unidade: "resmas",
            localizacao: "Secretaria",
            responsavelId: admin.id,
        },
        {
            nome: "Licença Microsoft 365",
            categoria: CategoriaInventario.SOFTWARE,
            quantidade: 50,
            unidade: "lic.",
            localizacao: "Servidor",
            responsavelId: admin.id,
        },
    ];

    for (const item of itens) {
        await prisma.inventarioItem.create({ data: item }).catch(() => {});
    }

    console.log("Inventário criado Ame");
}
