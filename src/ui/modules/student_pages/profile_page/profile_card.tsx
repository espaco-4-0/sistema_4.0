import { useState } from "react";
import { ProfileCardFunctionProps } from "@/src/infra/modules/student/profile-card";
import { Button } from "@/src/ui/components/ui/button";
import { Edit, FileText, Loader2, User } from "lucide-react";

export function ProfileCard({
    name,
    role,
    course,
    matricula,
    editorModeFunction,
    isEditing,
}: Readonly<ProfileCardFunctionProps>) {
    const [isLoadingToEdit, setIsLoadingToEdit] = useState(false);

    async function editProfile() {
        setIsLoadingToEdit(true);
        await new Promise((f) => setTimeout(f, 2000));
        editorModeFunction();
        setIsLoadingToEdit(false);
    }

    return (
        <div className="relative bg-linear-to-br from-yellow-primary to-yellow-secondary rounded-2xl p-8 shadow-xl overflow-hidden mt-6">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30">
                        <User className="w-12 h-12 text-white" strokeWidth={2} />
                    </div>
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Edit className="w-4 h-4 text-gray-700" />
                    </button>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
                    <p className="text-gray-800 mb-1 flex items-center justify-center md:justify-start gap-2">
                        <span className="font-medium">{role}</span>
                        <span className="text-gray-700">•</span>
                        <span>{course}</span>
                    </p>
                    <p className="text-sm text-gray-700 flex items-center justify-center md:justify-start gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Matrícula: {matricula}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => editProfile()}
                        disabled={isLoadingToEdit || isEditing}
                        className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-colors shadow-md font-medium flex items-center gap-2"
                    >
                        {isLoadingToEdit ? (
                            <>
                                <Loader2 className="animate-spin" /> Carregando...
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4" />
                                Editar Perfil
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
