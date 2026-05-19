import { InventoryCategory, PrismaClient } from "../../src/generated/prisma/client";

export async function seedInventario(prisma: PrismaClient) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@ifal.edu.br" } });

    const itens = [
        {
            name: "Notebook Dell Inspiron",
            category: InventoryCategory.EQUIPMENT,
            quantity: 30,
            unit: "un",
            location: "Laboratório 01",
            responsibleId: admin.id,
        },
        {
            name: "Projetor Epson X41+",
            category: InventoryCategory.EQUIPMENT,
            quantity: 5,
            unit: "un",
            location: "Almoxarifado",
            responsibleId: admin.id,
        },
        {
            name: "Cabo HDMI 2m",
            category: InventoryCategory.MATERIAL,
            quantity: 20,
            unit: "un",
            location: "Almoxarifado",
            responsibleId: admin.id,
        },
        {
            name: "Papel A4",
            category: InventoryCategory.MATERIAL,
            quantity: 10,
            unit: "resmas",
            location: "Secretaria",
            responsibleId: admin.id,
        },
        {
            name: "Licença Microsoft 365",
            category: InventoryCategory.SOFTWARE,
            quantity: 50,
            unit: "lic.",
            location: "Servidor",
            responsibleId: admin.id,
        },
    ];

    for (const item of itens) {
        await prisma.inventoryItem.create({ data: item }).catch(() => {});
    }

    console.log("Inventário criado Ame");
}
