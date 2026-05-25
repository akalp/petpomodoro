import { useEffect, useId, useRef, type ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({
  children,
  closeLabel,
  description,
  isOpen,
  onClose,
  title,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();
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

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-20 flex items-end justify-center bg-slate-950/40 p-2 sm:items-center sm:p-6"
      data-testid="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className="flex max-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-xl flex-col overflow-hidden rounded-lg border border-white/80 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[min(760px,calc(100dvh-3rem))]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-rose-100 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight text-slate-950" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-6 text-slate-600" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <button
            aria-label={closeLabel}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-rose-100 bg-rose-50/70 text-xl font-semibold leading-none text-slate-500 transition hover:bg-rose-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
