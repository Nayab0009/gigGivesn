"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { colors } from "@/colors";

type BasicUser = {
  name?: string | null;
  email?: string;
  avatarUrl?: string | null;
  image?: string | null; // common field name in some auth providers
};

export type SupportFormValues = {
  type: string;
  message: string;
  files: File[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: SupportFormValues) => Promise<void> | void;
  user?: BasicUser;
};

const TYPES = ["Report a bug", "Feature request", "Ask a question"] as const;

export default function SupportModal({ isOpen, onClose, onSubmit, user }: Props) {
  const [type, setType] = useState<string>(TYPES[0]);
  const [message, setMessage] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => {
    if (user?.name && user.name.trim().length > 0) return user.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  }, [user?.name, user?.email]);

  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2),
    [displayName]
  );

  const avatarStyle = useMemo(
    () => ({
      background: `linear-gradient(to right, ${colors.primary.hex}, ${colors.secondary.hex}, ${colors.accent.hex})`,
    }),
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", onKey);
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    // reset when opened
    setType(TYPES[0]);
    setMessage("");
    setFiles([]);
    setDragging(false);
    setSubmitting(false);
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer?.files || []);
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  };

  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    e.currentTarget.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit = message.trim().length > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await onSubmit?.({ type, message: message.trim(), files });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2 bg-black/60 backdrop-blur-sm"
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[80vh] rounded-2xl border overflow-y-auto custom-scrollbar shadow-2xl p-6 [background:var(--container-bg)]"
        style={{
          borderColor: "#FFFFFF26",
          boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
        }}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 8px; border: 2px solid rgba(255,255,255,0.08); }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }
          .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        `}</style>

        <h3 className="text-text-main text-xl font-semibold mb-4">
          Contact support
        </h3>

        {/* Type select with avatar */}
        <div className="relative mb-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none rounded-xl border text-text-main px-4 py-3 pr-14 outline-none focus:ring-2 [background:var(--container-bg)]"
            style={{ borderColor: "#FFFFFF26" }}
          >
            {TYPES.map((t) => (
              <option
                key={t}
                value={t}
                className="[background:var(--container-bg)]"
              >
                {t}
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            {/* user avatar bubble */}
            <div className="pointer-events-auto relative">
              {user?.avatarUrl || user?.image ? (
                <div
                  className="h-9 w-9 rounded-full overflow-hidden ring-2"
                  style={{ borderColor: "#FFFFFF26" }}
                >
                  <Image
                    src={(user.avatarUrl || user.image) as string}
                    alt="User avatar"
                    width={36}
                    height={36}
                  />
                </div>
              ) : (
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center text-text-main text-sm font-semibold ring-2"
                  style={avatarStyle}
                  aria-hidden
                >
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <textarea
            placeholder="Message ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full resize-none rounded-xl border text-text-secondary px-4 py-3 outline-none focus:ring-2 placeholder:text-grey-400 [background:var(--container-bg)]"
            style={{ borderColor: "#FFFFFF26" }}
          />
        </div>

        {/* Attach area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className="rounded-xl border-2 border-dashed px-4 py-4 mb-3 text-text-secondary [background:var(--container-bg)]"
        >
          <label className="flex items-center justify-center gap-2 cursor-pointer select-none">
            <span className="text-lg">＋</span>
            <span>Attach File</span>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handlePick}
            />
          </label>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {files.map((f, idx) => (
                <li
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between"
                >
                  <span className="truncate max-w-[75%]">{f.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-white/70 hover:text-white/100 px-2 py-1 rounded-md hover:bg-white/10"
                    type="button"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-white transition border [background:var(--container-bg)] hover:bg-white/10"
            style={{ borderColor: "#FFFFFF26" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="px-5 py-2 rounded-lg text-white font-semibold shadow disabled:opacity-60 [background:var(--container-bg)]"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
