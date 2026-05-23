import { motion } from "framer-motion";

import type { PetState } from "../../domain";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

import { PetAvatar } from "./PetAvatar";
import { PetStats } from "./PetStats";

interface PetDashboardProps {
  pet: PetState | null;
}

export function PetDashboard({ pet }: PetDashboardProps) {
  if (!pet) {
    return (
      <Card className="text-center">
        <div className="mx-auto h-32 w-32 animate-pulse rounded-full bg-rose-100" />
        <p className="mt-5 text-lg font-semibold text-slate-900">
          Meet your focus friend.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Start with one small session.
        </p>
      </Card>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="space-y-5 text-center">
      <div className="flex items-center justify-between gap-3 text-left">
        <div>
          <p className="text-sm font-medium text-rose-700">PetPomodoro</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">{pet.name}</h1>
        </div>
        <Badge>Level {pet.level}</Badge>
      </div>
      <PetAvatar mood={pet.mood} />
      <PetStats pet={pet} />
      </Card>
    </motion.div>
  );
}
