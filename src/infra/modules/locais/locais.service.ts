import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { NotFoundError } from "@/src/lib/errors/AppError";

import { CreateLocalInput, ListLocaisQueryInput, UpdateLocalInput } from "./locais.schema";

export const LOCATION_SELECT = {
    id: true,
    name: true,
    description: true,
    capacity: true,
    durationMin: true,
    isActive: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.LocationSelect;

export type LocationRecord = Prisma.LocationGetPayload<{ select: typeof LOCATION_SELECT }>;

export function mapLocationToFrontend(loc: LocationRecord) {
    return {
        id: loc.id,
        nome: loc.name,
        descricao: loc.description,
        capacidade: loc.capacity,
        duracaoMin: loc.durationMin,
        ativo: loc.isActive,
        createdAt: loc.createdAt,
        updatedAt: loc.updatedAt,
    };
}

export async function listLocais(query: ListLocaisQueryInput) {
    const where: Prisma.LocationWhereInput = {};

    if (!query.includeInactive) {
        where.isActive = true;
    }

    if (query.q) {
        where.name = { contains: query.q, mode: "insensitive" };
    }

    const locais = await prisma.location.findMany({
        where,
        orderBy: { name: "asc" },
        select: LOCATION_SELECT,
    });

    return locais.map(mapLocationToFrontend);
}

export async function createLocalRecord(input: CreateLocalInput) {
    const created = await prisma.location.create({
        data: {
            name: input.nome,
            description: input.descricao,
            capacity: input.capacidade,
            durationMin: input.duracaoMin,
            isActive: input.ativo,
        },
        select: LOCATION_SELECT,
    });

    return mapLocationToFrontend(created);
}

export async function updateLocalRecord(input: UpdateLocalInput) {
    const dataToUpdate: Prisma.LocationUpdateInput = {};
    if (input.nome !== undefined) dataToUpdate.name = input.nome;
    if (input.descricao !== undefined) dataToUpdate.description = input.descricao;
    if (input.capacidade !== undefined) dataToUpdate.capacity = input.capacidade;
    if (input.duracaoMin !== undefined) dataToUpdate.durationMin = input.duracaoMin;
    if (input.ativo !== undefined) dataToUpdate.isActive = input.ativo;

    try {
        const updated = await prisma.location.update({
            where: { id: input.id },
            data: dataToUpdate,
            select: LOCATION_SELECT,
        });

        return mapLocationToFrontend(updated);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new NotFoundError("Local", input.id);
        }
        throw error;
    }
}

export async function deleteLocalRecord(id: string) {
    try {
        await prisma.location.delete({ where: { id } });
        return { message: "Local removido com sucesso" };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            throw new NotFoundError("Local", id);
        }
        throw error;
    }
}
