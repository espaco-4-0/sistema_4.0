import { useState } from "react";
import { ProfileCardFunctionProps } from "@/src/infra/modules/student/profile-card-mock";
import { Button } from "@/src/ui/components/ui/button";
import { Edit, Eye, EyeClosed, FileText, Loader2, User } from "lucide-react";

export function ProfileCard({
    name,
    role,
    course,
    matricula,
    editorModeFunction,
    editorBlurFunction,
    isEditing,
    isBlur,
}: Readonly<ProfileCardFunctionProps>) {
    const [isLoadingToEdit, setIsLoadingToEdit] = useState(false);
    const [isLoadingToBlur, setIsLoadingToBlur] = useState(false);

    async function editProfile() {
        setIsLoadingToEdit(true);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        editorModeFunction();
        setIsLoadingToEdit(false);
    }

    async function blurProfile() {
        setIsLoadingToBlur(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        editorBlurFunction();

        setIsLoadingToBlur(false);
    }

    return (
        <div className="relative bg-linear-to-br from-yellow-primary to-yellow-secondary rounded-xl lg:rounded-2xl 2xl:rounded-2xl p-5 lg:p-6 2xl:p-8 shadow-lg overflow-hidden">
            <div className="absolute -top-16 -right-16 w-32 h-32 lg:-top-20 lg:-right-20 lg:w-48 lg:h-48 2xl:w-60 2xl:h-60 bg-white/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-5 2xl:gap-6">
                <div className="size-20 lg:size-22 2xl:size-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                    <User className="size-10 lg:size-11 2xl:size-12 text-black" strokeWidth={2} />
                </div>

                <div className="flex-1 flex flex-col gap-2 text-center lg:text-left">
                    <h1 className="text-2xl lg:text-2xl 2xl:text-3xl font-bold text-gray-900">{name}</h1>

                    <p className="text-sm lg:text-base font-medium text-gray-800 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-2">
                        <span className="capitalize">{role}</span>
                        <span className="hidden lg:inline">•</span>
                        <span className="capitalize">{course}</span>
                    </p>

                    <p className="text-xs lg:text-sm text-gray-700 flex items-center justify-center lg:justify-start gap-1.5">
                        <FileText className="size-3 lg:size-3.5" />
                        Matrícula:
                        <span className={`transition-all duration-300 ${isBlur ? "blur-sm select-none" : "blur-0"}`}>
                            {matricula}
                        </span>
                    </p>
                </div>

                <Button
                    onClick={blurProfile}
                    disabled={isLoadingToBlur}
                    className="w-full lg:w-auto lg:absolute lg:top-12 lg:right-0 cursor-pointer px-4 py-2.5 lg:py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-60"
                >
                    {isLoadingToBlur && (
                        <>
                            <Loader2 className="animate-spin size-4" />
                            <span>Carregando...</span>
                        </>
                    )}
                    {!isLoadingToBlur && isBlur && (
                        <>
                            <EyeClosed className="size-4" />
                            <span>Mostrar Informações</span>
                        </>
                    )}
                    {!isLoadingToBlur && !isBlur && (
                        <>
                            <Eye className="size-4" />
                            <span>Ocultar Informações</span>
                        </>
                    )}
                </Button>

                <Button
                    onClick={editProfile}
                    disabled={isLoadingToEdit || isEditing}
                    className="w-full lg:w-auto lg:absolute lg:top-0 lg:right-0 cursor-pointer px-4 py-2.5 lg:py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-all shadow-md hover:shadow-lg font-medium flex items-center justify-center gap-2 text-sm lg:text-base disabled:opacity-60"
                >
                    {isLoadingToEdit ? (
                        <>
                            <Loader2 className="animate-spin size-4" />
                            <span>Carregando...</span>
                        </>
                    ) : (
                        <>
                            <Edit className="size-4" />
                            <span>Editar Perfil</span>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
