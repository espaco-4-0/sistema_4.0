import type { CourseRegisterType } from "@/src/ui/forms/schemas/course-registration-schema";
import { UseFormSetValue } from "react-hook-form";
import { toast } from "sonner";

export function useCep(setValue: UseFormSetValue<CourseRegisterType>) {
    return async (cep: string) => {
        const cleanCep = cep.replaceAll(/\D/g, "");
        if (cleanCep.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await res.json();

            if (!data.erro) {
                setValue("road", data.logradouro || "", { shouldValidate: true });
                setValue("neighborhood", data.bairro || "", { shouldValidate: true });
                setValue("city", data.localidade || "", { shouldValidate: true });
                setValue("state", data.uf || "", { shouldValidate: true });
            }
        } catch {
            toast.error("Falha ao buscar CEP");
        }
    };
}
