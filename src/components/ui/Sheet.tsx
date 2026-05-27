import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface SheetProps {
  children: ReactNode;
  closeLabel: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

type SheetPhase = "closed" | "open" | "closing";

export function Sheet({
  children,
  closeLabel,
  description,
  isOpen,
  onClose,
  title,
}: SheetProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<SheetPhase>(() =>
    isOpen ? "open" : "closed",
  );
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const ownsFocusRef = useRef(false);
  const requestedCloseRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const restoreFocus = useCallback(() => {
    if (!ownsFocusRef.current) {
      return;
    }

    ownsFocusRef.current = false;
    const previouslyFocused = previouslyFocusedRef.current;
    previouslyFocusedRef.current = null;

    if (previouslyFocused?.isConnected) {
      previouslyFocused.focus();
    }
  }, []);

  const finishClose = useCallback(() => {
    requestedCloseRef.current = false;
    setPhase("closed");
    restoreFocus();
  }, [restoreFocus]);

  if (previousIsOpen !== isOpen) {
    setPreviousIsOpen(isOpen);

    if (isOpen) {
      setPhase("open");
    } else if (phase === "open") {
      setPhase(prefersReducedMotion ? "closed" : "closing");
    }
  } else if (phase === "closing" && prefersReducedMotion) {
    setPhase("closed");
  }

  useEffect(() => {
    if (!isOpen || phase !== "open") {
      return;
    }

    requestedCloseRef.current = false;
    if (!ownsFocusRef.current) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      ownsFocusRef.current = true;
    }

    dialogRef.current?.focus();
  }, [isOpen, phase]);

  useEffect(() => {
    if (!isOpen && phase === "closed") {
      restoreFocus();
    }
  }, [isOpen, phase, restoreFocus]);

  useEffect(() => {
    if (phase !== "closing" || isOpen || prefersReducedMotion) {
      return undefined;
    }

    const closeFallbackId = window.setTimeout(finishClose, 260);
    return () => window.clearTimeout(closeFallbackId);
  }, [finishClose, isOpen, phase, prefersReducedMotion]);

  useEffect(() => {
    return () => restoreFocus();
  }, [restoreFocus]);

  const requestClose = useCallback(() => {
    if (phase !== "open" || requestedCloseRef.current) {
      return;
    }

    requestedCloseRef.current = true;
    if (prefersReducedMotion) {
      finishClose();
    } else {
      setPhase("closing");
    }
    onCloseRef.current();
  }, [finishClose, phase, prefersReducedMotion]);

  const handlePanelAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      phase === "closing" &&
      !isOpen
    ) {
      finishClose();
    }
  };

  useEffect(() => {
    if (!isOpen || phase !== "open") {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        requestClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, phase, requestClose]);

  if (phase === "closed") {
    return null;
  }

  return (
    <div
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      aria-modal="true"
      className="ui-sheet-backdrop fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 px-2 pt-4 pb-0 focus:outline-none sm:px-6 sm:pt-8"
      data-state={phase}
      data-testid="sheet-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          requestClose();
        }
      }}
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <div
        className="ui-sheet-panel flex max-h-[min(760px,calc(100dvh-5rem))] w-full min-w-0 max-w-xl flex-col overflow-hidden rounded-t-lg border border-white/80 bg-white shadow-2xl shadow-slate-950/20 sm:max-h-[min(820px,calc(100dvh-2rem))]"
        data-state={phase}
        onAnimationEnd={handlePanelAnimationEnd}
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
            onClick={requestClose}
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
      </div>
    </div>
  );
}
