import { checkRateLimit, isRateLimitEnabled } from "@/src/infra/cache/rate-limit";
import { authorizeRole } from "@/src/infra/modules/auth/authorize-role.middleware";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

import { authenticateUser } from "./infra/modules/auth/authenticate-user.middleware";

const securityHeaders = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Referrer-Policy": "origin-when-cross-origin",
};

function getClientIp(req: NextRequest): string {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    if (forwardedFor) {
        return forwardedFor.split(",")[0]?.trim() ?? "anonymous";
    }
    return realIp ?? "anonymous";
}

function applySecurityHeaders(request: NextRequest, response: NextResponse, nonce: string): NextResponse {
    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' blob: data:;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `
        .replace(/\s{2,}/g, " ")
        .trim();

    response.headers.set("Content-Security-Policy", cspHeader);
    return response;
}

export default withAuth(
    async function middleware(req) {
        const token = req.nextauth.token;

        const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-nonce", nonce);

        if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
            const redirectResponse = NextResponse.redirect(loginUrl);
            return applySecurityHeaders(req, redirectResponse, nonce);
        }

        if (isRateLimitEnabled()) {
            const ip = getClientIp(req);
            const rate = await checkRateLimit(ip);
            if (!rate.success) {
                const rateLimitResponse = new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "Retry-After": String(rate.retryAfter),
                        "X-RateLimit-Limit": String(rate.limit),
                        "X-RateLimit-Remaining": String(rate.remaining),
                        "X-RateLimit-Reset": String(rate.reset),
                    },
                });
                return applySecurityHeaders(req, rateLimitResponse, nonce);
            }
        }

        const role = token?.role;
        const forbidden = authorizeRole(req, role);
        if (forbidden) return applySecurityHeaders(req, forbidden, nonce);

        const nextResponse = NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });

        return applySecurityHeaders(req, nextResponse, nonce);
    },
    {
        callbacks: {
            authorized: ({ token }) => authenticateUser(token),
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/admin/:path*",
        "/professor/:path*",
        "/aluno/:path*",
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
