import { authorizeRole } from "@/src/infra/modules/auth/authorize-role.middleware";
import { withAuth } from "next-auth/middleware";

import { UserRole } from "./src/generated/prisma/enums";
import { authenticateUser } from "./src/infra/modules/auth/authenticate-user.middleware";

export default withAuth(
    function middleware(req) {
        const role = req.nextauth.token?.role as UserRole;
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
    ],
};
