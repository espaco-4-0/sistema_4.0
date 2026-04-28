"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsPanel, TabsPanels, TabsTab } from "@/src/components/animate-ui/components/base/tabs";
import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import { VisitRequest } from "@/src/infra/modules/professor/agenda-visitas-mock";
import { buildUnifiedCalendarEvents } from "@/src/ui/lib/unified-calendar-events";
import { getAdminVisits } from "@/src/ui/lib/visit-requests-api";
import { format, isSameDay } from "date-fns";
import { ClipboardList, Clock3, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";

import { UnifiedVisitCalendar } from "../appointments_pages/components/shared/unified-visit-calendar";
import { LocalQuickList } from "./agenda/local-card";
import { MetricsCards } from "./agenda/metrics-cards";
import { RequestCard } from "./agenda/request-card";
import { LocalFormModal } from "./locais";

const ITEMS_PER_PAGE = 3;

export function AgendaVisitasAdmin() {
    const { data: session } = useSession();

    const [requests, setRequests] = useState<VisitRequest[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewDate, setViewDate] = useState<Date>(new Date());
    const [sideTab, setSideTab] = useState<"solicitacoes" | "dia" | "locais">("solicitacoes");
    const [currentPage, setCurrentPage] = useState(1);
    const [denyReasonById, setDenyReasonById] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);

    // version para forçar recarregar lista de locais quando necessário
    const [localsVersion, setLocalsVersion] = useState(0);

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
                {/* CALENDAR CARD */}
                <div className="xl:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 lg:p-5 pb-8">
                    {/* adicionado pb-8 para garantir espaço inferior e evitar sobreposição */}
                    <UnifiedVisitCalendar
                        events={calendarEvents}
                        selectedDate={selectedDate}
                        viewDate={viewDate}
                        onViewDateChange={setViewDate}
                        onSelectDay={setSelectedDate}
                        height={560}
                    />
                </div>

                <aside className="xl:col-span-4 sticky top-20">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 lg:p-5 space-y-4">
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500 font-semibold">
                                Painel administrativo
                            </p>
                            <h3 className="text-lg font-semibold text-gray-900">Solicitações de visita</h3>
                        </div>

                        <Tabs
                            value={sideTab}
                            onValueChange={(value: string) => setSideTab(value as "solicitacoes" | "dia" | "locais")}
                        >
                            <div className="relative mb-3">
                                <TabsList className="grid grid-cols-3 gap-2 items-center w-full h-10 bg-gray-100 rounded-lg  overflow-hidden">
                                    <TabsTab
                                        value="solicitacoes"
                                        className="text-xs font-semibold flex items-center justify-center h-9 rounded-md data-selected:text-yellow-900 data-selected:bg-white data-selected:shadow-md"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <ClipboardList className="size-3.5" />
                                            Solicitações
                                        </span>
                                    </TabsTab>

                                    <TabsTab
                                        value="dia"
                                        className="text-xs font-semibold flex items-center justify-center h-9 rounded-md data-selected:text-yellow-900 data-selected:bg-white data-selected:shadow-md"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <Clock3 className="size-3.5" />
                                            Dia
                                        </span>
                                    </TabsTab>

                                    <TabsTab
                                        value="locais"
                                        className="text-xs font-semibold flex items-center justify-center h-9 rounded-md data-selected:text-yellow-900 data-selected:bg-white data-selected:shadow-md"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <MapPin className="size-3.5" />
                                            Locais
                                        </span>
                                    </TabsTab>
                                </TabsList>
                            </div>

                            <TabsPanels>
                                <TabsPanel value="solicitacoes">
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

                                <TabsPanel value="dia" className="pt-4">
                                    <div className="rounded-xl border border-gray-200 p-3">
                                        <p className="text-sm font-semibold text-gray-800 mb-2">
                                            Visitas do dia {format(selectedDate, "dd/MM/yyyy")}
                                        </p>
                                        {dayEvents.length === 0 ? (
                                            <p className="text-sm text-gray-500">Nenhuma visita registrada neste dia</p>
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

                                <TabsPanel value="locais" className="">
                                    <div className="rounded-xl r">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-800">Locais cadastrados</h4>
                                            {session?.user?.role === "ADMIN" ? (
                                                <LocalFormModal
                                                    onSuccess={() => {
                                                        setLocalsVersion((v) => v + 1);
                                                    }}
                                                />
                                            ) : null}
                                        </div>

                                        <LocalQuickList
                                            refreshSignal={localsVersion}
                                            onUpdated={() => setLocalsVersion((v) => v + 1)}
                                            showHeader={false}
                                        />
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
