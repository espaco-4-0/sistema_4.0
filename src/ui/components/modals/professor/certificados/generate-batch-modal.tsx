"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import { Textarea } from "@/src/ui/components/ui/textarea";

interface GenerateBatchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  templates: Array<{ name: string }>;
}

export function GenerateBatchModal({ isOpen, onOpenChange, onClose, templates }: GenerateBatchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border border-gray-200">
        <DialogHeader>
          <DialogTitle>Gerar em lote</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-1">
              <Label>Arquivo CSV</Label>
              <Input type="file" accept=".csv" />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Mensagem do certificado</Label>
            <Textarea placeholder="Ex.: Certificamos que {{nome}} concluiu {{curso}}" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500">Registros encontrados</p>
              <p className="text-sm font-semibold text-gray-900">124</p>
            </div>
            <div className="border rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500">Templates aplicados</p>
              <p className="text-sm font-semibold text-gray-900">3</p>
            </div>
            <div className="border rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500">Pendências</p>
              <p className="text-sm font-semibold text-gray-900">2</p>
            </div>
          </div>

          <div className="pt-4 border-t flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button variant="secondary" className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              Baixar template CSV
            </Button>
            <Button className="flex-1 bg-yellow-400 text-gray-900 hover:bg-yellow-500">Gerar lote</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
