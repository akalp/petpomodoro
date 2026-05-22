import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "section" | "div";
  children: ReactNode;
}

export function Card({
  as: Component = "section",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <Component
      className={[
        "rounded-lg border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Component>
  );
}
