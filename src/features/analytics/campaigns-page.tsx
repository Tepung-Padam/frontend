import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Send, Plus } from "lucide-react";

export function CampaignsPage() { 
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["campaigns"], queryFn: api.campaigns }); 
  
  // State untuk formulir Demo
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [campaignName, setCampaignName] = useState("Promo Spesial Demo");
  const [messageTitle, setMessageTitle] = useState("Penawaran Eksklusif untuk Anda");
  const [messageBody, setMessageBody] = useState("Kami telah menyetujui limit simulasi awal untuk Anda. Silakan cek menu Financing.");

  // Mutasi berantai untuk membuat Campaign -> Add Target -> Send Message
  const sendDemoMessage = useMutation({
    mutationFn: async () => {
      if (!customerId.trim()) throw new Error("Customer ID tidak boleh kosong!");

      // 1. Buat Campaign
      const campaign = await api.createCampaign({
        name: campaignName,
        campaign_type: "PRODUCT_EDUCATION" as any, 
        description: "Dikirim via Demo UI"
      });

      // 2. Tambahkan Nasabah ke dalam Target Campaign
      const targets = await api.addCampaignTargets(campaign.id, [
        { customer_id: customerId.trim() }
      ]);

      if (!targets || targets.length === 0) {
        throw new Error("Gagal mendaftarkan nasabah ke target campaign.");
      }

      // 3. Kirim Pesan ke Inbox Nasabah Tersebut
      await api.deliverMessage(customerId.trim(), {
        campaign_target_id: targets[0].id,
        selection_method: "MANUAL_SIMULATION",
        title: messageTitle,
        body: messageBody
      });
    },
    onSuccess: () => {
      alert("✅ Pesan berhasil dikirim ke Inbox Nasabah!");
      setShowForm(false);
      // Refresh daftar campaign
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
    onError: (err: any) => {
      alert(`❌ Gagal mengirim pesan: ${err.message || "Terjadi kesalahan API"}`);
    }
  });
  
  if (query.isLoading) return <LoadingState />; 
  
  if (query.isError || !query.data?.items) 
    return <ErrorState message="Campaign belum dapat dimuat." onRetry={() => void query.refetch()} />; 
    
  return (
    <div className="space-y-6 pt-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Interventions</p>
          <h1 className="mt-2 font-display text-3xl font-bold">Simulated campaigns</h1>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          <Plus size={18} />
          {showForm ? "Tutup Formulir" : "Buat Campaign Demo"}
        </button>
      </div>

      {/* Formulir Pengiriman Pesan (Demo UI) */}
      {showForm && (
        <Card className="border-orange-200 bg-orange-50/50 p-6 shadow-none">
          <h2 className="font-bold text-orange-900">Kirim Pesan ke Inbox Nasabah</h2>
          <p className="mt-1 text-xs text-orange-700">Fitur ini akan menjalankan 3 API backend sekaligus untuk keperluan presentasi.</p>
          
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-600">Customer ID (UUID Nasabah)</label>
              <input 
                type="text" 
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Contoh: 123e4567-e89b-12d3-a456-426614174000"
                className="w-full rounded-xl border border-line bg-white px-4 py-2 text-sm outline-none focus:border-orange-500"
              />
              <p className="mt-1 text-[10px] text-slate-500">*Anda bisa menyalin UUID Nasabah dari menu Retention (At-Risk) staf.</p>
            </div>
            
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Nama Campaign</label>
              <input 
                type="text" 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2 text-sm outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-600">Judul Pesan Inbox</label>
              <input 
                type="text" 
                value={messageTitle}
                onChange={(e) => setMessageTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-4 py-2 text-sm outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-600">Isi Pesan</label>
              <textarea 
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-line bg-white px-4 py-2 text-sm outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button 
              onClick={() => sendDemoMessage.mutate()}
              disabled={sendDemoMessage.isPending}
              className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              <Send size={16} />
              {sendDemoMessage.isPending ? "Mengirim..." : "Kirim Sekarang"}
            </button>
          </div>
        </Card>
      )}
      
      {/* Daftar Campaign */}
      {query.data.items.length === 0 ? (
        <EmptyState title="Belum ada campaign" detail="Campaign simulasi akan muncul dari backend setelah intervention dibuat." /> 
      ) : (
        <div className="grid gap-4">
          {query.data.items.map((campaign) => (
            <Card key={campaign.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold">{campaign.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{campaign.description}</p>
                </div>
                <Badge tone="warning">{campaign.status}</Badge>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                {campaign.is_simulation ? "Simulation" : "Production"} · {campaign.campaign_type.replaceAll("_", " ")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  ); 
}