import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";
import { listPresenceEventsByUser } from "@/src/infra/modules/presences/me/presence-me.service";
import { getErrorMessage, getRequestInfo } from "@/src/ui/lib/errors";
import { logger } from "@/src/ui/lib/logger";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const events = await listPresenceEventsByUser(userId);

        return NextResponse.json({ data: events });
    } catch (err) {
        const errorMessage = getErrorMessage(err);
        logger.error({ err, route: getRequestInfo(request) }, errorMessage);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
    }
}
