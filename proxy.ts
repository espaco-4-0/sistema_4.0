import { checkRateLimit, isRateLimitEnabled } from "@/src/infra/cache/rate-limit";
import { authorizeRole } from "@/src/infra/modules/auth/authorize-role.middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

import { authenticateUser } from "./src/infra/modules/auth/authenticate-user.middleware";

function getClientIp(req: NextRequest): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");

    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() ?? "anonymous";
    }

    return realIp ?? "anonymous";
}

export default withAuth(
    async function middleware(req) {
        if (isRateLimitEnabled()) {
            const ip = getClientIp(req);
            const rate = await checkRateLimit(ip);

            if (!rate.success) {
                return new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "Retry-After": String(rate.retryAfter),
                        "X-RateLimit-Limit": String(rate.limit),
                        "X-RateLimit-Remaining": String(rate.remaining),
                        "X-RateLimit-Reset": String(rate.reset),
                    },
                });
            }
        }

        const role = req.nextauth.token?.role;
        const forbidden = authorizeRole(req, role);
        if (forbidden) return forbidden;
    },
    {
        callbacks: {
            authorized: ({ token }) => authenticateUser(token),
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/courses/:path*",
        "/classes/:path*",
        "/search/:path*",
        "/projects/:path*",
        "/inventory/:path*",
        "/blog/:path*",
        "/presence/:path*",
        "/cursos/:path*",
        "/aulas/:path*",
        "/pesquisa/:path*",
        "/projetos/:path*",
        "/inventario/:path*",
        "/presenca/:path*",
    ],
};
