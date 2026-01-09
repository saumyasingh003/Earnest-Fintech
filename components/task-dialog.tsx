"use client";

import { useState } from "react";
import { Task, TaskCreateInput, TaskUpdateInput, TaskStatus, TaskPriority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X, Circle, Clock, CheckCircle2 } from "lucide-react";

interface TaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task?: Task | null;
    onSubmit: (data: TaskCreateInput | TaskUpdateInput) => Promise<void>;
    isLoading?: boolean;
}

export function TaskDialog({
    open,
    onOpenChange,
    task,
    onSubmit,
    isLoading,
}: TaskDialogProps) {
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const [status, setStatus] = useState<TaskStatus>(task?.status || "TODO");
    const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
    const [dueDate, setDueDate] = useState(
        task?.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""
    );
    const [error, setError] = useState("");

    const isEditMode = !!task;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
                status,
                priority,
                dueDate: dueDate || undefined,
            });
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setStatus("TODO");
        setPriority("medium");
        setDueDate("");
        setError("");
        onOpenChange(false);
    };

    useState(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setStatus(task.status);
            setPriority(task.priority);
            setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "");
        }
    });

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 text-slate-900">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                        {isEditMode ? "Edit Task" : "Create New Task"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {isEditMode
                            ? "Update the task details below."
                            : "Fill in the details to create a new task."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-700">
                            Title <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59] focus:ring-[#4A7C59]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-700">
                            Description
                        </Label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter task description..."
                            rows={3}
                            className="w-full rounded-md bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59] focus:ring-1 focus:ring-[#4A7C59] p-3 text-sm resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="status" className="text-slate-700">
                                Status
                            </Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                    <SelectItem value="TODO" className="text-slate-900 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Circle className="w-4 h-4 text-slate-500" />
                                            <span>To Do</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="IN_PROGRESS" className="text-slate-900 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                            <span>In Progress</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="COMPLETED" className="text-slate-900 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            <span>Completed</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority" className="text-slate-700">
                                Priority
                            </Label>
                            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200">
                                    <SelectItem value="low" className="text-slate-900 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                            <span>Low</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="medium" className="text-slate-900 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                            <span>Medium</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="high" className="text-slate-900 hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                            <span>High</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dueDate" className="text-slate-700">
                            Due Date
                        </Label>
                        <Input
                            id="dueDate"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-white border-slate-200 text-slate-900 focus:border-[#4A7C59] focus:ring-[#4A7C59]"
                        />
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-[#4A7C59] hover:bg-[#3d664a] text-white"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            {isEditMode ? "Update Task" : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
