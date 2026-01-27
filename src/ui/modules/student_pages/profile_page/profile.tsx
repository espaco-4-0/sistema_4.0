"use client";

import { useState } from "react";
import { profileCardMock } from "@/src/infra/modules/student/profile-card";
import { Button } from "@/src/ui/components/ui/button";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Separator } from "@/src/ui/components/ui/separator";
import { Edit, GraduationCap, Loader2, Mail, MapPin, Save, User, X } from "lucide-react";
import { toast } from "sonner";

import { ProfileCard } from "./profile_card";

const INPUT_STYLES = "bg-white text-xl h-10 border-gray-300 focus:border-yellow-primary focus:ring-yellow-primary/20";

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [initialData, setInitialData] = useState({
        nome: "João",
        sobrenome: "Silva Santos",
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        dataNascimento: "15/03/2000",
        idade: "26 anos",
        email: "joao.silva@estudante.ifal.edu.br",
        senha: "******",
        telefone: "(82) 3221-4567",
        celular: "(82) 99876-5432",
        rua: "Rua das Flores",
        numero: "123",
        complemento: "Apto 45",
        bairro: "Centro",
        cidade: "Maceió",
        estado: "Alagoas",
        cep: "57000-000",
        instituicao: "IFAL - Instituto Federal de Alagoas",
        curso: "Análise e Desenvolvimento de Sistemas",
        matricula: "20231234567",
    });

    const [formData, setFormData] = useState(initialData);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setInitialData(formData); // Atualiza os dados base para o último salvo
            setIsEditing(false);

            // Aqui você implementaria a chamada à API para salvar os dados
            console.log("Dados salvos:", formData);
            // Exemplo: await api.updateProfile(formData);

            toast.success("Perfil atualizado com sucesso!", {
                description: "Suas informações foram salvas.",
            });
        } catch (error) {
            toast.error("Erro ao salvar", {
                description: "Não foi possível salvar as alterações.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(initialData); // Restaura os dados do último salvamento
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="px-40 py-10">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-semibold mb-2">Meu perfil</h1>
                    <p className="text-gray-600">Visualize e edite suas informações pessoais</p>
                </div>
            </div>
            <ProfileCard
                name={`${formData.nome} ${formData.sobrenome}`}
                role={profileCardMock.role}
                course={formData.curso}
                matricula={formData.matricula}
                editorModeFunction={() => setIsEditing(true)}
                isEditing={isEditing}
            />
            {isEditing && (
                <div className="flex items-center text-yellow-icon-dark font-semibold bg-yellow-back-icon-light border border-yellow-primary-light justify-between p-4 rounded-lg mt-9">
                    <div className="flex gap-3 items-center">
                        <div className="w-2 h-2 bg-linear-to-br from-yellow-primary to-yellow-secondary rounded-full animate-pulse" />
                        Modo de edição ativado
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            className="text-gray-700 cursor-pointer flex gap-2 h-10 text-md"
                            disabled={isSaving}
                        >
                            <X /> Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-yellow-secondary text-black cursor-pointer flex gap-2 h-10 text-md"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Save /> Salvar alterações
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            <div className="mt-7 w-full p-6 bg-white shadow rounded-2xl">
                <div className="flex items-center text-xl font-semibold">
                    <div className="flex justify-center items-center rounded-xl size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-3">
                        <User className="text-white" />
                    </div>
                    Dados Pessoais
                </div>
                <Separator className="my-4 bg-gray-100" />
                <div className="rounded grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">NOME</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.nome}
                                onChange={(e) => handleChange("nome", e.target.value)}
                            />
                        ) : (
                            <span>{formData.nome}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">SOBRENOME</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.sobrenome}
                                onChange={(e) => handleChange("sobrenome", e.target.value)}
                            />
                        ) : (
                            <span>{formData.sobrenome}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">CPF</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.cpf}
                                onChange={(e) => handleChange("cpf", e.target.value)}
                            />
                        ) : (
                            <span>{formData.cpf}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">RG</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.rg}
                                onChange={(e) => handleChange("rg", e.target.value)}
                            />
                        ) : (
                            <span>{formData.rg}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">DATA DE NASCIMENTO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.dataNascimento}
                                onChange={(e) => handleChange("dataNascimento", e.target.value)}
                            />
                        ) : (
                            <span>{formData.dataNascimento}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">IDADE</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.idade}
                                onChange={(e) => handleChange("idade", e.target.value)}
                            />
                        ) : (
                            <span>{formData.idade}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 w-full p-6 bg-white shadow rounded-2xl">
                <div className="flex items-center text-xl font-semibold">
                    <div className="flex justify-center items-center rounded-xl size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-3">
                        <Mail className="text-white" />
                    </div>
                    Informações de Contato
                </div>
                <Separator className="my-4 bg-gray-100" />
                <div className="rounded grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">E-MAIL</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                            />
                        ) : (
                            <span>{formData.email}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">SENHA</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                type="email"
                                value={formData.senha}
                                onChange={(e) => handleChange("senha", e.target.value)}
                            />
                        ) : (
                            <span>{formData.senha}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">TELEFONE</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.telefone}
                                onChange={(e) => handleChange("telefone", e.target.value)}
                            />
                        ) : (
                            <span>{formData.telefone}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">CELULAR</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.celular}
                                onChange={(e) => handleChange("celular", e.target.value)}
                            />
                        ) : (
                            <span>{formData.celular}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 w-full p-6 bg-white shadow rounded-2xl">
                <div className="flex items-center text-xl font-semibold">
                    <div className="flex justify-center items-center rounded-xl size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-3">
                        <MapPin className="text-white" />
                    </div>
                    Endereço
                </div>
                <Separator className="my-4 bg-gray-100" />
                <div className="rounded grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">RUA</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.rua}
                                onChange={(e) => handleChange("rua", e.target.value)}
                            />
                        ) : (
                            <span>{formData.rua}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">NÚMERO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.numero}
                                onChange={(e) => handleChange("numero", e.target.value)}
                            />
                        ) : (
                            <span>{formData.numero}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">COMPLEMENTO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.complemento}
                                onChange={(e) => handleChange("complemento", e.target.value)}
                            />
                        ) : (
                            <span>{formData.complemento}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">BAIRRO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.bairro}
                                onChange={(e) => handleChange("bairro", e.target.value)}
                            />
                        ) : (
                            <span>{formData.bairro}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">CIDADE</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.cidade}
                                onChange={(e) => handleChange("cidade", e.target.value)}
                            />
                        ) : (
                            <span>{formData.cidade}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">ESTADO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.estado}
                                onChange={(e) => handleChange("estado", e.target.value)}
                            />
                        ) : (
                            <span>{formData.estado}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">CEP</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.cep}
                                onChange={(e) => handleChange("cep", e.target.value)}
                            />
                        ) : (
                            <span>{formData.cep}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10 w-full p-6 bg-white shadow rounded-2xl">
                <div className="flex items-center text-xl font-semibold">
                    <div className="flex justify-center items-center rounded-xl size-10 bg-linear-to-br from-yellow-primary to-yellow-secondary mr-3">
                        <GraduationCap className="text-white" />
                    </div>
                    Informações Acadêmicas
                </div>
                <Separator className="my-4 bg-gray-100" />
                <div className="rounded grid grid-cols-2 gap-8">
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">INSTITUIÇÃO DE ENSINO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.instituicao}
                                onChange={(e) => handleChange("instituicao", e.target.value)}
                            />
                        ) : (
                            <span>{formData.instituicao}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">CURSO</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.curso}
                                onChange={(e) => handleChange("curso", e.target.value)}
                            />
                        ) : (
                            <span>{formData.curso}</span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label className="text-gray-500">MATRÍCULA</Label>
                        {isEditing ? (
                            <Input
                                className={INPUT_STYLES}
                                value={formData.matricula}
                                onChange={(e) => handleChange("matricula", e.target.value)}
                            />
                        ) : (
                            <span>{formData.matricula}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
