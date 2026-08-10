"use client";

import { useRef, useState } from "react";
import {
    PROJECT_STATUS_LABELS,
    TASK_STATUS_LABELS,
    fileDownloadUrl,
    type ProjectItem,
} from "@/src/infra/modules/professor/projects-admin.service";
import { Button } from "@/src/ui/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/src/ui/components/ui/dialog";
import { Input } from "@/src/ui/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/components/ui/select";
import {
    useCreateTask,
    useDeleteProjectFile,
    useDeleteTask,
    useProjectTasks,
    useUpdateProject,
    useUpdateTaskStatus,
    useUploadProjectFile,
} from "@/src/ui/modules/teacher_pages/queries/projects.queries";
import { Download, Loader2, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
const PROJECT_STATUSES = ["PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

interface ProjectDetailModalProps {
    project: ProjectItem | null;
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose }: Readonly<ProjectDetailModalProps>) {
    const projectId = project?.id ?? "";
    const [novaTarefa, setNovaTarefa] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: tasks = [], isLoading: loadingTasks } = useProjectTasks(isOpen ? projectId : null);
    const createTask = useCreateTask(projectId);
    const updateStatus = useUpdateTaskStatus(projectId);
    const deleteTask = useDeleteTask(projectId);
    const uploadFile = useUploadProjectFile(projectId);
    const deleteFile = useDeleteProjectFile();
    const updateProject = useUpdateProject();

    function handleCreateTask() {
        if (novaTarefa.trim().length < 3) {
            toast.error("O título da tarefa precisa de ao menos 3 caracteres.");
            return;
        }

        createTask.mutate({ titulo: novaTarefa.trim() }, { onSuccess: () => setNovaTarefa("") });
    }

    function handleUpload(file: File | undefined) {
        if (!file) return;
        uploadFile.mutate(file);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    const concluidas = tasks.filter((t) => t.status === "DONE").length;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{project?.title}</DialogTitle>
                    <DialogDescription>
                        Líder: {project?.leader?.fullName ?? "—"} · {project?._count?.ProjectMember ?? 0} integrante(s)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    <section className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Status:</span>
                        <Select
                            value={project?.status ?? "PLANNED"}
                            onValueChange={(status) =>
                                project && updateProject.mutate({ id: project.id, payload: { status } })
                            }
                        >
                            <SelectTrigger className="h-9 w-52">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PROJECT_STATUSES.map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {PROJECT_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                Tarefas ({concluidas}/{tasks.length})
                            </h3>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                className="h-10"
                                placeholder="Nova tarefa..."
                                value={novaTarefa}
                                onChange={(e) => setNovaTarefa(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                            />
                            <Button onClick={handleCreateTask} disabled={createTask.isPending} className="gap-2">
                                <Plus className="h-4 w-4" /> Adicionar
                            </Button>
                        </div>

                        {loadingTasks ? (
                            <div className="flex items-center gap-2 text-sm text-gray-400 py-4 justify-center">
                                <Loader2 className="h-4 w-4 animate-spin" /> Carregando tarefas...
                            </div>
                        ) : tasks.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-lg">
                                Nenhuma tarefa ainda.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                            {task.assignedTo ? (
                                                <p className="text-xs text-gray-500">{task.assignedTo.fullName}</p>
                                            ) : null}
                                        </div>

                                        <Select
                                            value={task.status}
                                            onValueChange={(status) => updateStatus.mutate({ taskId: task.id, status })}
                                        >
                                            <SelectTrigger className="h-9 w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TASK_STATUSES.map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {TASK_STATUS_LABELS[status]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <button
                                            type="button"
                                            aria-label={`Excluir ${task.title}`}
                                            onClick={() => deleteTask.mutate(task.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="space-y-3 border-t pt-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Anexos</h3>
                            <Button
                                variant="outline"
                                className="gap-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadFile.isPending}
                            >
                                <Upload className="h-4 w-4" />
                                {uploadFile.isPending ? "Enviando..." : "Anexar"}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => handleUpload(e.target.files?.[0])}
                            />
                        </div>

                        {(project?.ProjectFile ?? []).length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4 border border-dashed rounded-lg">
                                Nenhum arquivo anexado.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {project?.ProjectFile.map((file) => (
                                    <div key={file.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                                        <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                                        <span className="flex-1 text-sm text-gray-700 truncate">{file.filename}</span>

                                        <a
                                            href={fileDownloadUrl(file.id)}
                                            className="p-2 text-gray-400 hover:text-gray-700 transition"
                                            aria-label={`Baixar ${file.filename}`}
                                        >
                                            <Download className="h-4 w-4" />
                                        </a>

                                        <button
                                            type="button"
                                            aria-label={`Remover ${file.filename}`}
                                            onClick={() => deleteFile.mutate(file.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </DialogContent>
        </Dialog>
    );
}
