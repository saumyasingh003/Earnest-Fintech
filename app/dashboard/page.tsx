"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Task, TaskFilters, TaskStatus, TaskPriority, TaskCreateInput, TaskUpdateInput } from "@/lib/types";
import { fetchTasks, createTask, updateTask, deleteTask, toggleTaskStatus } from "@/lib/api";
import { TaskCard } from "@/components/task-card";
import { TaskDialog } from "@/components/task-dialog";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
    Plus,
    Search,
    LogOut,
    User,
    Loader2,
    RefreshCw,
    LayoutDashboard,
    Circle,
    Clock,
    CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [page] = useState(1);
    const limit = 50;

    const [filters, setFilters] = useState<TaskFilters>({
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc",
        status: "ALL",
        priority: "ALL",
    });
    const [searchInput, setSearchInput] = useState("");

    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    const loadTasks = useCallback(async (showRefreshIndicator = false) => {
        try {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            const response = await fetchTasks(page, limit, filters);
            setTasks(response.tasks);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load tasks");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [page, filters]);

    useEffect(() => {
        if (isAuthenticated) {
            loadTasks();
        }
    }, [isAuthenticated, loadTasks]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== filters.search) {
                setFilters((prev) => ({ ...prev, search: searchInput }));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, filters.search]);

    const handleCreateTask = async (data: TaskCreateInput | TaskUpdateInput) => {
        setIsSubmitting(true);
        try {
            await createTask(data as TaskCreateInput);
            toast.success("Task created successfully!");
            setTaskDialogOpen(false);
            loadTasks(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create task");
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateTask = async (data: TaskCreateInput | TaskUpdateInput) => {
        if (!editingTask) return;
        setIsSubmitting(true);
        try {
            await updateTask(editingTask.id, data as TaskUpdateInput);
            toast.success("Task updated successfully!");
            setTaskDialogOpen(false);
            setEditingTask(null);
            loadTasks(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update task");
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = async () => {
        if (!deletingTask) return;
        setIsSubmitting(true);
        try {
            await deleteTask(deletingTask.id);
            toast.success("Task deleted successfully!");
            setDeleteDialogOpen(false);
            setDeletingTask(null);
            loadTasks(true);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete task");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (task: Task) => {
        try {
            const updatedTask = await toggleTaskStatus(task.id);
            setTasks((prev) =>
                prev.map((t) => (t.id === task.id ? updatedTask : t))
            );
            toast.success(`Task status changed to ${updatedTask.status.replace("_", " ")}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to toggle status");
        }
    };

    const handleDragStart = (e: React.DragEvent, taskId: string) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", taskId);
        (e.currentTarget as HTMLElement).style.opacity = "0.5";
    };

    const handleDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).style.opacity = "1";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");

        if (!taskId) return;

        const task = tasks.find((t) => t.id === taskId);
        if (!task || task.status === newStatus) return;

        const previousTasks = [...tasks];
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );

        try {
            await updateTask(taskId, { status: newStatus });
            toast.success(`Task moved to ${newStatus.replace("_", " ")}`);
        } catch {
            setTasks(previousTasks);
            toast.error("Failed to move task");
        }
    };

    const handleEdit = (task: Task) => {
        setEditingTask(task);
        setTaskDialogOpen(true);
    };

    const handleDelete = (task: Task) => {
        setDeletingTask(task);
        setDeleteDialogOpen(true);
    };

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split("-") as [
            "createdAt" | "dueDate" | "priority",
            "asc" | "desc"
        ];
        setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    };

    const handlePriorityFilter = (value: string) => {
        setFilters((prev) => ({ ...prev, priority: value as TaskPriority | "ALL" }));
    };

    const columns: { id: TaskStatus; title: string; icon: typeof Circle; color: string; bgColor: string }[] = [
        { id: "TODO", title: "To Do", icon: Circle, color: "text-slate-500", bgColor: "bg-slate-50" },
        { id: "IN_PROGRESS", title: "In Progress", icon: Clock, color: "text-blue-500", bgColor: "bg-blue-50" },
        { id: "COMPLETED", title: "Completed", icon: CheckCircle2, color: "text-green-500", bgColor: "bg-green-50" },
    ];

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 animate-spin text-[#4A7C59]" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 bg-[#4A7C59] rounded-xl flex items-center justify-center shadow-md">
                                <LayoutDashboard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Task Board</h1>
                                <p className="text-xs text-slate-500 hidden sm:block">
                                    Drag & drop to organize tasks
                                </p>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                                <User className="w-4 h-4 text-[#4A7C59]" />
                                <span className="text-sm text-slate-700">{user?.name || user?.email}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search tasks..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#4A7C59] focus:ring-[#4A7C59]"
                        />
                    </div>

                    <Select
                        value={`${filters.sortBy}-${filters.sortOrder}`}
                        onValueChange={handleSortChange}
                    >
                        <SelectTrigger className="w-full sm:w-44 bg-white border-slate-200 text-slate-900">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="createdAt-desc">Newest First</SelectItem>
                            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                            <SelectItem value="dueDate-asc">Due Date (Asc)</SelectItem>
                            <SelectItem value="dueDate-desc">Due Date (Desc)</SelectItem>
                            <SelectItem value="priority-desc">Priority (High)</SelectItem>
                            <SelectItem value="priority-asc">Priority (Low)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.priority || "ALL"}
                        onValueChange={handlePriorityFilter}
                    >
                        <SelectTrigger className="w-full sm:w-36 bg-white border-slate-200 text-slate-900">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-slate-200">
                            <SelectItem value="ALL">All Priority</SelectItem>
                            <SelectItem value="high">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                    <span>High</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                    <span>Medium</span>
                                </div>
                            </SelectItem>
                            <SelectItem value="low">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                    <span>Low</span>
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => loadTasks(true)}
                        disabled={isRefreshing}
                        className="bg-white border-slate-200 text-slate-500 hover:text-[#4A7C59] hover:bg-slate-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                    </Button>

                    <Button
                        onClick={() => {
                            setEditingTask(null);
                            setTaskDialogOpen(true);
                        }}
                        className="bg-[#4A7C59] hover:bg-[#3d664a] text-white shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#4A7C59]" />
                    </div>
                ) : (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0 overflow-hidden">
                        {columns.map((column) => {
                            const columnTasks = tasks.filter((t) => t.status === column.id);
                            const ColumnIcon = column.icon;
                            return (
                                <div
                                    key={column.id}
                                    className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, column.id)}
                                >
                                    <div className={`p-4 border-b border-slate-100 ${column.bgColor} flex items-center justify-between shrink-0`}>
                                        <div className="flex items-center gap-2">
                                            <ColumnIcon className={`w-5 h-5 ${column.color}`} />
                                            <h2 className="font-semibold text-slate-800">{column.title}</h2>
                                        </div>
                                        <span className="bg-white text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 shadow-sm">
                                            {columnTasks.length}
                                        </span>
                                    </div>

                                    <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[300px]">
                                        {columnTasks.length === 0 ? (
                                            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                                <p className="text-sm text-slate-400">Drop tasks here</p>
                                            </div>
                                        ) : (
                                            columnTasks.map((task) => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, task.id)}
                                                    onDragEnd={handleDragEnd}
                                                    className="cursor-grab active:cursor-grabbing"
                                                >
                                                    <TaskCard
                                                        task={task}
                                                        onEdit={handleEdit}
                                                        onDelete={handleDelete}
                                                        onToggle={handleToggleStatus}
                                                    />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <TaskDialog
                open={taskDialogOpen}
                onOpenChange={(open) => {
                    setTaskDialogOpen(open);
                    if (!open) setEditingTask(null);
                }}
                task={editingTask}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                isLoading={isSubmitting}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                task={deletingTask}
                onConfirm={handleDeleteTask}
                isLoading={isSubmitting}
            />
        </div>
    );
}
