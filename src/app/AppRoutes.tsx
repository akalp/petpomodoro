import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      key={location.pathname}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.18, ease: "easeOut" }
      }
    >
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
    </motion.div>
  );
}
