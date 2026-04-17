"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/src/components/animate-ui/components/base/tabs";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { VisitRequest } from "@/src/infra/modules/professor/agenda-visitas-mock";
import { buildUnifiedCalendarEvents } from "@/src/ui/lib/unified-calendar-events";
import { getAdminVisits } from "@/src/ui/lib/visit-requests-api";
import { UnifiedVisitCalendar } from "@/src/ui/modules/calendar_pages/components/shared/unified-visit-calendar";
import { format, isSameDay } from "date-fns";
import { ClipboardList, Clock3 } from "lucide-react";

import { MetricsCards } from "./agenda/metrics-cards";
import { RequestCard } from "./agenda/request-card";

const ITEMS_PER_PAGE = 3;

export function AgendaVisitasAdmin() {
    const [requests, setRequests] = useState<VisitRequest[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const [sideTab, setSideTab] = useState<"solicitacoes" | "dia">("solicitacoes");
    const [currentPage, setCurrentPage] = useState(1);
    const [denyReasonById, setDenyReasonById] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    async function loadData() {
        setIsLoading(true);
        try {
            const fetched = await getAdminVisits();
            setRequests(fetched);
            setCalendarEvents(buildUnifiedCalendarEvents(fetched));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    const dayEvents = useMemo(
        () => calendarEvents.filter((event) => isSameDay(event.start, selectedDate)),
        [calendarEvents, selectedDate]
    );

    const metrics = useMemo(() => {
        const aguardandoEmail = requests.filter((r) => r.processStage === "aguardando_email").length;
        const emAnalise = requests.filter(
            (r) => r.processStage === "email_recebido" || r.processStage === "documentacao_em_analise"
        ).length;
        const aguardandoIfal = requests.filter((r) => r.processStage === "aguardando_aprovacao_ifal").length;
        const aprovados = requests.filter((r) => r.status === "aprovado").length;
        return { aguardandoEmail, emAnalise, aguardandoIfal, aprovados };
    }, [requests]);

    const sortedRequests = useMemo(() => {
        return [...requests].sort((a, b) => {
            const dateA = new Date(`${a.data}T${a.horaInicio}:00`).getTime();
            const dateB = new Date(`${b.data}T${b.horaInicio}:00`).getTime();
            return dateA - dateB;
        });
    }, [requests]);

    const totalPages = Math.max(1, Math.ceil(sortedRequests.length / ITEMS_PER_PAGE));

    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedRequests.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedRequests, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    return (
        <div className="space-y-6">
            <MetricsCards metrics={metrics} />

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                <div className="xl:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-5">
                    <UnifiedVisitCalendar
                        events={calendarEvents}
                        selectedDate={selectedDate}
                        viewDate={viewDate}
                        onViewDateChange={setViewDate}
                        onSelectDay={setSelectedDate}
                        height={560}
                    />
                </div>

                <aside className="xl:col-span-4 sticky top-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-5 space-y-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                                Painel administrativo
                            </p>
                            <h3 className="text-lg font-semibold text-gray-900">Solicitações de visita</h3>
                        </div>

                        <Tabs
                            value={sideTab}
                            onValueChange={(value: string) => setSideTab(value as "solicitacoes" | "dia")}
                        >
                            <div className="relative">
                                <TabsList className="grid grid-cols-2 w-full h-10">
                                    <TabsTab
                                        value="solicitacoes"
                                        className="text-xs font-semibold data-selected:text-yellow-900"
                                    >
                                        <span className="inline-flex items-center gap-1.5">
                                            <ClipboardList className="size-3.5" />
                                            Solicitações
                                        </span>
                                    </TabsTab>
                                    <TabsTab
                                        value="dia"
                                        className="text-xs font-semibold data-selected:text-yellow-900"
                                    >
                                        <span className="inline-flex items-center gap-1.5">
                                            <Clock3 className="size-3.5" />
                                            Dia Selecionado
                                        </span>
                                    </TabsTab>
                                </TabsList>
                            </div>

                            <TabsPanels>
                                <TabsPanel value="solicitacoes" className="space-y-3 pt-2">
                                    {isLoading ? (
                                        <div className="text-xs text-gray-500 py-4 text-center">Carregando...</div>
                                    ) : (
                                        <>
                                            <div className="text-xs text-gray-500 px-0.5">
                                                Mostrando {paginatedRequests.length} de {sortedRequests.length}{" "}
                                                resultado(s)
                                            </div>

                                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                                {paginatedRequests.map((request) => {
                                                    const denyReason = denyReasonById[request.id] ?? "";
                                                    return (
                                                        <RequestCard
                                                            key={request.id}
                                                            request={request}
                                                            denyReason={denyReason}
                                                            setDenyReason={(text) =>
                                                                setDenyReasonById((prev) => ({
                                                                    ...prev,
                                                                    [request.id]: text,
                                                                }))
                                                            }
                                                            refresh={loadData}
                                                        />
                                                    );
                                                })}

                                                {paginatedRequests.length === 0 && (
                                                    <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                                                        Nenhuma solicitação encontrada.
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:cursor-pointer disabled:hover:cursor-not-allowed hover:border-yellow-400"
                                                >
                                                    Anterior
                                                </button>
                                                <span className="text-xs text-gray-600">
                                                    Página {currentPage} de {totalPages}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                                    }
                                                    disabled={currentPage >= totalPages}
                                                    className="px-3 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 disabled:opacity-40 hover:cursor-pointer disabled:hover:cursor-not-allowed hover:border-yellow-400"
                                                >
                                                    Próxima
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </TabsPanel>

                                <TabsPanel value="dia" className="pt-2">
                                    <div className="rounded-xl border border-gray-200 p-3">
                                        <p className="text-sm font-semibold text-gray-800 mb-2">
                                            Visitas do dia {format(selectedDate, "dd/MM/yyyy")}
                                        </p>
                                        {dayEvents.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                Nenhuma visita registrada neste dia.
                                            </p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {dayEvents.map((event) => (
                                                    <li
                                                        key={event.id}
                                                        className="text-sm text-gray-700 border-l-4 border-yellow-primary pl-2"
                                                    >
                                                        <span className="font-medium">{event.title}</span> -{" "}
                                                        {format(event.start, "HH:mm")} às {format(event.end, "HH:mm")}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </TabsPanel>
                            </TabsPanels>
                        </Tabs>
                    </div>
                </aside>
            </div>
        </div>
    );
}
