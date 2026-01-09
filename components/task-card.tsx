"use client";

import { Task } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Edit,
    Trash2,
    RotateCcw,
    CheckCircle,
    Clock,
    Circle,
} from "lucide-react";

interface TaskCardProps {
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
    onToggle: (task: Task) => void;
}

const statusConfig = {
    TODO: {
        label: "To Do",
        icon: Circle,
        color: "bg-slate-100 text-slate-600 border-slate-200",
        barColor: "bg-slate-400"
    },
    IN_PROGRESS: {
        label: "In Progress",
        icon: Clock,
        color: "bg-blue-50 text-blue-600 border-blue-200",
        barColor: "bg-blue-500"
    },
    COMPLETED: {
        label: "Completed",
        icon: CheckCircle,
        color: "bg-green-50 text-[#4A7C59] border-green-200",
        barColor: "bg-[#4A7C59]"
    },
};

const priorityConfig = {
    low: {
        label: "Low",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    medium: {
        label: "Medium",
        color: "bg-yellow-50 text-yellow-600 border-yellow-200",
    },
    high: {
        label: "High",
        color: "bg-red-50 text-red-600 border-red-200",
    },
};

export function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
    const status = statusConfig[task.status];
    const priority = priorityConfig[task.priority];
    const StatusIcon = status.icon;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "COMPLETED";

    return (
        <div className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-[#4A7C59]/30 hover:shadow-md transition-all duration-300">
            <div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${status.barColor}`}
            />

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3
                        className={`text-lg font-semibold truncate ${task.status === "COMPLETED"
                            ? "text-slate-500 line-through"
                            : "text-slate-900"
                            }`}
                    >
                        {task.title}
                    </h3>

                    {task.description && (
                        <p className="text-slate-500 text-sm mt-1 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                        </Badge>
                        <Badge variant="outline" className={priority.color}>
                            {priority.label}
                        </Badge>
                        {task.dueDate && (
                            <Badge
                                variant="outline"
                                className={
                                    isOverdue
                                        ? "bg-red-50 text-red-600 border-red-200"
                                        : "bg-slate-50 text-slate-600 border-slate-200"
                                }
                            >
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(task.dueDate)}
                                {isOverdue && " (Overdue)"}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggle(task)}
                        className="h-8 w-8 text-slate-400 hover:text-[#4A7C59] hover:bg-green-50"
                        title="Toggle Status"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(task)}
                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                        title="Edit Task"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(task)}
                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete Task"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
