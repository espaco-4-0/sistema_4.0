"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function GlobalError({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="pt-BR">
            <body>
                <main
                    className={clsx(
                        "relative",
                        "flex",
                        "w-full",
                        "min-h-screen",
                        "flex-col",
                        "items-center",
                        "justify-center",
                        "overflow-hidden",
                        "text-center",
                        "px-4",
                        "bg-gray-50"
                    )}
                >
                    <div
                        className={clsx(
                            "fixed",
                            "inset-0",
                            "flex",
                            "items-center",
                            "justify-center",
                            "pointer-events-none",
                            "z-0"
                        )}
                        aria-hidden="true"
                    >
                        <div
                            className={clsx(
                                "font-bold",
                                "leading-none",
                                "text-transparent",
                                "bg-clip-text",
                                "bg-linear-to-b",
                                "from-[#FFC107]/30",
                                "to-white",
                                "text-[16rem]",
                                "md:text-[28rem]",
                                "lg:text-[36rem]"
                            )}
                        >
                            500
                        </div>
                    </div>

                    <div className={clsx("z-10", "flex", "flex-col", "items-center")}>
                        <div className={clsx("mb-12", "rounded-full", "lg:mb-16")}>
                            <Image
                                src="/robo.png"
                                alt="Ilustração de erro"
                                width={500}
                                height={500}
                                className={clsx("h-auto", "w-56", "md:w-80", "lg:w-125", "rounded-full")}
                            />
                        </div>

                        <h1
                            className={clsx(
                                "text-2xl",
                                "font-extrabold",
                                "text-black",
                                "sm:text-3xl",
                                "md:text-4xl"
                            )}
                        >
                            Algo deu errado por aqui.
                        </h1>

                        <p
                            className={clsx(
                                "mt-4",
                                "max-w-xl",
                                "text-base",
                                "text-gray-600",
                                "md:text-lg"
                            )}
                        >
                            Nosso time já foi notificado e está investigando o problema! <br />
                            Você pode tentar novamente ou voltar para o início.
                        </p>

                        <div className={clsx("mt-8", "flex", "gap-4", "flex-wrap", "justify-center")}>
                            <button
                                onClick={reset}
                                className={clsx(
                                    "transform",
                                    "rounded-lg",
                                    "bg-[#FFC107]",
                                    "px-12",
                                    "py-3",
                                    "text-black",
                                    "font-semibold",
                                    "shadow-lg",
                                    "transition-all",
                                    "duration-300",
                                    "hover:-translate-y-0.5",
                                    "hover:bg-[#FFB300]",
                                    "hover:shadow-xl",
                                    "focus:outline-none",
                                    "focus:ring-2",
                                    "focus:ring-[#FFC107]",
                                    "focus:ring-offset-2",
                                    "md:px-16",
                                    "cursor-pointer"
                                )}
                            >
                                Tentar novamente
                            </button>

                            <Link
                                href="/"
                                className={clsx(
                                    "transform",
                                    "rounded-lg",
                                    "border-2",
                                    "border-[#FFC107]",
                                    "px-12",
                                    "py-3",
                                    "text-black",
                                    "font-semibold",
                                    "shadow-lg",
                                    "transition-all",
                                    "duration-300",
                                    "hover:-translate-y-0.5",
                                    "hover:shadow-xl",
                                    "focus:outline-none",
                                    "focus:ring-2",
                                    "focus:ring-[#FFC107]",
                                    "focus:ring-offset-2",
                                    "md:px-16"
                                )}
                            >
                                Página Inicial
                            </Link>
                        </div>
                    </div>
                </main>
            </body>
        </html>
    );
}
