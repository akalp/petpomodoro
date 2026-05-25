import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";

interface SheetProps {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Sheet({
  children,
  closeLabel,
  description,
  isOpen,
  onClose,
  title,
}: SheetProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    dialogRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-describedby={description ? descriptionId : undefined}
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 px-2 pt-4 pb-0 focus:outline-none sm:px-6 sm:pt-8"
          data-testid="sheet-backdrop"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
          ref={dialogRef}
          role="dialog"
          tabIndex={-1}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <motion.div
            animate={{ y: 0 }}
            className="flex max-h-[min(760px,calc(100dvh-5rem))] w-full min-w-0 max-w-xl flex-col overflow-hidden rounded-t-lg border border-white/80 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[min(820px,calc(100dvh-2rem))]"
            exit={{ y: "100%" }}
            initial={{ y: "100%" }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-rose-100 px-4 py-4 sm:px-5">
              <div className="min-w-0 flex-1">
                <div className="mb-3 h-1 w-10 rounded-full bg-rose-200" />
                <h2
                  className="text-xl font-semibold leading-tight text-slate-950"
                  id={titleId}
                >
                  {title}
                </h2>
                {description ? (
                  <p
                    className="mt-1 text-sm leading-6 text-slate-600"
                    id={descriptionId}
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                aria-label={closeLabel}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-white text-slate-600 transition hover:bg-rose-50 hover:text-rose-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
                onClick={onClose}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
