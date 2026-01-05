"use client";

import { useState } from "react";
import {Dialog, DialogContent,DialogHeader,DialogTitle,DialogDescription,} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {Select,SelectContent, SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { IMaskInput } from "react-imask";
import { toast } from "sonner";

type Props = {
    readonly open: boolean;
    readonly setOpen: (open: boolean) => void;
    readonly curso: string;
};

export default function CourseDialog({ open, setOpen, curso }: Props) {
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [pcd, setPcd] = useState(false);

    const [escolaridade, setEscolaridade] = useState("");
    const [vinculo, setVinculo] = useState("");

    async function buscarCEP(valor: string) {
        const cepLimpo = valor.replaceAll(/\D/g, "");
        if (cepLimpo.length !== 8) return;

        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();

        if (!data.erro) {
            setRua(data.logradouro || "");
            setBairro(data.bairro || "");
            setCidade(data.localidade || "");
            setEstado(data.uf || "");
        }
    }

    function finalizarInscricao() {
        toast.success("Inscrição enviada com sucesso!", {
            description: "Sua solicitação foi registrada e será analisada.",
            duration: 4000,
        });

        setOpen(false);
    }

    const inputClass =
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold">
                        Inscrição no Curso{" "}
                        <span className="text-[#C49D00] font-bold">
                            - {curso}
                        </span>
                    </DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para efetivar sua inscrição.
                    </DialogDescription>
                </DialogHeader>

                <section className="mt-8 space-y-4">
                    <h3 className="font-semibold text-lg">Dados Pessoais</h3>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Nome completo *" />
                        <Input type="email" placeholder="E-mail *" />
                        <Input placeholder="Idade *" />

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Raça *" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    "Branca",
                                    "Preta",
                                    "Parda",
                                    "Amarela",
                                    "Indígena",
                                    "Prefiro não informar",
                                ].map((r) => (
                                    <SelectItem key={r} value={r}>
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <IMaskInput
                            mask="(00) 00000-0000"
                            className={inputClass}
                            placeholder="WhatsApp com DDD *"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={pcd}
                            onCheckedChange={(v) => setPcd(Boolean(v))}
                        />
                        <Label>Pessoa com deficiência</Label>
                    </div>

                    {pcd && <Input placeholder="Informe a deficiência *" />}
                </section>

                <section className="mt-8 space-y-4">
                    <h3 className="font-semibold text-lg">Documentação</h3>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>CPF – Frente *</Label>
                            <Input type="file" accept="image/*,.pdf" />
                        </div>

                        <div className="space-y-1">
                            <Label>CPF – Verso *</Label>
                            <Input type="file" accept="image/*,.pdf" />
                        </div>

                        <div className="space-y-1">
                            <Label>RG – Frente *</Label>
                            <Input type="file" accept="image/*,.pdf" />
                        </div>

                        <div className="space-y-1">
                            <Label>RG – Verso *</Label>
                            <Input type="file" accept="image/*,.pdf" />
                        </div>

                        <IMaskInput
                            mask="000.000.000-00"
                            className={inputClass}
                            placeholder="CPF *"
                        />

                        <IMaskInput
                            mask="00.000.000-0"
                            className={inputClass}
                            placeholder="RG *"
                        />

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Órgão expedidor *" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ssp-al">SSP / AL</SelectItem>
                                <SelectItem value="pc-al">Polícia Civil / AL</SelectItem>
                                <SelectItem value="pm-al">Polícia Militar / AL</SelectItem>
                                <SelectItem value="detran-al">DETRAN / AL</SelectItem>
                            </SelectContent>
                        </Select>

                        <Input type="date" />
                    </div>
                </section>

                <section className="mt-8 space-y-4">
                    <h3 className="font-semibold text-lg">Endereço</h3>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <IMaskInput
                            mask="00000-000"
                            value={cep}
                            onAccept={(v) => setCep(v)}
                            onBlur={(e) => buscarCEP(e.target.value)}
                            className={inputClass}
                            placeholder="CEP *"
                        />

                        <Input
                            value={rua}
                            onChange={(e) => setRua(e.target.value)}
                            placeholder="Rua *"
                        />
                        <Input
                            value={bairro}
                            onChange={(e) => setBairro(e.target.value)}
                            placeholder="Bairro *"
                        />
                        <Input
                            value={cidade}
                            onChange={(e) => setCidade(e.target.value)}
                            placeholder="Cidade *"
                        />
                        <Input
                            value={estado}
                            onChange={(e) => setEstado(e.target.value)}
                            placeholder="Estado *"
                        />
                    </div>
                </section>

                <section className="mt-8 space-y-4">
                    <h3 className="font-semibold text-lg">Formação e Vínculo</h3>
                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Escolaridade *" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    { value: "fundamental-incompleto", label: "Ensino Fundamental Incompleto" },
                                    { value: "fundamental-completo", label: "Ensino Fundamental Completo" },
                                    { value: "medio-cursando", label: "Ensino Médio Cursando" },
                                    { value: "medio-completo", label: "Ensino Médio Completo" },
                                    { value: "superior-cursando", label: "Ensino Superior Cursando" },
                                    { value: "superior-completo", label: "Ensino Superior Completo" },
                                ].map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                        onClick={() => setEscolaridade(item.value)}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Vínculo com o IFAL *" />
                            </SelectTrigger>
                            <SelectContent>
                                {[
                                    { value: "aluno", label: "Sou aluno do IFAL" },
                                    { value: "ex-aluno", label: "Sou ex-aluno do IFAL" },
                                    { value: "nao-aluno", label: "Não possuo vínculo com o IFAL" },
                                ].map((item) => (
                                    <SelectItem
                                        key={item.value}
                                        value={item.value}
                                        onClick={() => setVinculo(item.value)}
                                    >
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </section>


                <div className="flex justify-end gap-3 mt-10">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={finalizarInscricao}
                        className="bg-[#FDC700] text-black hover:bg-[#FDC700]/90"
                    >
                        Finalizar Inscrição
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
