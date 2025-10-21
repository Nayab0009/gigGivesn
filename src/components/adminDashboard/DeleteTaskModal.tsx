import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import type { Task } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/colors";

interface DeleteTaskModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  task: Task;
  taskId: number;
}

export function DeleteTaskModal({
  open,
  onClose,
  onDelete,
  task,
}: DeleteTaskModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      // Restore background scrolling
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  // Check if user is authorized to delete tasks
  const isAuthorizedToDeleteTasks = () => {
    if (!isAuthenticated || !user) {
      return false;
    }

    const authorizedRoles = ['admin', 'manager'];
    return authorizedRoles.includes(user.role.toLowerCase());
  };

  const handleDeleteTask = async () => {
    if (!isAuthorizedToDeleteTasks()) {
      setError('You are not authorized to delete tasks. Only admins and managers can delete tasks.');
      return;
    }

    if (!task.id) {
      setError('Task ID is required to delete the task.');
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await axiosInstance.delete(`/tasks/${task.id}`);
      onDelete(); // Call the onDelete callback to refresh the task list
      onClose(); // Close the modal
    } catch (error: any) {
      console.error('Error deleting task:', error);
      setError(
        error.response?.data?.message ||
        'Failed to delete task. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!open) return null;

  // Show authorization error if user is not authorized
  if (!isAuthorizedToDeleteTasks()) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-black/30 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border-2 border-white/30 p-6 mx-4">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300 mb-6">
              You are not authorized to delete tasks. Only administrators and managers can delete tasks.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[100px] flex items-center justify-center z-[9999] p-4 overflow-hidden">
      <div className="bg-black/30 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border-2 border-white/30 p-6">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Delete Task</h2>
          <p className="text-gray-300 text-sm">Are you sure you want to delete this task?</p>
        </div>


        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 rounded-xl border border-gray-400 text-gray-200 hover:bg-white/10 disabled:opacity-50 transition-all"
          >
            No, Cancel
          </button>
          <button
            onClick={handleDeleteTask}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}