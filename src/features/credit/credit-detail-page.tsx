import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, Info, ShieldCheck, WalletCards } from "lucide-react";
import { api } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { useSession } from "@/features/auth/use-session";
import { useState } from "react";
import { ProgressStepper } from "@/components/data-display/progress-stepper";

// FIX: pisahkan union type agar tidak bisa pass "" ke CreditEventPayload.event_type
type EventTypeOption = "STAGE_CHANGED" | "DOCUMENT_UPDATED";

function InfoMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-xl bg-[#f5f8fc] p-3"><div className="flex items-center gap-1.5 text-[#1d5f9f]"><span>{icon}</span><span className="text-[11px] font-semibold text-slate-500">{label}</span></div><p className="mt-2 truncate text-sm font-bold text-[#173b68]">{value}</p></div>;
}

export function CreditDetailPage() {
  const { id = "" } = useParams();
  const pathname = useLocation().pathname;
  const isStaff = pathname.startsWith("/staff/") || pathname.startsWith("/rm/") || pathname.startsWith("/admin/");
  const { user } = useSession();
  const queryClient = useQueryClient();

  // eventType memakai null saat belum dipilih.
  const [eventType, setEventType] = useState<EventTypeOption | null>(null);
  const [toStage, setToStage] = useState("");
  const [docId, setDocId] = useState("");
  const [docStatus, setDocStatus] = useState("");
  const [note, setNote] = useState("");

  const application = useQuery({
    queryKey: ["credit-application", isStaff, id],
    queryFn: () =>
      isStaff ? api.staffCreditApplication(id) : api.creditApplication(id),
    enabled: Boolean(id),
  });
  const events = useQuery({
    queryKey: ["credit-events", isStaff, id],
    queryFn: () =>
      isStaff
        ? api.staffCreditApplicationEvents(id)
        : api.creditApplicationEvents(id),
    enabled: Boolean(id),
  });

  const eventMutation = useMutation({
    mutationFn: () => {
      // FIX: eventType sudah type-safe, tidak perlu cast
      if (!eventType) throw new Error("Event type harus dipilih.");
      return api.staffAddCreditEvent(id, {
        expected_version: application.data!.version,
        event_type: eventType,
        to_stage: eventType === "STAGE_CHANGED" ? toStage : undefined,
        document_requirement_id: eventType === "DOCUMENT_UPDATED" ? docId : undefined,
        document_status: eventType === "DOCUMENT_UPDATED" ? docStatus : undefined,
        customer_note: note || undefined,
        idempotency_key: crypto.randomUUID(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-application", isStaff, id] });
      queryClient.invalidateQueries({ queryKey: ["credit-events", isStaff, id] });
      setEventType(null);
      setNote("");
    },
  });

  if (application.isLoading) return <LoadingState />;
  if (application.isError || !application.data)
    return (
      <ErrorState
        message="Pengajuan tidak ditemukan atau tidak dapat diakses."
        onRetry={() => void application.refetch()}
      />
    );

  const stages = ["Pengajuan", "Dokumen", "Analisis", "Keputusan"];
  const stageMap: Record<string, number> = { SUBMITTED: 0, DOCUMENTS_RECEIVED: 1, FINANCIAL_ANALYSIS: 2, FIELD_SURVEY: 2, COMMITTEE_REVIEW: 2, APPROVED_SIMULATION: 3, REJECTED_SIMULATION: 3 };
  const activeStage = stageMap[application.data.current_stage] ?? 0;

  return (
    <div className="max-w-5xl space-y-6 pt-3">
      <header className="rounded-2xl border border-[#dfe7f2] bg-white p-5 shadow-[0_4px_18px_rgba(19,48,91,0.06)] sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#e85d04]">Rekomendasi untuk bisnis kamu</p>
            <h1 className="mt-2 font-display text-2xl font-bold text-[#173b68] sm:text-3xl">
              {codeLabel(application.data.product_category)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Fasilitas pembiayaan yang disusun dari profil perusahaan, kebutuhan modal, dan riwayat hubungan bisnis.</p>
          </div>
          <div className="rounded-2xl bg-[#fff3e8] px-5 py-4 text-center"><p className="text-xs font-bold text-slate-500">Kelayakan indikatif</p><p className="mt-1 text-2xl font-bold text-[#e85d04]">84.6%</p><p className="text-[11px] text-slate-500">Profil sesuai</p></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-[#eef6ff] px-3 py-1.5 text-[#1d5f9f]">Profil perusahaan tervalidasi</span><span className="rounded-full bg-[#eefaf5] px-3 py-1.5 text-[#16805c]">Rekomendasi aktif</span></div>
      </header>

      <div className="rounded-xl bg-[#e85d04] px-4 py-3 text-xs font-bold text-white shadow-sm">Penawaran khusus untuk hubungan bisnis perusahaan. Ajukan simulasi tanpa mengubah status keputusan lending.</div>

      <section className="rounded-2xl border border-[#dfe7f2] bg-white p-5 shadow-[0_4px_18px_rgba(19,48,91,0.06)] sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e85d04]">Fasilitas pembiayaan</p><h2 className="mt-1 text-xl font-bold text-[#173b68]">{codeLabel(application.data.product_category)}</h2></div><Badge tone="warning">{codeLabel(application.data.current_stage)}</Badge></div>
        <p className="mt-2 text-sm text-slate-500">{formatCurrency(application.data.requested_amount, application.data.currency)} · dibuat {formatDate(application.data.created_at)}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <InfoMetric icon={<WalletCards size={16} />} label="Plafon simulasi" value={formatCurrency(application.data.requested_amount, application.data.currency)} />
          <InfoMetric icon={<ShieldCheck size={16} />} label="Status profil" value="Terverifikasi" />
          <InfoMetric icon={<CalendarDays size={16} />} label="Tahap saat ini" value={codeLabel(application.data.current_stage)} />
          <InfoMetric icon={<FileText size={16} />} label="Dokumen" value={`${application.data.documents.length} persyaratan`} />
        </div>
        <div className="mt-7"><ProgressStepper steps={stages} activeIndex={activeStage} /></div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="border-[#dfe7f2] p-6 shadow-[0_4px_18px_rgba(19,48,91,0.05)]">
        <div className="flex items-center gap-2"><FileText size={18} className="text-[#e85d04]" /><h2 className="font-bold text-[#173b68]">Dokumen yang diperlukan</h2></div>
        <div className="mt-4 divide-y divide-line">{application.data.documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span>{codeLabel(document.document_code)}</span><span className="flex items-center gap-1 text-xs font-bold text-slate-500">{document.status === "REVIEWED" ? <CheckCircle2 size={14} className="text-emerald-600" /> : null}{codeLabel(document.status)}</span></div>)}</div>
      </Card>
      <Card className="border-[#dfe7f2] bg-[#f5f9ff] p-6 shadow-[0_4px_18px_rgba(19,48,91,0.05)]"><div className="flex items-center gap-2"><Info size={18} className="text-[#1d5f9f]" /><h2 className="font-bold text-[#173b68]">Kenapa rekomendasi ini?</h2></div><p className="mt-3 text-sm leading-6 text-slate-600">Profil usaha dan kebutuhan modal cocok dengan parameter fasilitas ini. Lengkapi dokumen agar tim dapat melakukan review sesuai alur.</p><button className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#e85d04]">Lihat panduan <ArrowRight size={15} /></button></Card>
      </div>

      <Card className="border-[#dfe7f2] p-6 shadow-[0_4px_18px_rgba(19,48,91,0.05)]">
        <h2 className="font-bold text-[#173b68]">Timeline pengajuan</h2>
        {events.isError ? <p className="mt-3 text-sm text-slate-500">Timeline belum tersedia.</p> : events.data?.items.length === 0 ? <p className="mt-3 text-sm text-slate-500">Belum ada event.</p> : <div className="mt-3 divide-y divide-line">{events.data?.items.map((event) => <div key={String(event.id)} className="py-3 text-sm"><p className="font-bold">{codeLabel(String(event.event_type))}</p><p className="mt-1 text-slate-500">{String(event.customer_note ?? "Progress diperbarui")}</p></div>)}</div>}
      </Card>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#dfe7f2] bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-slate-600"><ShieldCheck size={16} className="text-[#16805c]" />Data pengajuan tersimpan dalam sesi aman.</div><span className="inline-flex items-center gap-2 rounded-xl bg-[#e85d04] px-4 py-2 text-xs font-bold text-white">Lanjutkan pengajuan <ArrowRight size={14} /></span></div>

      {/* Staff update form remains available below for operational roles. */}
      <div className="hidden">
        <p>
          {formatCurrency(
            application.data.requested_amount,
            application.data.currency,
          )}{" "}
          · dibuat {formatDate(application.data.created_at)}
        </p>
      </div>

      <div className="hidden"><Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Current stage</h2>
          <Badge tone="warning">
            {codeLabel(application.data.current_stage)}
          </Badge>
        </div>
        <div className="mt-6"><ProgressStepper steps={stages} activeIndex={activeStage} /></div>
        <h2 className="mt-7 font-bold">Document checklist</h2>
        <div className="mt-3 divide-y divide-line">
          {application.data.documents.map((document) => (
            <div
              key={document.id}
              className="flex justify-between py-3 text-sm"
            >
              <span>{codeLabel(document.document_code)}</span>
              <span className="font-bold text-slate-500">
                {codeLabel(document.status)}
              </span>
            </div>
          ))}
        </div>
      </Card></div>

      <div className="hidden"><Card className="p-6">
        <h2 className="font-bold">Timeline</h2>
        {events.isError ? (
          <p className="mt-3 text-sm text-slate-500">
            Timeline belum tersedia.
          </p>
        ) : events.data?.items.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Belum ada event.</p>
        ) : (
          <div className="mt-3 divide-y divide-line">
            {events.data?.items.map((event) => (
              <div key={String(event.id)} className="py-3 text-sm">
                <p className="font-bold">
                  {codeLabel(String(event.event_type))}
                </p>
                <p className="mt-1 text-slate-500">
                  {String(event.customer_note ?? "Progress diperbarui")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card></div>

      {isStaff && user && (user.role === "ADMIN" || user.role === "RM") && (
        <Card className="p-6 bg-orange-50/50 border-orange-200">
          <h2 className="font-bold mb-4">Add Event Update</h2>
          <div className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium mb-1">Event Type</label>
              <select
                className="w-full rounded-md border border-line bg-white p-2 text-sm"
                // FIX: value "" untuk "tidak ada pilihan", konversi ke null saat onChange
                value={eventType ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setEventType(v === "" ? null : (v as EventTypeOption));
                }}
                disabled={eventMutation.isPending}
              >
                <option value="">Pilih</option>
                <option value="STAGE_CHANGED">Update Stage</option>
                <option value="DOCUMENT_UPDATED">Update Document</option>
              </select>
            </div>

            {eventType === "STAGE_CHANGED" && (
              <div>
                <label className="block text-sm font-medium mb-1">To Stage</label>
                <select
                  className="w-full rounded-md border border-line bg-white p-2 text-sm"
                  value={toStage}
                  onChange={(e) => setToStage(e.target.value)}
                  disabled={eventMutation.isPending}
                >
                  <option value="">Pilih</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="DOCUMENTS_RECEIVED">Documents Received</option>
                  <option value="FINANCIAL_ANALYSIS">Financial Analysis</option>
                  <option value="FIELD_SURVEY">Field Survey</option>
                  <option value="COMMITTEE_REVIEW">Committee Review</option>
                  <option value="APPROVED_SIMULATION">Approved Simulation</option>
                  <option value="REJECTED_SIMULATION">Rejected Simulation</option>
                </select>
              </div>
            )}

            {eventType === "DOCUMENT_UPDATED" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Document</label>
                  <select
                    className="w-full rounded-md border border-line bg-white p-2 text-sm"
                    value={docId}
                    onChange={(e) => setDocId(e.target.value)}
                    disabled={eventMutation.isPending}
                  >
                    <option value="">Pilih</option>
                    {application.data.documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {codeLabel(d.document_code)} ({codeLabel(d.status)})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    className="w-full rounded-md border border-line bg-white p-2 text-sm"
                    value={docStatus}
                    onChange={(e) => setDocStatus(e.target.value)}
                    disabled={eventMutation.isPending}
                  >
                    <option value="">Pilih</option>
                    <option value="RECEIVED">Received</option>
                    <option value="REVIEWED">Reviewed</option>
                  </select>
                </div>
              </>
            )}

            {(eventType === "STAGE_CHANGED" || eventType === "DOCUMENT_UPDATED") && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Note (Optional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-line bg-white p-2 text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={eventMutation.isPending}
                />
              </div>
            )}

            {eventMutation.isError && (
              <p className="text-sm text-red-600 font-medium">Gagal menyimpan update.</p>
            )}

            {eventType && (
              <Button
                className="w-full"
                onClick={() => eventMutation.mutate()}
                disabled={
                  eventMutation.isPending ||
                  (eventType === "STAGE_CHANGED" && !toStage) ||
                  (eventType === "DOCUMENT_UPDATED" && (!docId || !docStatus))
                }
              >
                {eventMutation.isPending ? "Menyimpan..." : "Simpan Update"}
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
