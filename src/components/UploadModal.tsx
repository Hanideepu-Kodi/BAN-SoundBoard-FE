"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import UploadSection from "@/components/UploadSection";

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function UploadModal({ open, onClose }: UploadModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-6 md:items-center md:px-6 md:py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-5xl"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div className="glass-card max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl border border-white/10 bg-bg-surface/90 p-4 shadow-panel sm:p-6">
              <div className="flex items-center justify-between gap-4 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-primary">Create</p>
                  <h2 className="text-2xl font-semibold text-white">Upload a sound</h2>
                  <p className="text-sm text-fg-muted">Drop in audio, tag it, and publish in seconds.</p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"
                >
                  Close
                </button>
              </div>
              <UploadSection
                variant="modal"
                onUploadComplete={() => {
                  onClose();
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
