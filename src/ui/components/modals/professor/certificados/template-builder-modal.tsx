"use client";

import { toast } from "sonner";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Textarea } from "@/src/ui/components/ui/textarea";

interface TemplateBuilderModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function TemplateBuilderModal({ isOpen, onOpenChange, onClose }: Readonly<TemplateBuilderModalProps>) {
  const handleSaveTemplate = () => {
    toast.success("Template salvo com sucesso!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border border-gray-200">
        <DialogHeader>
          <DialogTitle>Novo template</DialogTitle>
        </DialogHeader>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Nome do template</Label>
              <Input placeholder="Ex.: Certificado de Conclusão" />
            </div>
            <div className="space-y-1">
              <Label>Categoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participacao">Participação</SelectItem>
                  <SelectItem value="conclusao">Conclusão</SelectItem>
                  <SelectItem value="excelencia">Excelência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Imagem de fundo</Label>
              <Input type="file" accept="image/*" />
            </div>
            <div className="space-y-1">
              <Label>Texto principal</Label>
              <Textarea placeholder="Ex.: Certificamos que {{nome}} participou..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nome do responsável</Label>
                <Input placeholder="Ex.: Prof. Ana Costa" />
              </div>
              <div className="space-y-1">
                <Label>Cargo</Label>
                <Input placeholder="Ex.: Coordenadora Acadêmica" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Pré-visualização</Label>
            <div className="border rounded-xl p-4 bg-yellow-50 border-yellow-200 h-full min-h-65">
              <div className="border border-dashed border-yellow-300 rounded-lg h-full flex items-center justify-center text-sm text-gray-600">
                Prévia do template
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="pt-4 border-t flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:cursor-pointer text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-yellow-400 hover:cursor-pointer text-gray-900 hover:bg-yellow-500"
              onClick={handleSaveTemplate}
            >
              Salvar template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
