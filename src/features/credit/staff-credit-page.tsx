import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function StaffCreditPage() {
  const query = useQuery({
    queryKey: ["staff-credit-applications"],
    queryFn: () => api.staffCreditApplications(),
  });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data)
    return (
      <ErrorState
        message="Credit workflow belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Operations
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          Credit workflow
        </h1>
      </div>
      {query.data.items.length === 0 ? (
        <EmptyState
          title="Belum ada pengajuan"
          detail="Tidak ada pengajuan simulasi dalam scope staff ini."
        />
      ) : (
        <div className="grid gap-3">
          {query.data.items.map((item) => (
            <Link key={item.id} to={`/staff/applications/${item.id}`}>
              <Card className="flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="font-bold">
                    {item.product_category.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.customer_id} · {item.requested_amount} {item.currency}
                  </p>
                </div>
                <Badge tone="warning">{item.current_stage}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
