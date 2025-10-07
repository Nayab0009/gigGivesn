"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteTaskModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string; // optional name to display (like task name)
}

export default function DeleteTaskModal({
  open,
  onClose,
  onConfirm,
  itemName,
}: DeleteTaskModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // simulate delete action (for UI only)
  const handleConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      onConfirm();
      setIsDeleting(false);
      onClose();
    }, 1000); // just to show loading for UX
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[100px] flex items-center justify-center z-[9999] p-4 overflow-hidden">
      <div className="bg-black/30 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md border-2 border-white/30 p-6 relative">

        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Delete {itemName ? `"${itemName}"` : "Item"}
          </h2>
          <p className="text-gray-300 text-sm">
            Are you sure you want to delete this {itemName ? "item" : "task"}?
          </p>
        </div>

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
            onClick={handleConfirm}
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
