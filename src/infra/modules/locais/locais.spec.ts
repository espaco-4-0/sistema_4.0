import { Prisma } from "@/src/generated/prisma/client";
import { prisma } from "@/src/infra/data/prisma";
import { NotFoundError } from "@/src/lib/errors/AppError";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createLocalSchema, deleteLocalQuerySchema, listLocaisQuerySchema, updateLocalSchema } from "./locais.schema";
import {
    LOCATION_SELECT,
    LocationRecord,
    createLocalRecord,
    deleteLocalRecord,
    listLocais,
    mapLocationToFrontend,
    updateLocalRecord,
} from "./locais.service";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        location: {
            findMany: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

describe("locais module", () => {
    const fixedDate = new Date("2026-01-15T12:00:00.000Z");

    const sampleLocationRecord: LocationRecord = {
        id: "loc-1",
        name: "Laboratório 1",
        description: "Laboratório de Informática",
        capacity: 30,
        durationMin: 60,
        isActive: true,
        createdAt: fixedDate,
        updatedAt: fixedDate,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("locais.schema", () => {
        describe("listLocaisQuerySchema", () => {
            it("aplica valores padrão quando objeto está vazio", () => {
                const parsed = listLocaisQuerySchema.parse({});
                expect(parsed).toEqual({
                    includeInactive: false,
                    q: undefined,
                });
            });

            it("converte includeInactive string 'true' e boolean true para true", () => {
                expect(listLocaisQuerySchema.parse({ includeInactive: "true" }).includeInactive).toBe(true);
                expect(listLocaisQuerySchema.parse({ includeInactive: true }).includeInactive).toBe(true);
            });

            it("converte includeInactive 'false' ou undefined para false", () => {
                expect(listLocaisQuerySchema.parse({ includeInactive: "false" }).includeInactive).toBe(false);
                expect(listLocaisQuerySchema.parse({}).includeInactive).toBe(false);
            });

            it("normaliza parâmetro q com espaços em branco para undefined", () => {
                expect(listLocaisQuerySchema.parse({ q: "" }).q).toBeUndefined();
                expect(listLocaisQuerySchema.parse({ q: "   " }).q).toBeUndefined();
                expect(listLocaisQuerySchema.parse({ q: "  lab  " }).q).toBe("lab");
            });
        });

        describe("createLocalSchema", () => {
            it("valida payload completo com sucesso", () => {
                const input = {
                    nome: "  Auditório Principal  ",
                    descricao: "Espaço para palestras",
                    capacidade: "150",
                    duracaoMin: "120",
                    ativo: true,
                };

                const parsed = createLocalSchema.parse(input);
                expect(parsed).toEqual({
                    nome: "Auditório Principal",
                    descricao: "Espaço para palestras",
                    capacidade: 150,
                    duracaoMin: 120,
                    ativo: true,
                });
            });

            it("valida payload mínimo e aplica defaults", () => {
                const parsed = createLocalSchema.parse({ nome: "Sala de Reuniões" });
                expect(parsed).toEqual({
                    nome: "Sala de Reuniões",
                    descricao: null,
                    capacidade: undefined,
                    duracaoMin: undefined,
                    ativo: true,
                });
            });

            it("rejeita quando nome está ausente ou vazio", () => {
                expect(() => createLocalSchema.parse({ nome: "" })).toThrow("Campo 'nome' é obrigatório");
                expect(() => createLocalSchema.parse({ nome: "   " })).toThrow("Campo 'nome' é obrigatório");
                expect(() => createLocalSchema.parse({})).toThrow("Campo 'nome' é obrigatório");
            });

            it("trata descricao vazia como null", () => {
                expect(createLocalSchema.parse({ nome: "Sala 1", descricao: "" }).descricao).toBeNull();
                expect(createLocalSchema.parse({ nome: "Sala 1", descricao: null }).descricao).toBeNull();
            });

            it("trata duracaoMin zero como null", () => {
                expect(createLocalSchema.parse({ nome: "Sala 1", duracaoMin: 0 }).duracaoMin).toBeNull();
            });
        });

        describe("updateLocalSchema", () => {
            it("valida payload de atualização parcial", () => {
                const parsed = updateLocalSchema.parse({
                    id: "  loc-123  ",
                    nome: "Novo Nome",
                    capacidade: "45",
                    duracaoMin: "90",
                    ativo: false,
                });

                expect(parsed).toEqual({
                    id: "loc-123",
                    nome: "Novo Nome",
                    descricao: undefined,
                    capacidade: 45,
                    duracaoMin: 90,
                    ativo: false,
                });
            });

            it("rejeita quando id está ausente ou vazio", () => {
                expect(() => updateLocalSchema.parse({ id: "" })).toThrow("Campo 'id' é obrigatório");
                expect(() => updateLocalSchema.parse({})).toThrow("Campo 'id' é obrigatório");
            });

            it("trata campos não numéricos para capacidade e duracaoMin como null", () => {
                const parsed = updateLocalSchema.parse({
                    id: "loc-1",
                    capacidade: "invalido",
                    duracaoMin: "invalido",
                });
                expect(parsed.capacidade).toBeNull();
                expect(parsed.duracaoMin).toBeNull();
            });

            it("permite limpar descricao enviando null", () => {
                const parsed = updateLocalSchema.parse({
                    id: "loc-1",
                    descricao: null,
                });
                expect(parsed.descricao).toBeNull();
            });
        });

        describe("deleteLocalQuerySchema", () => {
            it("valida id fornecido com sucesso", () => {
                const parsed = deleteLocalQuerySchema.parse({ id: "  loc-999  " });
                expect(parsed).toEqual({ id: "loc-999" });
            });

            it("rejeita quando id está ausente ou vazio", () => {
                expect(() => deleteLocalQuerySchema.parse({ id: "" })).toThrow("Parâmetro 'id' é obrigatório");
                expect(() => deleteLocalQuerySchema.parse({})).toThrow("Parâmetro 'id' é obrigatório");
            });
        });
    });

    describe("mapLocationToFrontend", () => {
        it("mapeia LocationRecord para o formato esperado pelo frontend", () => {
            const mapped = mapLocationToFrontend(sampleLocationRecord);

            expect(mapped).toEqual({
                id: "loc-1",
                nome: "Laboratório 1",
                descricao: "Laboratório de Informática",
                capacidade: 30,
                duracaoMin: 60,
                ativo: true,
                createdAt: fixedDate,
                updatedAt: fixedDate,
            });
        });
    });

    describe("locais.service", () => {
        describe("listLocais", () => {
            it("busca apenas locais ativos quando includeInactive é false", async () => {
                vi.mocked(prisma.location.findMany).mockResolvedValueOnce([sampleLocationRecord]);

                const result = await listLocais({ includeInactive: false });

                expect(prisma.location.findMany).toHaveBeenCalledWith({
                    where: { isActive: true },
                    orderBy: { name: "asc" },
                    select: LOCATION_SELECT,
                });
                expect(result).toHaveLength(1);
                expect(result[0].id).toBe("loc-1");
            });

            it("não filtra por isActive quando includeInactive é true", async () => {
                vi.mocked(prisma.location.findMany).mockResolvedValueOnce([sampleLocationRecord]);

                const result = await listLocais({ includeInactive: true });

                expect(prisma.location.findMany).toHaveBeenCalledWith({
                    where: {},
                    orderBy: { name: "asc" },
                    select: LOCATION_SELECT,
                });
                expect(result).toHaveLength(1);
            });

            it("adiciona filtro case-insensitive por nome quando q está presente", async () => {
                vi.mocked(prisma.location.findMany).mockResolvedValueOnce([sampleLocationRecord]);

                const result = await listLocais({ includeInactive: false, q: "Lab" });

                expect(prisma.location.findMany).toHaveBeenCalledWith({
                    where: {
                        isActive: true,
                        name: { contains: "Lab", mode: "insensitive" },
                    },
                    orderBy: { name: "asc" },
                    select: LOCATION_SELECT,
                });
                expect(result).toHaveLength(1);
            });
        });

        describe("createLocalRecord", () => {
            it("cria o registro com sucesso e retorna no formato do frontend", async () => {
                vi.mocked(prisma.location.create).mockResolvedValueOnce(sampleLocationRecord);

                const result = await createLocalRecord({
                    nome: "Laboratório 1",
                    descricao: "Laboratório de Informática",
                    capacidade: 30,
                    duracaoMin: 60,
                    ativo: true,
                });

                expect(prisma.location.create).toHaveBeenCalledWith({
                    data: {
                        name: "Laboratório 1",
                        description: "Laboratório de Informática",
                        capacity: 30,
                        durationMin: 60,
                        isActive: true,
                    },
                    select: LOCATION_SELECT,
                });
                expect(result).toEqual(mapLocationToFrontend(sampleLocationRecord));
            });
        });

        describe("updateLocalRecord", () => {
            it("atualiza apenas os campos definidos e retorna o local atualizado", async () => {
                const updatedRecord: LocationRecord = {
                    ...sampleLocationRecord,
                    name: "Laboratório 1 - Reformado",
                    capacity: 40,
                };

                vi.mocked(prisma.location.update).mockResolvedValueOnce(updatedRecord);

                const result = await updateLocalRecord({
                    id: "loc-1",
                    nome: "Laboratório 1 - Reformado",
                    capacidade: 40,
                });

                expect(prisma.location.update).toHaveBeenCalledWith({
                    where: { id: "loc-1" },
                    data: {
                        name: "Laboratório 1 - Reformado",
                        capacity: 40,
                    },
                    select: LOCATION_SELECT,
                });
                expect(result.nome).toBe("Laboratório 1 - Reformado");
                expect(result.capacidade).toBe(40);
            });

            it("lança NotFoundError quando Prisma retorna erro P2025", async () => {
                const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
                    code: "P2025",
                    clientVersion: "test",
                });
                vi.mocked(prisma.location.update).mockRejectedValueOnce(prismaError);

                await expect(
                    updateLocalRecord({
                        id: "loc-inexistente",
                        nome: "Nome Qualquer",
                    })
                ).rejects.toThrow(NotFoundError);
            });

            it("propaga outros erros desconhecidos do Prisma", async () => {
                vi.mocked(prisma.location.update).mockRejectedValueOnce(new Error("Database offline"));

                await expect(
                    updateLocalRecord({
                        id: "loc-1",
                        nome: "Nome",
                    })
                ).rejects.toThrow("Database offline");
            });
        });

        describe("deleteLocalRecord", () => {
            it("remove o registro e retorna mensagem de sucesso", async () => {
                vi.mocked(prisma.location.delete).mockResolvedValueOnce(sampleLocationRecord);

                const result = await deleteLocalRecord("loc-1");

                expect(prisma.location.delete).toHaveBeenCalledWith({
                    where: { id: "loc-1" },
                });
                expect(result).toEqual({ message: "Local removido com sucesso" });
            });

            it("lança NotFoundError quando Prisma retorna erro P2025", async () => {
                const prismaError = new Prisma.PrismaClientKnownRequestError("Record not found", {
                    code: "P2025",
                    clientVersion: "test",
                });
                vi.mocked(prisma.location.delete).mockRejectedValueOnce(prismaError);

                await expect(deleteLocalRecord("loc-inexistente")).rejects.toThrow(NotFoundError);
            });

            it("propaga outros erros desconhecidos do Prisma", async () => {
                vi.mocked(prisma.location.delete).mockRejectedValueOnce(new Error("Timeout"));

                await expect(deleteLocalRecord("loc-1")).rejects.toThrow("Timeout");
            });
        });
    });
});
