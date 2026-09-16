import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { Sparkles, Brain, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import type { Recommendation } from "@/types/domain";

export function CustomerDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // FIX: ganti alert() dengan inline state per-rekomendasi
  const [interventionResult, setInterventionResult] = useState<
    Record<string, { ok: boolean; message: string }>
  >({});

  const customerQuery = useQuery({
    queryKey: ["customer", id],
    queryFn: () => api.customerSummary(id!),
    enabled: !!id,
  });

  const behaviorQuery = useQuery({
    queryKey: ["customer-behavior", id],
    queryFn: () => api.behavior(id!),
    enabled: !!id,
  });

  const churnQuery = useQuery({
    queryKey: ["customer-churn", id],
    queryFn: () => api.churn(id!),
    enabled: !!id,
  });

  const scoreQuery = useQuery({
    queryKey: ["customer-score", id],
    queryFn: () => api.relationshipScore(id!),
    enabled: !!id,
  });

  // FIX: api.recommendations() return Recommendation[] bukan Paginated<Recommendation>
  const recommendationsQuery = useQuery({
    queryKey: ["customer-recommendations", id],
    queryFn: () => api.recommendations(id!),
    enabled: !!id,
  });

  // FIX: api.generateRecommendation() tidak ada — hapus, ganti refetch recommendations
  const generateRecMutation = useMutation({
    mutationFn: () => api.recommendations(id!),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["customer-recommendations", id],
      });
    },
  });

  // FIX: replace alert() dengan inline state per recommendation id
  async function simulateIntervention(rec: Recommendation, customerRef: string) {
    setInterventionResult((prev) => ({
      ...prev,
      [rec.id]: { ok: true, message: "Mengirim..." },
    }));
    try {
      const campaign = await api.createCampaign({
        name: `Intervention: ${rec.action_type}`,
        campaign_type: rec.action_type,
        description: `AI-recommended intervention for ${customerRef}`,
      });
      const targets = await api.addCampaignTargets(campaign.id, [
        { customer_id: rec.customer_id, recommendation_id: rec.id },
      ]);
      await api.deliverMessage(rec.customer_id, {
        campaign_target_id: targets[0].id,
        selection_method: "AI_RECOMMENDATION",
        title: "Penawaran Khusus Untuk Anda",
        body:
          rec.description ||
          "Berdasarkan evaluasi kami, Anda memenuhi syarat untuk program khusus ini.",
      });
      setInterventionResult((prev) => ({
        ...prev,
        [rec.id]: { ok: true, message: "Berhasil dikirim ke inbox nasabah!" },
      }));
    } catch (err) {
      setInterventionResult((prev) => ({
        ...prev,
        [rec.id]: {
          ok: false,
          message: err instanceof Error ? err.message : "Gagal mengirim intervensi.",
        },
      }));
    }
  }

  if (!id) return <ErrorState message="Customer ID is required" />;

  if (customerQuery.isLoading) return <LoadingState />;
  if (customerQuery.isError || !customerQuery.data)
    return (
      <ErrorState
        message="Gagal memuat detail pelanggan."
        onRetry={() => void customerQuery.refetch()}
      />
    );

  const customerData = customerQuery.data?.customer;
  const churn = churnQuery.data;
  const score = scoreQuery.data;
  // FIX: recommendations return Recommendation[], bukan Paginated
  const recs: Recommendation[] = recommendationsQuery.data ?? [];

  return (
    <div className="space-y-6 pt-3">
      <div>
        <Link
          to="/staff/at-risk"
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition"
        >
          <ArrowLeft size={16} /> Kembali ke daftar
        </Link>
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          AI Intelligence
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold flex items-center gap-3">
          Customer Insights <Brain className="text-orange-500" />
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="p-5 col-span-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Profile
          </h2>
          <div className="mt-4">
            <p className="text-xl font-bold">{customerData?.customer_ref}</p>
            <p className="mt-1 text-sm text-slate-500">
              {customerData?.customer_type} · {customerData?.state}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-line">
            <p className="text-sm font-medium">
              Segment: <Badge>{customerData?.segment}</Badge>
            </p>
          </div>
        </Card>

        {/* Churn Prediction */}
        <Card className="col-span-1 border-orange-200 bg-orange-50/20 p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            <Sparkles size={16} /> AI Prediction
          </h2>
          <div className="mt-4 flex items-end justify-between">
            {churnQuery.isLoading ? (
              <p className="text-sm text-slate-500">Memuat data AI...</p>
            ) : churnQuery.isError ? (
              <p className="text-sm text-red-500">Gagal memuat AI Prediction</p>
            ) : (
              <>
                <div>
                  <p className="font-display text-3xl font-bold">
                    {churn ? Math.round(churn.probability * 100) : 0}%
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Churn Probability</p>
                </div>
                {churn?.risk_level && (
                  <Badge
                    tone={
                      churn.risk_level === "HIGH"
                        ? "danger"
                        : churn.risk_level === "MEDIUM"
                          ? "warning"
                          : "success"
                    }
                  >
                    {churn.risk_level} RISK
                  </Badge>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Relationship Score */}
        <Card className="col-span-1 p-5">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Brain size={16} /> Relationship Score
          </h2>
          <div className="mt-4 flex items-end justify-between">
            {scoreQuery.isLoading ? (
              <p className="text-sm text-slate-500">Memuat score...</p>
            ) : scoreQuery.isError ? (
              <p className="text-sm text-red-500">Gagal memuat score</p>
            ) : (
              <>
                <div>
                  <p className="font-display text-3xl font-bold">
                    {score ? Math.round(score.score) : "N/A"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Score</p>
                </div>
                {score?.interpretation && (
                  <Badge
                    tone={
                      score.interpretation === "STRONG"
                        ? "success"
                        : score.interpretation === "MODERATE"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {score.interpretation}
                  </Badge>
                )}
              </>
            )}
          </div>
        </Card>

        {/* Behavior */}
        <Card className="col-span-1 border-orange-200 p-5 sm:col-span-2 lg:col-span-3">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
            Behavior Metrics
          </h2>
          {behaviorQuery.isLoading ? (
            <p className="text-sm text-slate-500">Memuat data behavior...</p>
          ) : behaviorQuery.isError ? (
            <p className="text-sm text-red-500">Gagal memuat data behavior</p>
          ) : behaviorQuery.data ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xl font-bold">
                  {behaviorQuery.data.metrics.txn_count_30d}
                </p>
                <p className="text-xs uppercase text-slate-500">Txn 30d</p>
              </div>
              <div>
                <p className="text-xl font-bold">
                  {behaviorQuery.data.metrics.txn_amount_30d}
                </p>
                <p className="text-xs uppercase text-slate-500">Vol 30d</p>
              </div>
              <div>
                <p className="text-xl font-bold">
                  {behaviorQuery.data.metrics.app_sessions_30d}
                </p>
                <p className="text-xs uppercase text-slate-500">App Sessions 30d</p>
              </div>
              <div>
                <p className="text-xl font-bold">
                  {behaviorQuery.data.metrics.days_since_last_transaction ?? "N/A"}
                </p>
                <p className="text-xs uppercase text-slate-500">Days Since Txn</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Data behavior tidak tersedia.</p>
          )}
        </Card>

        {/* SHAP Explanation */}
        {churnQuery.data?.top_drivers && churnQuery.data.top_drivers.length > 0 && (
          <Card className="col-span-1 p-5 sm:col-span-2 lg:col-span-3">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Sparkles size={16} className="text-orange-500" />
              SHAP Risk Factor Attribution (Log-Odds Impact)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {churnQuery.data.top_drivers.map((driver, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg border border-line bg-slate-50/50"
                >
                  <span className="text-sm font-medium text-slate-600">
                    {driver.message || driver.feature}
                  </span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      driver.impact > 0 ? "text-red-500" : "text-emerald-500"
                    }`}
                  >
                    {driver.impact > 0 ? "+" : ""}
                    {driver.impact.toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line bg-slate-50/50 p-5">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-orange-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              AI Recommendations
            </h2>
          </div>
          {/* FIX: mutationFn sekarang refetch recommendations, bukan endpoint yang tidak ada */}
          <Button
            disabled={generateRecMutation.isPending}
            onClick={() => generateRecMutation.mutate()}
            className="flex items-center gap-2"
          >
            <Sparkles size={16} />
            {generateRecMutation.isPending ? "Generating..." : "Generate Insights"}
          </Button>
        </div>

        {recommendationsQuery.isLoading ? (
          <div className="p-5">
            <p className="text-sm text-slate-500">Memuat rekomendasi...</p>
          </div>
        ) : recommendationsQuery.isError ? (
          <div className="p-5">
            <p className="text-sm text-red-500">Gagal memuat rekomendasi</p>
          </div>
        ) : recs.length === 0 ? (
          <EmptyState
            title="Tidak ada rekomendasi"
            detail="Klik generate insights untuk mendapatkan rekomendasi dari AI."
          />
        ) : (
          <div className="divide-y divide-line">
            {recs.map((rec) => (
              <div key={rec.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{rec.action_type}</h3>
                    <p className="mt-2 text-sm text-slate-600">
                      {rec.reason || rec.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={rec.status === "ACTIVE" ? "success" : "neutral"}>
                      {rec.status}
                    </Badge>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void simulateIntervention(rec, customerData?.customer_ref ?? "")
                      }
                      disabled={interventionResult[rec.id]?.message === "Mengirim..."}
                    >
                      Simulate Intervention
                    </Button>
                  </div>
                </div>

                {/* FIX: inline result per recommendation, menggantikan alert() */}
                {interventionResult[rec.id] && (
                  <div
                    className={`mt-3 flex items-center gap-2 rounded-xl p-3 text-sm ${
                      interventionResult[rec.id].ok
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {interventionResult[rec.id].ok ? (
                      <CheckCircle2 size={15} className="shrink-0" />
                    ) : (
                      <XCircle size={15} className="shrink-0" />
                    )}
                    {interventionResult[rec.id].message}
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line/50 pt-3 text-xs text-slate-500">
                  <p>
                    <strong>Priority Score:</strong> {rec.priority_score}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(rec.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}