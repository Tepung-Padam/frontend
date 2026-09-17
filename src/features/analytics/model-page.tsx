import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { codeLabel } from "@/lib/format";

export function ModelPage() {
  const query = useQuery({
    queryKey: ["active-model"],
    queryFn: api.activeModel,
  });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Metadata model belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  const model = query.data;
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Model prediksi
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">Model dan sumber data</h1>
      </div>
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">{model.name}</h2>
          <Badge tone={model.is_available ? "success" : "warning"}>
            {model.is_available ? "Siap digunakan" : "Belum tersedia"}
          </Badge>
        </div>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ["Versi model", model.version],
            ["Jenis model", codeLabel(model.type)],
            ["Versi variabel", model.feature_schema_version],
            ["Versi data pelatihan", model.training_dataset_version],
            ["Batas risiko menengah", String(model.thresholds.medium)],
            ["Batas risiko tinggi", String(model.thresholds.high)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {label}
              </dt>
              <dd className="mt-1 font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 rounded-xl bg-paper p-4 text-sm leading-6 text-slate-600">
          {model.disclosure}
        </p>
      </Card>
    </div>
  );
}
