import { prisma } from "@/src/ui/lib/prisma";
import bcrypt from "bcryptjs";
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
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

const handler = NextAuth({
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

                const { email, password, remember } = credentials;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) return null;
                if (!user.ativo) return null;

                const isValid = await bcrypt.compare(password, user.senha);

                if (!isValid) return null;

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    remember: remember === "true",
                };
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

                token.exp =
                    Math.floor(Date.now() / 1000) + (user.remember ? SESSION_DURATION_LONG : SESSION_DURATION_SHORT);
            }

            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
