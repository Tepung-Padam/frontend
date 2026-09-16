import { Activity, AlertTriangle, Database, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";

export function WorkspaceHomePage() {
  const summary = useQuery({
    queryKey: ["retention-summary"],
    queryFn: api.retentionSummary,
  });
  const model = useQuery({
    queryKey: ["active-model"],
    queryFn: api.activeModel,
  });
  if (summary.isLoading || model.isLoading) return <LoadingState />;
  if (summary.isError || model.isError || !summary.data || !model.data)
    return (
      <ErrorState
        message="Portfolio analytics belum dapat dimuat."
        onRetry={() => {
          void summary.refetch();
          void model.refetch();
        }}
      />
    );
  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            Overview
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Decision workspace
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Portfolio overview dari backend. Model status tetap ditampilkan
            jujur sesuai availability.
          </p>
        </div>
        <Badge tone="warning">Prototype · synthetic data</Badge>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<UsersRound />}
          label="Portfolio"
          value={String(summary.data.customers.total)}
        />
        <Stat
          icon={<AlertTriangle />}
          label="At-risk"
          value={String(summary.data.customers.at_risk)}
        />
        <Stat
          icon={<Activity />}
          label="Interventions"
          value={String(summary.data.campaigns.active_simulations)}
        />
        <Stat
          icon={<Database />}
          label="Model status"
          value={model.data.is_available ? model.data.version : "Unavailable"}
        />
      </div>
      <Card className="p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-600">
          Portfolio disclosure
        </p>
        <p className="mt-2 leading-7 text-slate-600">
          Data source:{" "}
          {Object.entries(summary.data.data_disclosure)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(", ") || "backend"}
          . Model: {model.data.disclosure}
        </p>
      </Card>
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between text-slate-400">
        <span className="rounded-xl bg-paper p-2">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider">
          Foundation
        </span>
      </div>
      <p className="mt-7 text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </Card>
  );
}
