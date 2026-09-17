import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BrainCircuit, BriefcaseBusiness, UsersRound } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { codeLabel, formatPercent, modelFeatureLabel } from "@/lib/format";
import { FeatureDriverChart } from "@/components/charts/feature-driver-chart";

export function AdminPage() {
  const summary = useQuery({ queryKey: ["retention-summary"], queryFn: api.retentionSummary });
  const model = useQuery({ queryKey: ["active-model"], queryFn: api.activeModel });
  const campaigns = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns });
  const drivers = useQuery({ queryKey: ["top-drivers"], queryFn: api.topDrivers });
  if (summary.isLoading || model.isLoading || campaigns.isLoading || drivers.isLoading) return <LoadingState />;
  if (summary.isError || model.isError || campaigns.isError || drivers.isError || !summary.data || !model.data || !campaigns.data || !drivers.data) return <ErrorState message="Ringkasan operasional belum dapat dimuat." onRetry={() => { void summary.refetch(); void model.refetch(); void campaigns.refetch(); void drivers.refetch(); }} />;
  const atRiskRate = summary.data.customers.total > 0 ? summary.data.customers.at_risk / summary.data.customers.total : null;
  const riskCurve = (["HIGH", "MEDIUM", "LOW", "UNAVAILABLE"] as const).map((level) => ({ name: codeLabel(level), value: summary.data.risk[level] }));
  const driverData = drivers.data.items.slice(0, 6).map((driver) => ({ ...driver, label: modelFeatureLabel(driver.feature) }));
  return <div className="space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Operations control</p><h1 className="mt-2 font-display text-3xl font-bold">Portfolio command center</h1><p className="mt-2 max-w-2xl text-slate-500">Kondisi portfolio, intervensi, dan kesiapan model berdasarkan data backend saat ini.</p></div><Badge tone={model.data.is_available ? "success" : "warning"}>{model.data.is_available ? "MODEL ACTIVE" : "MODEL UNAVAILABLE"}</Badge></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={<UsersRound />} label="Total customers" value={String(summary.data.customers.total)} /><Metric icon={<AlertTriangle />} label="At-risk share" value={formatPercent(atRiskRate)} /><Metric icon={<BriefcaseBusiness />} label="Campaigns" value={String(campaigns.data.pagination.total_items)} /><Metric icon={<BrainCircuit />} label="Predictions unavailable" value={String(summary.data.risk.UNAVAILABLE)} /></div>
    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]"><Card className="p-6"><h2 className="font-display text-lg font-bold">Kurva distribusi risiko</h2><p className="mt-1 text-xs text-slate-500">Komposisi prediction portfolio berdasarkan level risiko.</p><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={riskCurve} margin={{ top: 8, right: 10, left: -18, bottom: 4 }}><defs><linearGradient id="adminRiskArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#e87532" stopOpacity={0.34} /><stop offset="95%" stopColor="#e87532" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e2dc" /><XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} /><Tooltip formatter={(value) => [Number(value), "Nasabah"]} /><Area type="monotone" dataKey="value" stroke="#e87532" strokeWidth={3} fill="url(#adminRiskArea)" activeDot={{ r: 5 }} /></AreaChart></ResponsiveContainer></div></Card><Card className="p-6"><h2 className="font-display text-lg font-bold">Decision readiness</h2><dl className="mt-5 space-y-4 text-sm"><Row label="Active simulations" value={String(summary.data.campaigns.active_simulations)} /><Row label="Relationship score avg." value={summary.data.relationship_score.average?.toFixed(1) ?? "Belum tersedia"} /><Row label="Merchant evaluated" value={String(summary.data.merchant.evaluated)} /><Row label="Model version" value={model.data.version ?? "Belum tersedia"} /></dl><p className="mt-6 border-t border-line pt-4 text-xs leading-5 text-slate-500">{model.data.disclosure}</p></Card></div>
    <Card className="p-6"><div><h2 className="font-display text-lg font-bold">Faktor risiko utama</h2><p className="mt-1 text-xs text-slate-500">Jumlah nasabah pada tiap faktor risiko dari {drivers.data.prediction_count} prediksi terbaru.</p></div>{drivers.data.items.length ? <div className="mt-5"><FeatureDriverChart data={driverData} /></div> : <div className="grid h-40 place-items-center text-sm text-slate-500">Faktor model belum tersedia.</div>}</Card>
  </div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <Card className="p-5"><div className="text-teal-600">{icon}</div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{value}</p></Card>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="text-right font-bold">{value}</dd></div>; }
