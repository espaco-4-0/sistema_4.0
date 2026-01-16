import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SubscribeSucessProps {
    readonly course: string;
    readonly setCloseCourse: (value: boolean) => void;
}

export default function SubscribeSucess({ course, setCloseCourse }: SubscribeSucessProps) {
    return (
        <div className="mx-auto flex h-auto w-full max-w-4xl flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center shadow-lg transition-all hover:shadow-xl md:p-12 lg:h-170 2xl:p-16">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-100 lg:h-30 lg:w-30">
                <CheckCircle className="h-12 w-12 text-green-600 lg:h-16 lg:w-16" strokeWidth={1.5} />
            </div>

            <h3 className="mt-6 text-xl font-bold text-gray-900 lg:text-2xl 2xl:text-3xl">
                Inscrição realizada com sucesso!
            </h3>

            <p className="mt-3 text-sm text-gray-600 lg:text-base">
                Sua inscrição no curso <span className="font-semibold text-yellow-500">{course}</span> foi recebida.
            </p>

            <div className="mt-6 w-full rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-relaxed shadow-sm lg:max-w-120 lg:p-6 lg:text-base">
                <p>
                    <strong className="mb-1 block text-yellow-800">Próximos passos:</strong>
                    {}
                    Aguarde o contato de nossa equipe via
                    <span className="font-bold text-green-700 italic">WhatsApp</span> e/ou{" "}
                    <span className="font-bold text-blue-700 italic">e-mail</span> com mais informações sobre o curso e
                    confirmação da matrícula.
                </p>
            </div>

            <div className="mt-8 flex w-full flex-col items-center gap-3">
                <Button
                    onClick={() => setCloseCourse(false)}
                    className="text-md h-12 w-full cursor-pointer border-none bg-yellow-400 font-semibold text-black shadow-md transition-transform hover:bg-yellow-500 active:scale-95 lg:max-w-sm"
                >
                    Ver mais cursos
                </Button>

                <Link
                    href="/"
                    className="text-md flex h-12 w-full cursor-pointer items-center justify-center rounded-md border-2 border-black font-semibold transition-transform hover:bg-gray-50 active:scale-95 lg:max-w-sm"
                >
                    Voltar para Página Principal
                </Link>
            </div>
        </div>
    );
}
