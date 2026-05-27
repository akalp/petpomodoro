import type { Translator } from "../i18n";
import { Card } from "../components/ui/Card";

export function LoadingCard({ t }: { t: Translator }) {
  return (
    <Card className="space-y-3 text-sm leading-6 text-slate-600">
      <div className="h-3 w-24 animate-pulse rounded-full bg-rose-100" />
      <div className="h-3 w-full animate-pulse rounded-full bg-rose-100" />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-rose-100" />
      <p>{t("loading")}</p>
    </Card>
  );
}
