"use client";

import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Label } from "@/src/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/ui/components/ui/select";

interface EditSystemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export function EditSystemModal({ isOpen, onOpenChange, onClose }: EditSystemModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Sistema</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5">
          <div>
            <Label>Nome do Sistema</Label>
            <Input defaultValue="Sistema Acadêmico EduTech" />
          </div>

          <div>
            <Label>Instituição</Label>
            <Input defaultValue="Universidade Federal" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sigla</Label>
              <Input defaultValue="UFED" />
            </div>
            <div>
              <Label>Ambiente</Label>
              <Select defaultValue="producao">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ambiente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="producao">Produção</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="homologacao">Homologação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>URL do Sistema</Label>
            <Input type="url" defaultValue="https://edutech.com.br" />
          </div>

          <div className="pt-4 border-t flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
