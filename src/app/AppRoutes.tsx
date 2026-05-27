import { useEffect, useRef, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { legacyRoutePaths, routePaths } from "../routes/routePaths";

interface AppRoutesProps {
  focus: ReactNode;
  journal: ReactNode;
  pet: ReactNode;
  shop: ReactNode;
}

export function AppRoutes({ focus, journal, pet, shop }: AppRoutesProps) {
  const location = useLocation();
  const routeContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const routeContent = routeContentRef.current;

    if (!routeContent) {
      return;
    }

    routeContent.classList.remove("ui-route-enter");
    void routeContent.offsetWidth;
    routeContent.classList.add("ui-route-enter");
  }, [location.pathname]);

  return (
    <div className="ui-route-enter" ref={routeContentRef}>
      <Routes location={location}>
        <Route element={<Navigate replace to={routePaths.pet} />} path="/" />
        <Route
          element={<Navigate replace to={routePaths.focus} />}
          path={legacyRoutePaths.home}
        />
        <Route element={pet} path={routePaths.pet} />
        <Route element={focus} path={routePaths.focus} />
        <Route element={shop} path={routePaths.shop} />
        <Route element={journal} path={routePaths.journal} />
        <Route element={<Navigate replace to={routePaths.pet} />} path="*" />
      </Routes>
    </div>
  );
}
