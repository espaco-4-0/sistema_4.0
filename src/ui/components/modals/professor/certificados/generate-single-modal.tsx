"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";

interface GenerateSingleModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  templates: Array<{ name: string }>;
  students: Array<{ name: string; course: string }>;
}

export function GenerateSingleModal({
  isOpen,
  onOpenChange,
  onClose,
  templates,
  students,
}: Readonly<GenerateSingleModalProps>) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border border-gray-200">
        <DialogHeader>
          <DialogTitle>Gerar único</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Aluno</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.name} value={student.name}>
                      {student.name} • {student.course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Template</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((item) => (
                    <SelectItem key={item.name} value={item.name}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Mensagem personalizada</Label>
            <Input placeholder="Ex.: Certificamos que {{nome}} participou..." />
          </div>

          <div className="border rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-2">Prévia</p>
            <div className="h-40 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center text-sm text-gray-700">
              Pré-visualização do certificado
            </div>
          </div>

          <div className="pt-4 border-t flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:cursor-pointer text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button className="flex-1 bg-yellow-400 text-gray-900 hover:cursor-pointer hover:bg-yellow-500">Gerar certificado</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
