import { JWT } from "next-auth/jwt";

export function authenticateUser(token: JWT | null): boolean {
    return !!token;
}
