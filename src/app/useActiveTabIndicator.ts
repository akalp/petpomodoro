import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type IndicatorAxis = "horizontal" | "vertical";

type IndicatorStyle = CSSProperties & {
  "--tab-indicator-offset"?: string;
  "--tab-indicator-size"?: string;
};

export function useActiveTabIndicator(
  activePath: string,
  axis: IndicatorAxis,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle | null>(
    null,
  );

  const measure = useCallback(() => {
    const container = containerRef.current;
    const activeLink = activeLinkRef.current;

    if (!container || !activeLink) {
      return;
    }

    const containerBounds = container.getBoundingClientRect();
    const linkBounds = activeLink.getBoundingClientRect();
    const offset =
      axis === "horizontal"
        ? linkBounds.left - containerBounds.left
        : linkBounds.top - containerBounds.top;
    const size =
      axis === "horizontal" ? linkBounds.width : linkBounds.height;

    setIndicatorStyle({
      "--tab-indicator-offset": `${offset}px`,
      "--tab-indicator-size": `${size}px`,
    });
  }, [axis]);

  useLayoutEffect(() => {
    measure();

    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => measure());

    resizeObserver?.observe(container);
    container.querySelectorAll("a").forEach((link) => {
      resizeObserver?.observe(link);
    });

    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [activePath, measure]);

  return {
    activeLinkRef,
    containerRef,
    indicatorStyle,
  };
}
