import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state"; // PERBAIKAN: Import komponen EmptyState

export function RetentionPage() {
  const query = useQuery({ queryKey: ["at-risk"], queryFn: api.atRisk });
  
  if (query.isLoading) return <LoadingState />;
  
  if (query.isError || !query.data?.items) 
    return <ErrorState message="Daftar at-risk belum dapat dimuat." onRetry={() => void query.refetch()} />; 
    
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Retention</p>
        <h1 className="mt-2 font-display text-3xl font-bold">At-risk customers</h1>
      </div>
      
      {/* PERBAIKAN: Logika untuk menangani jika array kosong */}
      {query.data.items.length === 0 ? (
        <EmptyState 
          title="Tidak ada pelanggan at-risk" 
          detail="Saat ini tidak ada pelanggan dengan tingkat risiko Medium atau High." 
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th>Risk</th>
                <th>Probability</th>
                <th>Relationship Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {query.data.items.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-5 py-4">
                    <strong>{customer.customer_ref}</strong>
                    <span className="block text-xs text-slate-500">{customer.customer_type} · {customer.state}</span>
                  </td>
                  <td>
                    <Badge tone={customer.risk_level === "HIGH" ? "danger" : customer.risk_level === "MEDIUM" ? "warning" : "success"}>
                      {customer.risk_level}
                    </Badge>
                  </td>
                  <td>{Math.round(customer.probability * 100)}%</td>
                  <td>{customer.relationship_score ?? "Unavailable"}</td>
                  <td>{customer.recommended_action ?? "NO_ACTION"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}