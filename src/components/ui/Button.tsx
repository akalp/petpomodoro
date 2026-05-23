import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-rose-600 text-white shadow-sm shadow-rose-200 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300",
  secondary:
    "border border-rose-200 bg-white text-rose-800 hover:bg-rose-50 active:bg-rose-100 disabled:text-rose-300",
  ghost:
    "text-slate-600 hover:bg-white/70 active:bg-white disabled:text-slate-300",
};

export function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-center text-base font-semibold leading-tight transition active:scale-[0.99] disabled:cursor-not-allowed",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500",
        variantClasses[variant],
        className,
      ].join(" ")}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
