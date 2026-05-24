import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { routePaths } from "../routes/routePaths";

interface AppRoutesProps {
  home: ReactNode;
  journal: ReactNode;
  pet: ReactNode;
  shop: ReactNode;
}

export function AppRoutes({ home, journal, pet, shop }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<Navigate replace to={routePaths.home} />} path="/" />
      <Route element={home} path={routePaths.home} />
      <Route element={pet} path={routePaths.pet} />
      <Route element={shop} path={routePaths.shop} />
      <Route element={journal} path={routePaths.journal} />
      <Route element={<Navigate replace to={routePaths.home} />} path="*" />
    </Routes>
  );
}
