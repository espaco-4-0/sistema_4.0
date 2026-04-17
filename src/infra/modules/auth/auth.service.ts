import { signIn, signOut } from "next-auth/react";

export async function login(email: string, password: string) {
    const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
    });

    if (res?.error) {
        throw new Error(res.error);
    }

    return res;
}

export async function logout() {
    await signOut({ redirect: false });
}
