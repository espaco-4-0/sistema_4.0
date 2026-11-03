import { verifyUserCredentials } from "@/src/infra/modules/auth/auth-server.service";
import NextAuth, { DefaultSession, DefaultUser, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const SESSION_DURATION_LONG = 30 * 24 * 60 * 60; //30 DIAS
const SESSION_DURATION_SHORT = 1 * 24 * 60 * 60; //1 DIA

declare module "next-auth" {
    interface User extends DefaultUser {
        id: string;
        role: string;
        remember: boolean;
    }

    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        remember: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Senha", type: "password" },
                remember: { label: "Lembrar-me", type: "text" },
            },

            async authorize(credentials) {
                if (!credentials) return null;

                return verifyUserCredentials(credentials.email, credentials.password, credentials.remember);
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.remember = user.remember;
                token.name = user.name;
                token.picture = user.image;

                token.exp =
                    Math.floor(Date.now() / 1000) + (user.remember ? SESSION_DURATION_LONG : SESSION_DURATION_SHORT);
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.name = token.name ?? session.user.name;
                session.user.image = (token.picture as string | null | undefined) ?? session.user.image;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
