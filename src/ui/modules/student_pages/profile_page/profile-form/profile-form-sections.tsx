import { CourseRegisterType } from "@/src/ui/forms/schemas/course-registration-schema";
import { motion } from "framer-motion";
import { GraduationCap, Mail, MapPin, User } from "lucide-react";

import { FormField } from "../../../landing_page/course_dialog";
import { BlurCard } from "../blur_card";
import { ControlledField, Field, fieldConfigs, getFieldRegister, type FieldConfig } from "./profile-form-fields";

const formatDate = (d?: Date) => (d instanceof Date ? new Intl.DateTimeFormat("pt-BR").format(d) : "-");

const DisplayField = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-sm text-gray-800 py-2">{value || "-"}</p>
    </div>
);

const getDisplayValue = (f: FieldConfig, data: CourseRegisterType) => {
    if (f.type === "date") return formatDate(data[f.name] as Date | undefined);
    if (f.formatLabel) return f.formatLabel(data[f.name] as string);
    return data[f.name] as React.ReactNode;
};

type SectionsProps = {
    isBlur: boolean;
    formDataValues: CourseRegisterType;
    matricula: string;
    control: any;
    register: any;
    errors: any;
    onToggleBlur: () => void;
    onMatriculaChange: (value: string) => void;
    onCepBlur: (cep: string) => void;
    isOtherDeficiency: boolean;
};

const sections = [
    {
        title: "Dados Pessoais",
        icon: User,
        fields: "personal",
        extra: (d: CourseRegisterType) =>
            d.deficiency === "Outro" ? <DisplayField label="Qual deficiência?" value={d.deficiencyDetail} /> : null,
    },
    { title: "Documentação", icon: Mail, fields: "documentation" },
    {
        title: "Endereço",
        icon: MapPin,
        fields: "address",
        extra: (d: CourseRegisterType) => <DisplayField label="UF" value={d.state} />,
    },
    {
        title: "Formação e Vínculo",
        icon: GraduationCap,
        fields: "education",
        extra: (_: CourseRegisterType, m: string) => <DisplayField label="Matrícula" value={m} />,
    },
];

function Section({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="mt-6 lg:mt-8 2xl:mt-8 w-full p-5 lg:p-6 2xl:p-6 bg-white shadow-sm hover:shadow-md rounded-xl lg:rounded-2xl transition-all duration-300 border border-gray-100">
            <div className="flex items-center gap-1 text-lg lg:text-xl 2xl:text-lg font-semibold text-gray-800">
                <div className="flex justify-center items-center rounded-lg lg:rounded-xl size-9 lg:size-10 2xl:size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-2.5 lg:mr-3 2xl:mr-3 shadow-sm">
                    <Icon className="text-black size-4 lg:size-5 2xl:size-5" />
                </div>
                {title}
            </div>

            <div className="my-4 lg:my-5 2xl:my-4 h-px bg-gray-100" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 2xl:gap-5">{children}</div>
        </div>
    );
}

export function ProfileFormSections({
    isBlur,
    formDataValues,
    matricula,
    control,
    register,
    errors,
    onToggleBlur,
    onMatriculaChange,
    onCepBlur,
    isOtherDeficiency,
}: SectionsProps) {
    return (
        <div className="space-y-2">
            {sections.map((s, i) => (
                <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.07, ease: "easeOut" }}
                >
                    <BlurCard isBlur={isBlur} onToggle={onToggleBlur}>
                        <Section title={s.title} icon={s.icon}>
                            {fieldConfigs[s.fields].map((f: FieldConfig) => (
                                <DisplayField key={f.name} label={f.label} value={getDisplayValue(f, formDataValues)} />
                            ))}
                            {s.extra?.(formDataValues, matricula)}
                        </Section>
                    </BlurCard>
                </motion.div>
            ))}
        </div>
    );
}
