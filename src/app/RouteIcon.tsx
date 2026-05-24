import type { ReactElement, SVGProps } from "react";

import type { RouteIconName } from "./routeRegistry";

interface RouteIconProps extends SVGProps<SVGSVGElement> {
  name: RouteIconName;
}

export function RouteIcon({ name, ...props }: RouteIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {routeIconPaths[name]}
    </svg>
  );
}

const routeIconPaths: Record<RouteIconName, ReactElement> = {
  pet: (
    <>
      <circle cx="7.5" cy="9" r="1.6" />
      <circle cx="12" cy="6.8" r="1.6" />
      <circle cx="16.5" cy="9" r="1.6" />
      <path d="M7.5 16.6c0-2.4 2-4.1 4.5-4.1s4.5 1.7 4.5 4.1c0 1.5-1 2.4-2.4 2.4-.8 0-1.2-.3-2.1-.3s-1.3.3-2.1.3c-1.4 0-2.4-.9-2.4-2.4Z" />
    </>
  ),
  focus: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 7.5V12l3 2" />
      <path d="M7 4.8 5.4 3.2" />
      <path d="M17 4.8l1.6-1.6" />
    </>
  ),
  shop: (
    <>
      <path d="M6.5 9h11l-.8 11H7.3L6.5 9Z" />
      <path d="M9 9a3 3 0 0 1 6 0" />
      <path d="M9 13h6" />
    </>
  ),
  journal: (
    <>
      <path d="M6.5 4.5h8.2L18 7.8v11.7H6.5v-15Z" />
      <path d="M14.5 4.8v3.4h3.2" />
      <path d="M9 12h6" />
      <path d="M9 15.5h4" />
    </>
  ),
};
