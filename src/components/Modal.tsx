"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-xl border border-gray-700/60 bg-[var(--card)] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-700/60 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            {title}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="max-h-[calc(90vh-4.5rem)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
