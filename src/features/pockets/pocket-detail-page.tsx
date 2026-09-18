import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gauge,
  ShieldCheck,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { codeLabel, formatCurrency, formatDate } from "@/lib/format";
import { useSession } from "@/features/auth/use-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import type { PocketMemberStatus, PocketPaymentCategory, PocketPaymentStatus } from "@/types/domain";

const memberTone: Record<PocketMemberStatus, "success" | "warning" | "danger" | "neutral"> = {
  ACTIVE: "success",
  PENDING: "warning",
  DECLINED: "danger",
  EXPIRED: "neutral",
};

const paymentTone: Record<PocketPaymentStatus, "success" | "warning" | "danger"> = {
  EXECUTED: "success",
  PENDING: "warning",
  REJECTED: "danger",
};

const PAYMENT_CATEGORIES: PocketPaymentCategory[] = [
  "BNI_GRIYA",
  "QRIS_SIMULATED",
  "ELECTRICITY",
  "WATER",
  "INTERNET",
  "SCHOOL_PAYMENT",
];

function errorMessage(cause: unknown, fallback: string): string {
  return cause instanceof ApiError ? cause.message : fallback;
}

export function PocketDetailPage() {
  const { id = "" } = useParams();
  const { user } = useSession();
  const client = useQueryClient();

  const me = useQuery({ queryKey: ["me-summary"], queryFn: () => api.meSummary() });
  const pocket = useQuery({
    queryKey: ["pocket-detail", id],
    queryFn: () => api.pocketDetail(id),
    enabled: Boolean(id),
  });
  const payments = useQuery({
    queryKey: ["pocket-payments", id],
    queryFn: () => api.pocketPayments(id),
    enabled: Boolean(id),
  });
  const transactions = useQuery({
    queryKey: ["pocket-transactions", id],
    queryFn: () => api.pocketTransactions(id),
    enabled: Boolean(id),
  });

  const invalidateAll = () => {
    void client.invalidateQueries({ queryKey: ["pocket-detail", id] });
    void client.invalidateQueries({ queryKey: ["pockets"] });
  };

  if (pocket.isLoading) return <LoadingState />;
  if (pocket.isError || !pocket.data)
    return <ErrorState message="Kantong tidak ditemukan." onRetry={() => void pocket.refetch()} />;

  const data = pocket.data.data;
  const myCustomerRef = me.data?.customer_ref ?? null;

  return (
    <div className="max-w-2xl space-y-6 pt-3">
      <Link to="/app/pockets" className="inline-flex text-sm font-bold text-orange-600 hover:text-orange-700">
        ← Kembali ke kantong saya
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          {codeLabel(data.kind)}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">{data.name}</h1>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 text-slate-500">
          <Wallet size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Saldo kantong</span>
        </div>
        <p className="mt-2 font-display text-4xl font-bold">{formatCurrency(data.balance)}</p>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-teal-600" />
            {data.dual_approval ? "Persetujuan dua anggota aktif" : "Pembayaran langsung eksekusi"}
          </span>
          <span>Limit harian: {data.daily_limit ? formatCurrency(data.daily_limit) : "Tidak dibatasi"}</span>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          Simulasi sandbox: tidak ada rekening bank yang benar-benar terpotong.
        </p>
      </Card>

      <MembersCard pocketId={id} members={data.members} myCustomerRef={myCustomerRef} onChanged={invalidateAll} />

      <ContributionCard pocketId={id} members={data.members} myCustomerRef={myCustomerRef} onChanged={invalidateAll} />

      <SpendingLimitCard pocketId={id} dailyLimit={data.daily_limit} onChanged={invalidateAll} />

      <PaymentsCard
        pocketId={id}
        myCustomerId={user?.customer_id ?? null}
        payments={payments.data?.data.items ?? []}
        isLoading={payments.isLoading}
        onChanged={() => {
          invalidateAll();
          void client.invalidateQueries({ queryKey: ["pocket-payments", id] });
          void client.invalidateQueries({ queryKey: ["pocket-transactions", id] });
        }}
      />

      <TransactionsCard transactions={transactions.data?.data.items ?? []} isLoading={transactions.isLoading} />
    </div>
  );
}

function MembersCard({
  pocketId,
  members,
  myCustomerRef,
  onChanged,
}: {
  pocketId: string;
  members: import("@/types/domain").PocketMemberSummary[];
  myCustomerRef: string | null;
  onChanged: () => void;
}) {
  const [customerRef, setCustomerRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const invite = useMutation({
    mutationFn: () => api.invitePocketMember(pocketId, customerRef.trim()),
    onSuccess: () => {
      setCustomerRef("");
      setSuccess("Undangan terkirim.");
      setError(null);
      onChanged();
    },
    onError: (cause) => {
      setSuccess(null);
      setError(errorMessage(cause, "Gagal mengirim undangan."));
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Users size={18} className="text-orange-600" />
        <h2 className="font-bold">Anggota</h2>
      </div>
      <div className="mt-4 space-y-3">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 rounded-xl bg-paper p-3">
            <div>
              <p className="text-sm font-bold">
                {member.customer_ref}
                {member.customer_ref === myCustomerRef && " (Anda)"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Kontribusi: {formatCurrency(member.contribution)}
                {member.contribution_amount &&
                  ` · Rencana ${formatCurrency(member.contribution_amount)}/tgl ${member.day_of_month}`}
              </p>
            </div>
            <Badge tone={memberTone[member.status]}>{codeLabel(member.status)}</Badge>
          </div>
        ))}
      </div>

      <form
        className="mt-5 space-y-3 border-t border-line pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setSuccess(null);
          invite.mutate();
        }}
      >
        <label className="block text-sm font-bold">
          Undang anggota (kode referensi nasabah)
          <div className="mt-2 flex gap-2">
            <input
              className="min-h-11 flex-1 rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              value={customerRef}
              onChange={(event) => setCustomerRef(event.target.value)}
              placeholder="Misal: ECO-SITI"
              required
            />
            <Button disabled={invite.isPending}>
              <UserPlus size={16} /> {invite.isPending ? "Mengirim..." : "Undang"}
            </Button>
          </div>
        </label>
        <p className="text-xs text-slate-400">
          Hanya pemilik kantong yang dapat mengundang anggota baru; backend akan menolak jika Anda
          bukan pemilik.
        </p>
        {error && <p role="alert" className="border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {success && <p className="border-l-2 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
      </form>
    </Card>
  );
}

function ContributionCard({
  pocketId,
  members,
  myCustomerRef,
  onChanged,
}: {
  pocketId: string;
  members: import("@/types/domain").PocketMemberSummary[];
  myCustomerRef: string | null;
  onChanged: () => void;
}) {
  const mine = members.find((m) => m.customer_ref === myCustomerRef);
  const [amount, setAmount] = useState("");
  const [day, setDay] = useState(1);
  const [contributeAmount, setContributeAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contributeError, setContributeError] = useState<string | null>(null);

  useEffect(() => {
    if (mine?.contribution_amount) setAmount(mine.contribution_amount);
    if (mine?.day_of_month) setDay(mine.day_of_month);
    // Pre-fill only from the resolved values for my own membership; re-runs once `mine` loads.
  }, [mine?.contribution_amount, mine?.day_of_month]);

  const rule = useMutation({
    mutationFn: () => api.setPocketContributionRule(pocketId, amount, day),
    onSuccess: () => {
      setError(null);
      onChanged();
    },
    onError: (cause) => setError(errorMessage(cause, "Gagal menyimpan aturan setoran.")),
  });

  const contribute = useMutation({
    mutationFn: () => api.contributeToPocket(pocketId, contributeAmount.trim()),
    onSuccess: () => {
      setContributeAmount("");
      setContributeError(null);
      onChanged();
    },
    onError: (cause) => setContributeError(errorMessage(cause, "Gagal menyetor.")),
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Gauge size={18} className="text-orange-600" />
        <h2 className="font-bold">Setoran</h2>
      </div>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          rule.mutate();
        }}
      >
        <label className="block text-sm font-bold">
          Nominal setoran otomatis
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="500000"
            inputMode="decimal"
          />
        </label>
        <label className="block text-sm font-bold">
          Tanggal
          <input
            type="number"
            min={1}
            max={28}
            className="mt-2 min-h-11 w-20 rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            value={day}
            onChange={(event) => setDay(Number(event.target.value))}
          />
        </label>
        <Button className="self-end" disabled={rule.isPending || !amount}>
          {rule.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
      {error && <p role="alert" className="mt-3 border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form
        className="mt-5 flex items-end gap-2 border-t border-line pt-4"
        onSubmit={(event) => {
          event.preventDefault();
          contribute.mutate();
        }}
      >
        <label className="block flex-1 text-sm font-bold">
          Setor sekarang
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            value={contributeAmount}
            onChange={(event) => setContributeAmount(event.target.value)}
            placeholder="100000"
            inputMode="decimal"
            required
          />
        </label>
        <Button variant="secondary" disabled={contribute.isPending}>
          {contribute.isPending ? "Memproses..." : "Setor"}
        </Button>
      </form>
      {contributeError && (
        <p role="alert" className="mt-3 border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">
          {contributeError}
        </p>
      )}
      <p className="mt-3 text-xs text-slate-400">
        Setoran simulasi; rekening bank tidak benar-benar didebit.
      </p>
    </Card>
  );
}

function SpendingLimitCard({
  pocketId,
  dailyLimit,
  onChanged,
}: {
  pocketId: string;
  dailyLimit: string | null;
  onChanged: () => void;
}) {
  const [limit, setLimit] = useState(dailyLimit ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: () => api.setPocketSpendingLimit(pocketId, limit.trim()),
    onSuccess: () => {
      setError(null);
      setSuccess("Limit harian diperbarui.");
      onChanged();
    },
    onError: (cause) => {
      setSuccess(null);
      setError(errorMessage(cause, "Gagal mengubah limit."));
    },
  });

  return (
    <Card className="p-6">
      <h2 className="font-bold">Limit pengeluaran harian</h2>
      <p className="mt-1 text-sm text-slate-500">
        Berlaku untuk seluruh anggota, dihitung per hari kalender Asia/Jakarta. Hanya pemilik
        kantong yang dapat mengubahnya.
      </p>
      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          update.mutate();
        }}
      >
        <label className="block flex-1 text-sm font-bold">
          Nominal limit
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            value={limit}
            onChange={(event) => setLimit(event.target.value)}
            placeholder="1000000"
            inputMode="decimal"
            required
          />
        </label>
        <Button variant="secondary" disabled={update.isPending}>
          {update.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
      {error && <p role="alert" className="mt-3 border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-3 border-l-2 border-emerald-500 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p>}
    </Card>
  );
}

function PaymentsCard({
  pocketId,
  myCustomerId,
  payments,
  isLoading,
  onChanged,
}: {
  pocketId: string;
  myCustomerId: string | null;
  payments: import("@/types/domain").PocketPaymentRecord[];
  isLoading: boolean;
  onChanged: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<PocketPaymentCategory>("BNI_GRIYA");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewError, setReviewError] = useState<string | null>(null);

  const requestPayment = useMutation({
    mutationFn: () => api.createPocketPayment(pocketId, amount.trim(), category, description.trim()),
    onSuccess: () => {
      setAmount("");
      setDescription("");
      setFormError(null);
      onChanged();
    },
    onError: (cause) => setFormError(errorMessage(cause, "Gagal mengajukan pembayaran.")),
  });

  const review = useMutation({
    mutationFn: ({ paymentId, decision }: { paymentId: string; decision: "APPROVED" | "REJECTED" }) =>
      api.reviewPocketPayment(pocketId, paymentId, decision, reviewNotes[paymentId]?.trim() || "Ditinjau dari aplikasi"),
    onSuccess: () => {
      setReviewError(null);
      onChanged();
    },
    onError: (cause) => setReviewError(errorMessage(cause, "Gagal meninjau pembayaran.")),
  });

  return (
    <Card className="p-6">
      <h2 className="font-bold">Pembayaran</h2>

      <form
        className="mt-4 space-y-3 border-b border-line pb-5"
        onSubmit={(event) => {
          event.preventDefault();
          requestPayment.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Nominal
            <input
              className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="1500000"
              inputMode="decimal"
              required
            />
          </label>
          <label className="block text-sm font-bold">
            Kategori
            <select
              className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3"
              value={category}
              onChange={(event) => setCategory(event.target.value as PocketPaymentCategory)}
            >
              {PAYMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {codeLabel(cat)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm font-bold">
          Keterangan
          <input
            className="mt-2 min-h-11 w-full rounded-xl border border-line bg-white px-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Misal: Cicilan KPR bulan ini"
            maxLength={255}
            required
          />
        </label>
        {formError && <p role="alert" className="border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">{formError}</p>}
        <Button disabled={requestPayment.isPending}>
          {requestPayment.isPending ? "Mengajukan..." : "Ajukan pembayaran"}
        </Button>
      </form>

      {reviewError && (
        <p role="alert" className="mt-4 border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">
          {reviewError}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {isLoading && <LoadingState />}
        {!isLoading && payments.length === 0 && (
          <p className="text-sm text-slate-500">Belum ada pengajuan pembayaran.</p>
        )}
        {payments.map((payment) => {
          const isMine = payment.initiated_by === myCustomerId;
          const canReview = payment.status === "PENDING" && !isMine;
          return (
            <div key={payment.id} className="rounded-xl bg-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{codeLabel(payment.category)}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{payment.description}</p>
                  <p className="mt-1 text-sm font-bold">{formatCurrency(payment.amount)}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isMine ? "Diajukan oleh Anda" : "Diajukan anggota lain"} ·{" "}
                    {formatDate(payment.created_at)}
                  </p>
                </div>
                <Badge tone={paymentTone[payment.status]}>{codeLabel(payment.status)}</Badge>
              </div>
              {payment.status === "PENDING" && isMine && (
                <p className="mt-3 text-xs text-orange-600">Menunggu persetujuan anggota lain.</p>
              )}
              {canReview && (
                <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 sm:flex-row sm:items-center">
                  <input
                    className="min-h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder="Catatan tinjauan (opsional)"
                    value={reviewNotes[payment.id] ?? ""}
                    onChange={(event) =>
                      setReviewNotes((prev) => ({ ...prev, [payment.id]: event.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ paymentId: payment.id, decision: "REJECTED" })}
                    >
                      Tolak
                    </Button>
                    <Button
                      disabled={review.isPending}
                      onClick={() => review.mutate({ paymentId: payment.id, decision: "APPROVED" })}
                    >
                      Setujui
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TransactionsCard({
  transactions,
  isLoading,
}: {
  transactions: import("@/types/domain").PocketLedgerEntry[];
  isLoading: boolean;
}) {
  return (
    <Card className="p-6">
      <h2 className="font-bold">Riwayat transaksi</h2>
      <div className="mt-4 divide-y divide-line">
        {isLoading && <LoadingState />}
        {!isLoading && transactions.length === 0 && (
          <p className="py-2 text-sm text-slate-500">Belum ada transaksi.</p>
        )}
        {transactions.map((entry) => (
          <div key={entry.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex gap-3">
              <span
                className={`mt-0.5 grid h-9 w-9 place-items-center rounded-full ${
                  entry.direction === "CREDIT" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                }`}
              >
                {entry.direction === "CREDIT" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
              </span>
              <div>
                <p className="text-sm font-bold">{codeLabel(entry.category)}</p>
                <p className="mt-0.5 text-xs text-slate-500">{entry.description}</p>
                <p className="mt-0.5 text-xs text-slate-400">{formatDate(entry.created_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${entry.direction === "CREDIT" ? "text-emerald-700" : "text-orange-700"}`}>
                {entry.direction === "CREDIT" ? "+" : "-"}
                {formatCurrency(entry.amount)}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">Saldo {formatCurrency(entry.balance_after)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
