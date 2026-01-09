"use client";

import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task | null;
    onConfirm: () => Promise<void>;
    isLoading?: boolean;
}

export function DeleteConfirmDialog({
    open,
    onOpenChange,
    task,
    onConfirm,
    isLoading,
}: DeleteConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-900">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <DialogTitle className="text-xl font-semibold text-center text-slate-900">
                        Delete Task
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-500">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-slate-900">&quot;{task?.title}&quot;</span>?
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2 pt-4 sm:justify-center">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete Task
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
