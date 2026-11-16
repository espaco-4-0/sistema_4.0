import {
    CalendarEvent,
    isAdmin,
    listPublicCalendarEvents,
    listVisitsForAdmin,
} from "@/src/infra/modules/visits/visits.service";
import { handleError } from "@/src/lib/errors/errorHandler";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../auth/[...nextauth]/route";

export { isAdmin, type CalendarEvent };

async function getSessionUser() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const user = session.user as { id: string; role: string };
    return {
        id: user.id,
        role: user.role,
    };
}

export async function getHandlers() {
    try {
        const user = await getSessionUser();
        const adminUser = user && isAdmin(user.role);

        if (adminUser) {
            const visits = await listVisitsForAdmin();
            return NextResponse.json(visits);
        }

        const events = await listPublicCalendarEvents();
        return NextResponse.json(events);
    } catch (error) {
        return handleError(error);
    }
}
