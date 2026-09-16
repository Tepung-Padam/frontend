import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { useSession } from "@/features/auth/use-session";
import { useState } from "react";

// FIX: pisahkan union type agar tidak bisa pass "" ke CreditEventPayload.event_type
type EventTypeOption = "STAGE_CHANGED" | "DOCUMENT_UPDATED";

export function CreditDetailPage() {
  const { id = "" } = useParams();
  const isStaff = useLocation().pathname.startsWith("/staff/");
  const { user } = useSession();
  const queryClient = useQueryClient();

  // FIX: state dipisah — eventType adalah EventTypeOption | null, bukan ""
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

  return (
    <div className="max-w-3xl space-y-6 pt-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Simulated financing
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {application.data.product_category.replaceAll("_", " ")}
        </h1>
        <p className="mt-2 text-slate-500">
          {formatCurrency(
            application.data.requested_amount,
            application.data.currency,
          )}{" "}
          · dibuat {formatDate(application.data.created_at)}
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Current stage</h2>
          <Badge tone="warning">
            {application.data.current_stage.replaceAll("_", " ")}
          </Badge>
        </div>
        <h2 className="mt-7 font-bold">Document checklist</h2>
        <div className="mt-3 divide-y divide-line">
          {application.data.documents.map((document) => (
            <div
              key={document.id}
              className="flex justify-between py-3 text-sm"
            >
              <span>{document.document_code.replaceAll("_", " ")}</span>
              <span className="font-bold text-slate-500">
                {document.status}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
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
                  {String(event.event_type).replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-slate-500">
                  {String(event.customer_note ?? "Progress diperbarui")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

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
                <option value="">-- Pilih --</option>
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
                  <option value="">-- Pilih --</option>
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
                    <option value="">-- Pilih --</option>
                    {application.data.documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.document_code} ({d.status})
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
                    <option value="">-- Pilih --</option>
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