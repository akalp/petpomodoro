import { useEffect } from "react";

export function useBodyScrollLock(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isActive]);
}
