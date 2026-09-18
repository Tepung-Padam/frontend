import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Home, Plus, Users } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import type { PocketKind } from "@/types/domain";

const KIND_OPTIONS: { value: PocketKind; label: string }[] = [
  { value: "KPR", label: "KPR (rumah)" },
  { value: "BILLS", label: "Tagihan bersama" },
  { value: "CHILD", label: "Kontrol anak" },
  { value: "GENERAL", label: "Umum" },
];

export function PocketsPage() {
  const client = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<PocketKind>("KPR");
  const [dualApproval, setDualApproval] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const list = useQuery({ queryKey: ["pockets"], queryFn: () => api.pockets() });
  const invitations = useQuery({
    queryKey: ["pocket-invitations"],
    queryFn: () => api.pocketInvitations(),
  });

  const pocketIds = list.data?.data.items.map((item) => item.pocket_id) ?? [];
  const details = useQueries({
    queries: pocketIds.map((id) => ({
      queryKey: ["pocket-detail", id],
      queryFn: () => api.pocketDetail(id),
    })),
  });

  const create = useMutation({
    mutationFn: () => api.createPocket({ name: name.trim(), kind, dual_approval: dualApproval }),
    onSuccess: () => {
      setName("");
      setShowForm(false);
      void client.invalidateQueries({ queryKey: ["pockets"] });
    },
    onError: (cause) =>
      setFormError(cause instanceof ApiError ? cause.message : "Gagal membuat kantong."),
  });

  const respond = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "ACCEPTED" | "DECLINED" }) =>
      api.respondPocketInvitation(id, decision),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["pocket-invitations"] });
      void client.invalidateQueries({ queryKey: ["pockets"] });
    },
  });

  if (list.isLoading || invitations.isLoading) return <LoadingState />;
  if (list.isError || !list.data)
    return <ErrorState message="Kantong bersama belum dapat dimuat." onRetry={() => void list.refetch()} />;

  const pendingInvitations = (invitations.data?.data.items ?? []).filter(
    (inv) => inv.status === "PENDING",
  );

  return (
    <div className="space-y-6 pt-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            Kantong bersama
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Kantong saya</h1>
          <p className="mt-2 text-slate-500">
            Tabungan bersama pasangan atau keluarga untuk tujuan seperti DP rumah (KPR), tagihan,
            atau kontrol pengeluaran anak.
          </p>
        </div>
        <Button variant={showForm ? "secondary" : "primary"} onClick={() => setShowForm((prev) => !prev)}>
          <Plus size={16} /> {showForm ? "Tutup" : "Buat kantong"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setFormError(null);
              create.mutate();
            }}
          >
            <label className="block text-sm font-bold">
              Nama kantong
              <input
                className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={100}
                placeholder="Misal: DP Rumah Kami"
              />
            </label>
            <label className="block text-sm font-bold">
              Jenis kantong
              <select
                className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3"
                value={kind}
                onChange={(event) => setKind(event.target.value as PocketKind)}
              >
                {KIND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                type="checkbox"
                checked={dualApproval}
                onChange={(event) => setDualApproval(event.target.checked)}
              />
              Wajib persetujuan anggota lain untuk setiap pembayaran
            </label>
            {formError && (
              <p role="alert" className="border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </p>
            )}
            <Button disabled={create.isPending}>
              {create.isPending ? "Membuat..." : "Buat kantong"}
            </Button>
          </form>
        </Card>
      )}

      {pendingInvitations.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold">Undangan ({pendingInvitations.length})</h2>
          <div className="space-y-3">
            {pendingInvitations.map((inv) => {
              const expired = inv.expires_at ? new Date(inv.expires_at) < new Date() : false;
              return (
                <Card key={inv.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">Undangan kantong bersama</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {expired ? "Kadaluarsa" : `Berlaku hingga ${formatDate(inv.expires_at)}`}
                      </p>
                    </div>
                    {!expired && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          disabled={respond.isPending}
                          onClick={() => respond.mutate({ id: inv.id, decision: "DECLINED" })}
                        >
                          Tolak
                        </Button>
                        <Button
                          disabled={respond.isPending}
                          onClick={() => respond.mutate({ id: inv.id, decision: "ACCEPTED" })}
                        >
                          Terima
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {pocketIds.length === 0 ? (
        <EmptyState
          title="Belum ada kantong bersama"
          detail="Buat kantong baru untuk mulai menabung bersama, misalnya untuk DP rumah (KPR)."
        />
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {details.map((detail, index) => {
            if (detail.isLoading) return <div key={pocketIds[index]} className="py-5"><LoadingState /></div>;
            const pocket = detail.data?.data;
            if (!pocket) return null;
            const activeMembers = pocket.members.filter((m) => m.status === "ACTIVE").length;
            return (
              <Link
                key={pocket.id}
                to={`/app/pockets/${pocket.id}`}
                className="flex items-center justify-between gap-3 py-5"
              >
                <div className="flex gap-3">
                  <span className="mt-0.5 rounded-xl bg-orange-50 p-2.5 text-orange-600">
                    <Home size={18} />
                  </span>
                  <div>
                    <h2 className="font-bold">{pocket.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {codeLabel(pocket.kind)} · {formatCurrency(pocket.balance)}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Users size={12} /> {activeMembers} anggota aktif
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
