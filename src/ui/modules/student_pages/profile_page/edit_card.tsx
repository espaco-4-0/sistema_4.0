import { Button } from "@/src/ui/components/ui/button";
import { Loader2, Save, X } from "lucide-react";

type EditModeBarProps = {
    onCancel: () => void;
    isSaving: boolean;
};

export const EditModeBar = ({ onCancel, isSaving }: EditModeBarProps) => (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 lg:p-5 2xl:p-4 mt-5 lg:mt-7 2xl:mt-7 gap-3 lg:gap-0 rounded-xl border-2 bg-yellow-back-icon-light border-yellow-primary-light text-yellow-icon-dark font-semibold shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-yellow-primary to-yellow-secondary" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-linear-to-br from-yellow-primary to-yellow-secondary animate-ping opacity-75" />
            </div>
            <span className="text-sm lg:text-base 2xl:text-sm">Modo de edição ativado</span>
        </div>
        <div className="flex gap-2 lg:gap-3 w-full lg:w-auto">
            <Button
                variant="outline"
                type="button"
                className="flex gap-2 h-9 lg:h-10 2xl:h-9 text-sm lg:text-md 2xl:text-sm flex-1 lg:flex-none hover:bg-gray-50 transition-all"
                onClick={onCancel}
                disabled={isSaving}
            >
                <X className="size-4" />
                <span className="hidden sm:inline">Cancelar</span>
            </Button>
            <Button
                type="submit"
                className="flex gap-2 h-9 lg:h-10 2xl:h-9 text-sm lg:text-md 2xl:text-sm bg-yellow-secondary hover:bg-yellow-secondary-dark text-black flex-1 lg:flex-none shadow-md hover:shadow-lg transition-all"
                disabled={isSaving}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="animate-spin size-4" />
                        <span className="hidden sm:inline">Processando...</span>
                    </>
                ) : (
                    <>
                        <Save className="size-4" />
                        <span className="hidden sm:inline">Salvar alterações</span>
                    </>
                )}
            </Button>
        </div>
    </div>
);
