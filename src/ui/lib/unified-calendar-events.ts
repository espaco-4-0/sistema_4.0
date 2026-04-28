import type { CalendarEvent } from "@/src/infra/modules/calendar/calendar-mock";
import type { VisitRequest } from "@/src/infra/modules/professor/agenda-visitas-mock";
import { getVisitRequests, requestToCalendarEvent } from "@/src/ui/lib/visit-requests-storage";

export function mapRequestsToEvents(requests: VisitRequest[]): CalendarEvent[] {
    return requests.map(requestToCalendarEvent).filter((event): event is CalendarEvent => event !== null);
}

export function buildUnifiedCalendarEvents(requests: VisitRequest[]): CalendarEvent[] {
    return mapRequestsToEvents(requests);
}

export function getUnifiedCalendarEvents(): CalendarEvent[] {
    return buildUnifiedCalendarEvents(getVisitRequests());
}
