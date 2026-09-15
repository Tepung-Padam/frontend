import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";

export function CampaignsPage() { const query = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns }); if (query.isLoading) return <LoadingState />; if (query.isError || !query.data) return <ErrorState message="Campaign belum dapat dimuat." onRetry={() => void query.refetch()} />; return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Interventions</p><h1 className="mt-2 font-display text-3xl font-bold">Simulated campaigns</h1></div>{query.data.length === 0 ? <EmptyState title="Belum ada campaign" detail="Campaign simulasi akan muncul dari backend setelah intervention dibuat." /> : <div className="grid gap-4">{query.data.map((campaign) => <Card key={campaign.id} className="p-5"><div className="flex justify-between gap-4"><div><h2 className="font-bold">{campaign.name}</h2><p className="mt-1 text-sm text-slate-600">{campaign.description}</p></div><Badge tone="warning">{campaign.status}</Badge></div><p className="mt-4 text-xs text-slate-500">{campaign.is_simulation ? "Simulation only" : "Non-simulation"}</p></Card>)}</div>}</div>; }