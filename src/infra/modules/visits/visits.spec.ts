import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    deleteDateRuleSchema,
    saveDateRuleSchema,
    saveWeekdayRulesSchema,
    visitPatchActionSchema,
    weekdayRuleItemSchema,
} from "./visits.schema";

vi.mock("@/src/infra/data/prisma", () => ({
    prisma: {
        visit: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        visitDocument: {
            findUnique: vi.fn(),
            createMany: vi.fn(),
        },
        visitWeekdayRule: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            upsert: vi.fn(),
        },
        visitDateRule: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            upsert: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

vi.mock("@/src/lib/supabase-server", () => ({
    uploadVisitDocument: vi.fn(),
    getSignedDownloadUrl: vi.fn(),
}));

vi.mock("@/src/lib/email", () => ({
    sendApprovalEmail: vi.fn().mockResolvedValue(undefined),
    sendDenialEmail: vi.fn().mockResolvedValue(undefined),
    sendEmailReceivedConfirmation: vi.fn().mockResolvedValue(undefined),
    sendNewRequestNotificationToAdmin: vi.fn().mockResolvedValue(undefined),
    sendRequestConfirmationToApplicant: vi.fn().mockResolvedValue(undefined),
}));

const { prisma } = await import("@/src/infra/data/prisma");
const { uploadVisitDocument, getSignedDownloadUrl } = await import("@/src/lib/supabase-server");
const { deleteDateRule, getVisitAvailability, handleAvailabilityAction, saveDateRule, saveWeekdayRules } =
    await import("./visits-availability.service");
const {
    createVisitFromFormData,
    deleteVisitById,
    executeVisitPatchAction,
    getVisitDocumentDownloadUrl,
    isAdmin,
    listPublicCalendarEvents,
    listVisitsForAdmin,
} = await import("./visits.service");

describe("visits.schema", () => {
    describe("weekdayRuleItemSchema", () => {
        it("valida regra de dia da semana válida", () => {
            const result = weekdayRuleItemSchema.safeParse({ dayOfWeek: "2", isAvailable: true });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.dayOfWeek).toBe(2);
                expect(result.data.isAvailable).toBe(true);
            }
        });

        it("rejeita dia da semana menor que 0 ou maior que 6", () => {
            expect(weekdayRuleItemSchema.safeParse({ dayOfWeek: -1, isAvailable: true }).success).toBe(false);
            expect(weekdayRuleItemSchema.safeParse({ dayOfWeek: 7, isAvailable: true }).success).toBe(false);
        });
    });

    describe("saveWeekdayRulesSchema", () => {
        it("aceita até 7 regras com action correto", () => {
            const rules = [
                { dayOfWeek: 1, isAvailable: true },
                { dayOfWeek: 2, isAvailable: false },
            ];
            const result = saveWeekdayRulesSchema.safeParse({ action: "saveWeekdayRules", rules });
            expect(result.success).toBe(true);
        });

        it("rejeita mais de 7 regras", () => {
            const rules = Array.from({ length: 8 }, (_, i) => ({ dayOfWeek: i % 7, isAvailable: true }));
            const result = saveWeekdayRulesSchema.safeParse({ action: "saveWeekdayRules", rules });
            expect(result.success).toBe(false);
        });

        it("rejeita action incorreta", () => {
            const result = saveWeekdayRulesSchema.safeParse({ action: "outraAcao", rules: [] });
            expect(result.success).toBe(false);
        });
    });

    describe("saveDateRuleSchema", () => {
        it("valida payload de saveDateRule", () => {
            const result = saveDateRuleSchema.safeParse({
                action: "saveDateRule",
                dates: ["2026-11-10", "2026-11-11"],
                isAvailable: false,
                reason: "Manutenção",
            });
            expect(result.success).toBe(true);
        });

        it("rejeita array de datas vazio", () => {
            const result = saveDateRuleSchema.safeParse({
                action: "saveDateRule",
                dates: [],
                isAvailable: true,
            });
            expect(result.success).toBe(false);
        });

        it("rejeita mais de 366 datas", () => {
            const dates = Array.from({ length: 367 }, () => "2026-12-01");
            const result = saveDateRuleSchema.safeParse({
                action: "saveDateRule",
                dates,
                isAvailable: true,
            });
            expect(result.success).toBe(false);
        });
    });

    describe("deleteDateRuleSchema", () => {
        it("valida exclusão de regra de data", () => {
            const result = deleteDateRuleSchema.safeParse({
                action: "deleteDateRule",
                date: "2026-11-10",
            });
            expect(result.success).toBe(true);
        });

        it("rejeita data vazia", () => {
            const result = deleteDateRuleSchema.safeParse({
                action: "deleteDateRule",
                date: "",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("visitPatchActionSchema", () => {
        it("aceita ações válidas com id positivo", () => {
            const result = visitPatchActionSchema.safeParse({
                id: 10,
                action: "confirmEmail",
            });
            expect(result.success).toBe(true);
        });

        it("aceita adminDeny com reason", () => {
            const result = visitPatchActionSchema.safeParse({
                id: 10,
                action: "adminDeny",
                reason: "Sem vagas no laboratório",
            });
            expect(result.success).toBe(true);
        });

        it("rejeita ação inexistente e id negativo", () => {
            expect(visitPatchActionSchema.safeParse({ id: 10, action: "invalidAction" }).success).toBe(false);
            expect(visitPatchActionSchema.safeParse({ id: -1, action: "confirmEmail" }).success).toBe(false);
        });
    });
});

describe("visits-availability.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getVisitAvailability", () => {
        it("retorna regras semanais e de data formatadas", async () => {
            vi.mocked(prisma.visitWeekdayRule.findMany).mockResolvedValue([
                { id: 1, dayOfWeek: 1, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
            ] as never);
            vi.mocked(prisma.visitDateRule.findMany).mockResolvedValue([
                {
                    id: 10,
                    date: new Date("2026-12-25T00:00:00Z"),
                    isAvailable: false,
                    reason: "Natal",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ] as never);

            const result = await getVisitAvailability();
            expect(result.weekdayRules).toHaveLength(1);
            expect(result.dateRules).toEqual([
                {
                    id: 10,
                    date: "2026-12-25",
                    isAvailable: false,
                    reason: "Natal",
                },
            ]);
        });
    });

    describe("saveWeekdayRules", () => {
        it("lança erro se rules não for array", async () => {
            await expect(saveWeekdayRules("not-an-array")).rejects.toThrow("Formato inválido para regras semanais");
        });

        it("lança erro se rules tiver mais de 7 itens", async () => {
            const rules = Array.from({ length: 8 }, () => ({ dayOfWeek: 1, isAvailable: true }));
            await expect(saveWeekdayRules(rules)).rejects.toThrow("Quantidade de regras excede o limite semanal");
        });

        it("lança erro se dia da semana for inválido", async () => {
            await expect(saveWeekdayRules([{ dayOfWeek: 8, isAvailable: true }])).rejects.toThrow(
                "Dia da semana inválido (deve ser entre 0 e 6)"
            );
        });

        it("atualiza regras semanais com sucesso", async () => {
            vi.mocked(prisma.visitWeekdayRule.upsert).mockResolvedValue({} as never);

            const result = await saveWeekdayRules([
                { dayOfWeek: 1, isAvailable: true },
                { dayOfWeek: 2, isAvailable: false },
            ]);

            expect(result.message).toBe("Regras semanais atualizadas com sucesso");
            expect(prisma.visitWeekdayRule.upsert).toHaveBeenCalledTimes(2);
        });
    });

    describe("saveDateRule", () => {
        it("lança erro se dates for vazio ou não for array", async () => {
            await expect(saveDateRule([], true)).rejects.toThrow("Formato inválido ou lista de datas vazia");
            await expect(saveDateRule(null, true)).rejects.toThrow("Formato inválido ou lista de datas vazia");
        });

        it("lança erro se exceder 366 datas", async () => {
            const dates = Array.from({ length: 367 }, () => "2026-11-10");
            await expect(saveDateRule(dates, true)).rejects.toThrow(
                "Intervalo de datas limite excedido (máximo de 1 ano)"
            );
        });

        it("lança erro se a data estiver no passado", async () => {
            await expect(saveDateRule(["2020-01-01"], true)).rejects.toThrow(
                "Não é possível alterar a disponibilidade de datas passadas"
            );
        });

        it("atualiza regras de datas futuras com sucesso", async () => {
            vi.mocked(prisma.visitDateRule.upsert).mockResolvedValue({} as never);

            const result = await saveDateRule(["2099-01-01", "invalid-date"], true, "Feriado Local ");
            expect(result.message).toBe("Exceções de data atualizadas com sucesso");
            expect(prisma.visitDateRule.upsert).toHaveBeenCalledTimes(1);
        });
    });

    describe("deleteDateRule", () => {
        it("lança erro se data for ausente", async () => {
            await expect(deleteDateRule("")).rejects.toThrow("Data é obrigatória");
        });

        it("lança erro se data for inválida", async () => {
            await expect(deleteDateRule("invalid-date-format")).rejects.toThrow("Data inválida");
        });

        it("lança erro se data for no passado", async () => {
            await expect(deleteDateRule("2020-01-01")).rejects.toThrow(
                "Não é possível alterar a disponibilidade de datas passadas"
            );
        });

        it("remove exceção de data com sucesso", async () => {
            vi.mocked(prisma.visitDateRule.deleteMany).mockResolvedValue({ count: 1 } as never);

            const result = await deleteDateRule("2099-05-10");
            expect(result.message).toBe("Exceção de data removida com sucesso");
            expect(prisma.visitDateRule.deleteMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("handleAvailabilityAction", () => {
        it("roteia saveWeekdayRules", async () => {
            vi.mocked(prisma.visitWeekdayRule.upsert).mockResolvedValue({} as never);
            const res = await handleAvailabilityAction({
                action: "saveWeekdayRules",
                rules: [{ dayOfWeek: 0, isAvailable: false }],
            });
            expect(res.message).toBe("Regras semanais atualizadas com sucesso");
        });

        it("roteia saveDateRule", async () => {
            vi.mocked(prisma.visitDateRule.upsert).mockResolvedValue({} as never);
            const res = await handleAvailabilityAction({
                action: "saveDateRule",
                dates: ["2099-06-01"],
                isAvailable: true,
            });
            expect(res.message).toBe("Exceções de data atualizadas com sucesso");
        });

        it("roteia deleteDateRule", async () => {
            vi.mocked(prisma.visitDateRule.deleteMany).mockResolvedValue({ count: 1 } as never);
            const res = await handleAvailabilityAction({
                action: "deleteDateRule",
                date: "2099-06-01",
            });
            expect(res.message).toBe("Exceção de data removida com sucesso");
        });

        it("lança erro para ação desconhecida", async () => {
            await expect(handleAvailabilityAction({ action: "unsupported" })).rejects.toThrow("Ação desconhecida");
        });
    });
});

describe("visits.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("isAdmin", () => {
        it("reconhece ADMIN e admin", () => {
            expect(isAdmin("ADMIN")).toBe(true);
            expect(isAdmin("admin")).toBe(true);
            expect(isAdmin("USER")).toBe(false);
            expect(isAdmin("")).toBe(false);
        });
    });

    describe("listVisitsForAdmin", () => {
        it("busca visitas com documentos e localização para admin", async () => {
            vi.mocked(prisma.visit.findMany).mockResolvedValue([{ id: 1, institution: "Escola A" }] as never);

            const visits = await listVisitsForAdmin();
            expect(visits).toHaveLength(1);
            expect(prisma.visit.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: "desc" },
                include: {
                    VisitDocument: {
                        select: { id: true, fileName: true, fileType: true, fileSizeKb: true, uploadedAt: true },
                    },
                    VisitLocation: {
                        include: {
                            Location: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });
        });
    });

    describe("listPublicCalendarEvents", () => {
        it("combina eventos de visitas com feriados", async () => {
            vi.mocked(prisma.visit.findMany).mockResolvedValue([
                {
                    id: 1,
                    institution: "Escola Pública",
                    visitDate: new Date("2026-05-15T00:00:00Z"),
                    startTime: "09:00",
                    endTime: "11:00",
                    status: "APPROVED",
                },
            ] as never);

            const events = await listPublicCalendarEvents();
            expect(events.length).toBeGreaterThan(1);
            const visitEvent = events.find((e) => e.id === 1);
            expect(visitEvent).toBeDefined();
            expect(visitEvent?.instituicao).toBe("Escola Pública");
            expect(visitEvent?.status).toBe("aprovado");

            const holidayEvent = events.find((e) => e.isHoliday);
            expect(holidayEvent).toBeDefined();
        });
    });

    describe("createVisitFromFormData", () => {
        function buildFormData(overrides: Record<string, string | File> = {}) {
            const formData = new FormData();
            formData.set("instituicao", "Escola Estadual");
            formData.set("responsavel", "Carlos Silva");
            formData.set("email", "carlos@escola.com");
            formData.set("whatsapp", "82999999999");
            formData.set("quantidade", "30");
            formData.set("dataVisita", "2099-05-12"); // Terça-feira
            formData.set("horaInicio", "09:00");
            formData.set("horaFim", "11:00");
            formData.set("mensagem", "Visita de robótica");
            formData.set("paradas", JSON.stringify(["loc-1"]));

            for (const [key, value] of Object.entries(overrides)) {
                if (value === "") {
                    formData.delete(key);
                } else {
                    formData.set(key, value);
                }
            }

            return formData;
        }

        it("lança ValidationError se campos obrigatórios faltarem", async () => {
            const formData = buildFormData({ instituicao: "" });
            await expect(createVisitFromFormData(formData)).rejects.toThrow("Campos obrigatórios faltando");
        });

        it("lança ValidationError para quantidade inválida", async () => {
            const formData = buildFormData({ quantidade: "0" });
            await expect(createVisitFromFormData(formData)).rejects.toThrow("Quantidade inválida");
        });

        it("lança AppError 413 se arquivo exceder 5MB", async () => {
            const bigFile = new File([new Uint8Array(6 * 1024 * 1024)], "grande.pdf", {
                type: "application/pdf",
            });
            const formData = buildFormData();
            formData.append("anexos", bigFile);

            await expect(createVisitFromFormData(formData)).rejects.toMatchObject({
                statusCode: 413,
                code: "PAYLOAD_TOO_LARGE",
            });
        });

        it("lança ValidationError para data inválida", async () => {
            const formData = buildFormData({ dataVisita: "data-invalida" });
            await expect(createVisitFromFormData(formData)).rejects.toThrow("Data inválida");
        });

        it("lança ValidationError se data for bloqueada por regra de data", async () => {
            vi.mocked(prisma.visitDateRule.findUnique).mockResolvedValue({
                id: 1,
                date: new Date("2099-05-12T00:00:00"),
                isAvailable: false,
                reason: "Reforma no bloco",
                createdAt: new Date(),
                updatedAt: new Date(),
            } as never);

            const formData = buildFormData();
            await expect(createVisitFromFormData(formData)).rejects.toThrow("Reforma no bloco");
        });

        it("lança ValidationError se dia da semana não for permitido", async () => {
            vi.mocked(prisma.visitDateRule.findUnique).mockResolvedValue(null);
            vi.mocked(prisma.visitWeekdayRule.findUnique).mockResolvedValue({
                id: 1,
                dayOfWeek: 2,
                isAvailable: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as never);

            const formData = buildFormData();
            await expect(createVisitFromFormData(formData)).rejects.toThrow("Finais de semana ou dias não permitidos.");
        });

        it("lança ConflictError se houver conflito de horário (< 30 min)", async () => {
            vi.mocked(prisma.visitDateRule.findUnique).mockResolvedValue({
                id: 1,
                date: new Date("2099-05-12T00:00:00"),
                isAvailable: true,
                reason: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as never);

            vi.mocked(prisma.visit.findMany).mockResolvedValue([{ startTime: "10:00", endTime: "12:00" }] as never);

            const formData = buildFormData(); // 09:00 - 11:00
            await expect(createVisitFromFormData(formData)).rejects.toThrow(
                "Conflito de horário com outra visita (mínimo 30 min de intervalo)."
            );
        });

        it("faz rollback e lança AppError se upload de documento falhar", async () => {
            vi.mocked(prisma.visitDateRule.findUnique).mockResolvedValue({
                id: 1,
                date: new Date("2099-05-12T00:00:00"),
                isAvailable: true,
                reason: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as never);
            vi.mocked(prisma.visit.findMany).mockResolvedValue([]);
            vi.mocked(prisma.visit.create).mockResolvedValue({ id: 99 } as never);
            vi.mocked(prisma.visit.delete).mockResolvedValue({ id: 99 } as never);
            vi.mocked(uploadVisitDocument).mockRejectedValue(new Error("Supabase S3 down"));

            const file = new File(["bytes"], "documento.pdf", { type: "application/pdf" });
            const formData = buildFormData();
            formData.append("anexos", file);

            await expect(createVisitFromFormData(formData)).rejects.toMatchObject({
                statusCode: 500,
                code: "UPLOAD_ERROR",
            });
            expect(prisma.visit.delete).toHaveBeenCalledWith({ where: { id: 99 } });
        });

        it("cria visita com documentos e notifica e-mails com sucesso", async () => {
            vi.mocked(prisma.visitDateRule.findUnique).mockResolvedValue({
                id: 1,
                date: new Date("2099-05-12T00:00:00"),
                isAvailable: true,
                reason: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            } as never);
            vi.mocked(prisma.visit.findMany).mockResolvedValue([]);
            vi.mocked(prisma.visit.create).mockResolvedValue({ id: 100 } as never);
            vi.mocked(uploadVisitDocument).mockResolvedValue("visits/100/doc.pdf");
            vi.mocked(prisma.visitDocument.createMany).mockResolvedValue({ count: 1 } as never);
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 100,
                institution: "Escola Estadual",
                VisitDocument: [{ id: 50, fileName: "doc.pdf" }],
            } as never);

            const file = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
            const formData = buildFormData();
            formData.append("anexos", file);

            const created = await createVisitFromFormData(formData);
            expect(created?.id).toBe(100);
            expect(prisma.visit.create).toHaveBeenCalledTimes(1);
            expect(prisma.visitDocument.createMany).toHaveBeenCalledTimes(1);
        });
    });

    describe("executeVisitPatchAction", () => {
        it("lança ValidationError se id ou action faltarem", async () => {
            await expect(executeVisitPatchAction({})).rejects.toThrow("ID e ação são obrigatórios");
            await expect(executeVisitPatchAction({ id: 1 })).rejects.toThrow("ID e ação são obrigatórios");
        });

        it("lança NotFoundError se visita não existir", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue(null);
            await expect(executeVisitPatchAction({ id: 99, action: "confirmEmail" })).rejects.toThrow(
                'Visita with id "99" not found'
            );
        });

        it("lança ValidationError se estágio for incompatível com a ação", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "DOCUMENTS_UNDER_REVIEW",
                processLog: [],
            } as never);

            await expect(executeVisitPatchAction({ id: 1, action: "confirmEmail" })).rejects.toThrow(
                "Estágio inválido"
            );
        });

        it("executa confirmEmail com sucesso", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "WAITING_EMAIL",
                email: "test@escola.com",
                responsible: "João",
                institution: "Escola X",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, processStage: "EMAIL_RECEIVED" } as never);

            const res = await executeVisitPatchAction({ id: 1, action: "confirmEmail" });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: expect.objectContaining({ processStage: "EMAIL_RECEIVED" }),
                })
            );
        });

        it("executa approveDocumentation com sucesso", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "EMAIL_RECEIVED",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, documentationStatus: "CHECKED" } as never);

            const res = await executeVisitPatchAction({ id: 1, action: "approveDocumentation" });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: expect.objectContaining({
                        processStage: "DOCUMENTS_UNDER_REVIEW",
                        documentationStatus: "CHECKED",
                    }),
                })
            );
        });

        it("executa markDocumentationIncomplete com sucesso", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "EMAIL_RECEIVED",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, documentationStatus: "INCOMPLETE" } as never);

            const res = await executeVisitPatchAction({ id: 1, action: "markDocumentationIncomplete" });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: expect.objectContaining({
                        processStage: "DOCUMENTS_UNDER_REVIEW",
                        documentationStatus: "INCOMPLETE",
                    }),
                })
            );
        });

        it("lança ValidationError se sendToIfal for chamado sem documentação conferida", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "DOCUMENTS_UNDER_REVIEW",
                documentationStatus: "INCOMPLETE",
                processLog: [],
            } as never);

            await expect(executeVisitPatchAction({ id: 1, action: "sendToIfal" })).rejects.toThrow(
                "Documentação precisa estar conferida para enviar ao IFAL"
            );
        });

        it("executa sendToIfal com sucesso quando conferido", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "DOCUMENTS_UNDER_REVIEW",
                documentationStatus: "CHECKED",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, ifalStatus: "PENDING" } as never);

            const res = await executeVisitPatchAction({ id: 1, action: "sendToIfal" });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        processStage: "WAITING_IFAL_APPROVAL",
                        ifalStatus: "PENDING",
                    }),
                })
            );
        });

        it("executa ifalApprove com sucesso", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "WAITING_IFAL_APPROVAL",
                visitDate: new Date("2026-11-20"),
                startTime: "09:00",
                endTime: "11:00",
                email: "escola@gov.br",
                responsible: "Ana",
                institution: "Escola Y",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, status: "APPROVED" } as never);

            const res = await executeVisitPatchAction({ id: 1, action: "ifalApprove" });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: "APPROVED",
                        ifalStatus: "APPROVED",
                    }),
                })
            );
        });

        it("executa ifalDeny com sucesso", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processStage: "WAITING_IFAL_APPROVAL",
                email: "escola@gov.br",
                responsible: "Ana",
                institution: "Escola Y",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, status: "DENIED" } as never);

            const res = await executeVisitPatchAction({
                id: 1,
                action: "ifalDeny",
                reason: "Indisponibilidade de auditório",
            });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: "DENIED",
                        rejectionReason: "Indisponibilidade de auditório",
                    }),
                })
            );
        });

        it("lança ValidationError para adminDeny sem motivo ou em visita já negada", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                status: "DENIED",
                processLog: [],
            } as never);

            await expect(executeVisitPatchAction({ id: 1, action: "adminDeny", reason: "Motivo" })).rejects.toThrow(
                "Visita já negada"
            );

            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 2,
                status: "PENDING",
                processLog: [],
            } as never);

            await expect(executeVisitPatchAction({ id: 2, action: "adminDeny", reason: "   " })).rejects.toThrow(
                "Motivo da negativa é obrigatório"
            );
        });

        it("executa adminDeny com sucesso", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                status: "PENDING",
                email: "escola@gov.br",
                responsible: "Ana",
                institution: "Escola Y",
                processLog: [],
            } as never);
            vi.mocked(prisma.visit.update).mockResolvedValue({ id: 1, status: "DENIED" } as never);

            const res = await executeVisitPatchAction({
                id: 1,
                action: "adminDeny",
                reason: "Documentação inconsistente",
            });
            expect(res.id).toBe(1);
            expect(prisma.visit.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        status: "DENIED",
                        rejectionReason: "Documentação inconsistente",
                    }),
                })
            );
        });

        it("lança ValidationError para ação inválida", async () => {
            vi.mocked(prisma.visit.findUnique).mockResolvedValue({
                id: 1,
                processLog: [],
            } as never);

            await expect(executeVisitPatchAction({ id: 1, action: "desconhecida" })).rejects.toThrow("Ação inválida");
        });
    });

    describe("deleteVisitById", () => {
        it("lança ValidationError se id for inválido", async () => {
            await expect(deleteVisitById(0)).rejects.toThrow("ID inválido");
            await expect(deleteVisitById(NaN)).rejects.toThrow("ID inválido");
        });

        it("remove visita com sucesso", async () => {
            vi.mocked(prisma.visit.delete).mockResolvedValue({ id: 5 } as never);

            const res = await deleteVisitById(5);
            expect(res.message).toBe("Visita removida com sucesso");
            expect(prisma.visit.delete).toHaveBeenCalledWith({ where: { id: 5 } });
        });
    });

    describe("getVisitDocumentDownloadUrl", () => {
        it("lança ValidationError se docId for inválido", async () => {
            await expect(getVisitDocumentDownloadUrl(0)).rejects.toThrow("ID inválido");
            await expect(getVisitDocumentDownloadUrl(NaN)).rejects.toThrow("ID inválido");
        });

        it("lança NotFoundError se documento não existir", async () => {
            vi.mocked(prisma.visitDocument.findUnique).mockResolvedValue(null);

            await expect(getVisitDocumentDownloadUrl(123)).rejects.toThrow('Documento with id "123" not found');
        });

        it("retorna URL assinada com sucesso", async () => {
            vi.mocked(prisma.visitDocument.findUnique).mockResolvedValue({
                id: 123,
                storagePath: "docs/123/anexo.pdf",
            } as never);
            vi.mocked(getSignedDownloadUrl).mockResolvedValue("https://storage.example.com/signed-url");

            const url = await getVisitDocumentDownloadUrl(123);
            expect(url).toBe("https://storage.example.com/signed-url");
            expect(getSignedDownloadUrl).toHaveBeenCalledWith("docs/123/anexo.pdf");
        });
    });
});
