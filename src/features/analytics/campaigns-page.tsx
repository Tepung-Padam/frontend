import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Plus, Send, XCircle } from "lucide-react";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { codeLabel } from "@/lib/format";

export function CampaignsPage() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns });

  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [campaignName, setCampaignName] = useState("Promo Spesial Demo");
  const [messageTitle, setMessageTitle] = useState("Penawaran Eksklusif untuk Anda");
  const [messageBody, setMessageBody] = useState(
    "Kami telah menyiapkan penawaran simulasi untuk Anda. Silakan cek menu Financing.",
  );

  // FIX: ganti alert() dengan state inline agar tidak break UX
  const [sendResult, setSendResult] = useState<
    { ok: true } | { ok: false; message: string } | null
  >(null);

  const sendDemoMessage = useMutation({
    mutationFn: async () => {
      if (!customerId.trim()) throw new Error("Customer ID tidak boleh kosong.");

      // Step 1: buat campaign
      const campaign = await api.createCampaign({
        name: campaignName,
        campaign_type: "PRODUCT_EDUCATION",
        description: "Dikirim via Demo UI",
      });

      // Step 2: daftarkan nasabah ke target
      const targets = await api.addCampaignTargets(campaign.id, [
        { customer_id: customerId.trim() },
      ]);

      if (!targets || targets.length === 0) {
        throw new Error("Gagal mendaftarkan nasabah ke target campaign.");
      }

      // Step 3: kirim pesan ke inbox nasabah
      await api.deliverMessage(customerId.trim(), {
        campaign_target_id: targets[0].id,
        selection_method: "MANUAL_SIMULATION",
        title: messageTitle,
        body: messageBody,
      });
    },
    onSuccess: () => {
      setSendResult({ ok: true });
      setShowForm(false);
      setCustomerId("");
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (err: Error) => {
      setSendResult({ ok: false, message: err.message || "Terjadi kesalahan API." });
    },
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data?.items) {
    return (
      <ErrorState
        message="Campaign belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 pt-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            Interventions
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Simulated campaigns</h1>
          <p className="mt-2 text-slate-500">
            Buat campaign simulasi dan kirim pesan ke inbox nasabah secara langsung.
          </p>
        </div>
        <Button
          variant={showForm ? "secondary" : "primary"}
          onClick={() => {
            setShowForm(!showForm);
            setSendResult(null);
          }}
        >
          <Plus size={16} />
          {showForm ? "Tutup formulir" : "Buat campaign demo"}
        </Button>
      </div>

      {/* Inline result feedback menggantikan alert() */}
      {sendResult && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 ${
            sendResult.ok
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {sendResult.ok ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <XCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-bold">
              {sendResult.ok ? "Pesan berhasil dikirim!" : "Gagal mengirim pesan"}
            </p>
            {sendResult.ok ? (
              <p className="mt-0.5 text-sm">
                Pesan sudah masuk ke inbox nasabah. Nasabah dapat melihatnya di menu Inbox.
              </p>
            ) : (
              <p className="mt-0.5 text-sm">{sendResult.message}</p>
            )}
          </div>
          <button
            className="ml-auto shrink-0 text-current opacity-60 hover:opacity-100"
            onClick={() => setSendResult(null)}
          >
            <XCircle size={16} />
          </button>
        </div>
      )}

      {/* Formulir kirim pesan */}
      {showForm && (
        <Card className="border-orange-200 bg-orange-50/40 p-6">
          <h2 className="font-bold text-orange-900">Kirim pesan ke inbox nasabah</h2>
          <p className="mt-1 text-xs text-orange-700">
            3 API dipanggil sekaligus: buat campaign → tambah target → kirim pesan.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Customer ID (UUID nasabah)
              </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                disabled={sendDemoMessage.isPending}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Salin UUID nasabah dari tabel At-risk customers di menu Retention.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Nama campaign
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                disabled={sendDemoMessage.isPending}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Judul pesan inbox
              </label>
              <input
                type="text"
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                disabled={sendDemoMessage.isPending}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Isi pesan
              </label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                disabled={sendDemoMessage.isPending}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              disabled={sendDemoMessage.isPending || !customerId.trim()}
              onClick={() => {
                setSendResult(null);
                sendDemoMessage.mutate();
              }}
            >
              <Send size={16} />
              {sendDemoMessage.isPending ? "Mengirim..." : "Kirim sekarang"}
            </Button>
          </div>
        </Card>
      )}

      {/* Daftar campaign */}
      {query.data.items.length === 0 ? (
        <EmptyState
          title="Belum ada campaign"
          detail="Campaign simulasi akan muncul setelah intervention dibuat melalui formulir di atas."
        />
      ) : (
        <div className="grid gap-4">
          {query.data.items.map((campaign) => (
            <Card key={campaign.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{campaign.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{campaign.description}</p>
                </div>
                <Badge
                  tone={
                    campaign.status === "ACTIVE"
                      ? "success"
                      : campaign.status === "COMPLETED"
                        ? "neutral"
                        : campaign.status === "CANCELLED"
                          ? "danger"
                          : "warning"
                  }
                >
                  {codeLabel(campaign.status)}
                </Badge>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {campaign.is_simulation ? "Simulasi" : "Produksi"} |{" "}
                {codeLabel(campaign.campaign_type)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
