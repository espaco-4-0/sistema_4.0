import { CourseRegisterType } from "@/src/ui/forms/schemas/course-registration-schema";

import { EditModeBar } from "../edit_card";
import { ProfileCard } from "../profile_card";
import { ProfileFormSections } from "./profile-form-sections";

type ProfileFormProps = {
    isEditing: boolean;
    isSaving: boolean;
    isBlur: boolean;
    formDataValues: CourseRegisterType;
    matricula: string;
    control: any;
    register: any;
    errors: any;
    onCancel: () => void;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    onToggleBlur: () => void;
    onEdit: () => void;
    onMatriculaChange: (value: string) => void;
    onCepBlur: (cep: string) => void;
    isOtherDeficiency: boolean;
};

export function ProfileForm({
    isEditing,
    isSaving,
    isBlur,
    formDataValues,
    matricula,
    control,
    register,
    errors,
    onCancel,
    onSubmit,
    onToggleBlur,
    onEdit,
    onMatriculaChange,
    onCepBlur,
    isOtherDeficiency,
}: ProfileFormProps) {
    return (
        <div className="px-4 pb-6 lg:px-8 lg:pb-8 2xl:px-15 2xl:pb-10">
            <ProfileCard
                name={formDataValues.name}
                role={formDataValues.affiliation}
                course={formDataValues.education}
                matricula={matricula}
                editorModeFunction={onEdit}
                editorBlurFunction={onToggleBlur}
                isEditing={isEditing}
                isBlur={isBlur}
            />

            {isEditing ? (
                <form className="space-y-2 mt-8" onSubmit={onSubmit}>
                    <EditModeBar onCancel={onCancel} isSaving={isSaving} />
                    <ProfileFormSections
                        isBlur={isBlur}
                        formDataValues={formDataValues}
                        matricula={matricula}
                        control={control}
                        register={register}
                        errors={errors}
                        onToggleBlur={onToggleBlur}
                        onMatriculaChange={onMatriculaChange}
                        onCepBlur={onCepBlur}
                        isOtherDeficiency={isOtherDeficiency}
                    />
                </form>
            ) : (
                <ProfileFormSections
                    isBlur={isBlur}
                    formDataValues={formDataValues}
                    matricula={matricula}
                    control={control}
                    register={register}
                    errors={errors}
                    onToggleBlur={onToggleBlur}
                    onMatriculaChange={onMatriculaChange}
                    onCepBlur={onCepBlur}
                    isOtherDeficiency={isOtherDeficiency}
                />
            )}
        </div>
    );
}
