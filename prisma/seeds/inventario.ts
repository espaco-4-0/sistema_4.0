import { InventoryCategory, PrismaClient } from "../../src/generated/prisma/client";

export async function seedInventario(prisma: PrismaClient) {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@ifal.edu.br" } });

    const itens = [
        {
            name: "Notebook Dell Inspiron",
            quantityAdded: 30,
            quantityInStock: 30,
            status: "AVAILABLE",
            categoryId: InventoryCategory.EQUIPMENT,
            productId: "default",
            responsibleId: admin.id,
        },
        {
            name: "Projetor Epson X41+",
            quantityAdded: 5,
            quantityInStock: 5,
            status: "AVAILABLE",
            categoryId: InventoryCategory.EQUIPMENT,
            productId: "default",
            responsibleId: admin.id,
        },
        {
            name: "Cabo HDMI 2m",
            quantityAdded: 20,
            quantityInStock: 20,
            status: "AVAILABLE",
            categoryId: InventoryCategory.MATERIAL,
            productId: "default",
            responsibleId: admin.id,
        },
        {
            name: "Papel A4",
            quantityAdded: 10,
            quantityInStock: 10,
            status: "AVAILABLE",
            categoryId: InventoryCategory.MATERIAL,
            productId: "default",
            responsibleId: admin.id,
        },
        {
            name: "Licença Microsoft 365",
            quantityAdded: 50,
            quantityInStock: 50,
            status: "AVAILABLE",
            categoryId: InventoryCategory.SOFTWARE,
            productId: "default",
            responsibleId: admin.id,
        },
    ];

    for (const item of itens) {
        await prisma.resource.create({ data: item }).catch(() => {});
    }

    console.log("Inventário criado Ame");
}
