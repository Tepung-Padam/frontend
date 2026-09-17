import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, MapPin, XCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import type { BookingStatus } from "@/types/domain";

function getStatusTone(status: BookingStatus): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "COMPLETED":
    case "CHECKED_IN":
    case "SERVING":
      return "success";
    case "CANCELLED":
    case "EXPIRED":
    case "NO_SHOW":
      return "danger";
    case "CONFIRMED":
      return "success";
    default:
      return "warning";
  }
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Menunggu konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  CHECKED_IN: "Sudah check-in",
  SERVING: "Sedang dilayani",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
  EXPIRED: "Kadaluarsa",
  NO_SHOW: "Tidak hadir",
};

export function BookingDetailPage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  const query = useQuery({
    queryKey: ["booking", code],
    queryFn: () => api.booking(code),
    enabled: Boolean(code),
    // Polling setiap 15 detik saat status masih aktif
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (!status) return false;
      return ["PENDING", "CONFIRMED", "CHECKED_IN", "SERVING"].includes(status) ? 15_000 : false;
    },
  });

  const checkIn = useMutation({
    mutationFn: () => api.checkIn(code),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["booking", code] });
      void client.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelBooking(code, cancelReason.trim() || undefined),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["booking", code] });
      void client.invalidateQueries({ queryKey: ["bookings"] });
      setShowCancelForm(false);
    },
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message="Detail booking tidak ditemukan."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const booking = query.data;
  const isActive = ["PENDING", "CONFIRMED"].includes(booking.status);
  const isCheckedIn = ["CHECKED_IN", "SERVING"].includes(booking.status);
  const isDone = ["COMPLETED", "CANCELLED", "EXPIRED", "NO_SHOW"].includes(booking.status);

  return (
    <div className="max-w-2xl space-y-6 pt-3">
      <Link
        to="/app/bookings"
        className="inline-flex text-sm font-bold text-orange-600 transition hover:text-orange-700"
      >
        ← Kembali ke daftar booking
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Branch booking
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          {booking.branch_name ?? booking.branch_id}
        </h1>
        <p className="mt-2 text-slate-500">Kode booking: {booking.booking_code}</p>
      </div>

      {/* Status card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Status</h2>
          <Badge tone={getStatusTone(booking.status)}>
            {STATUS_LABELS[booking.status] ?? booking.status}
          </Badge>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <CalendarDays size={13} /> Tanggal
            </dt>
            <dd className="mt-1 font-bold">{formatDate(booking.appointment_date)}</dd>
          </div>

          <div>
            <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Clock3 size={13} /> Waktu
            </dt>
            <dd className="mt-1 font-bold">
              {booking.start_time} – {booking.end_time}
            </dd>
          </div>

          <div>
            <dt className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <MapPin size={13} /> Cabang
            </dt>
            <dd className="mt-1 font-bold">{booking.branch_name ?? booking.branch_id}</dd>
          </div>

          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Window check-in
            </dt>
            <dd className="mt-1 text-sm text-slate-600">
              {booking.check_in_earliest} – {booking.check_in_latest}
            </dd>
          </div>

          {booking.checked_in_at && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Check-in pukul
              </dt>
              <dd className="mt-1 font-bold text-teal-700">
                {new Date(booking.checked_in_at).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </dd>
            </div>
          )}

          {booking.cancellation_reason && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Alasan pembatalan
              </dt>
              <dd className="mt-1 text-sm text-slate-600">{booking.cancellation_reason}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Check-in success state */}
      {isCheckedIn && (
        <Card className="border-teal-200 bg-teal-50 p-6">
          <div className="flex gap-3 text-teal-700">
            <CheckCircle2 size={22} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Anda sudah check-in</p>
              <p className="mt-1 text-sm">Silakan menunggu di antrean atau ikuti petunjuk dari petugas cabang.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions untuk booking aktif */}
      {isActive && (
        <>
          {/* Check-in action */}
          <Card className="border-orange-200 bg-orange-50/40 p-6">
            <div className="flex gap-4">
              <div className="rounded-xl bg-white p-3 text-orange-600 shadow-sm">
                <CheckCircle2 size={21} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                  Check-in
                </p>
                <h2 className="mt-1 font-bold">
                  Konfirmasi kehadiran Anda
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Check-in dapat dilakukan dalam window:{" "}
                  <strong>{booking.check_in_earliest} – {booking.check_in_latest}</strong>.
                  Backend akan menolak jika di luar window tersebut.
                </p>

                {checkIn.isSuccess && checkIn.data && (
                  <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                    {checkIn.data.message}
                  </p>
                )}
                {checkIn.isError && (
                  <p className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-700">
                    Check-in ditolak backend. Pastikan sudah dalam window waktu yang ditentukan.
                  </p>
                )}

                <Button
                  className="mt-4"
                  disabled={checkIn.isPending}
                  onClick={() => checkIn.mutate()}
                >
                  {checkIn.isPending ? "Memproses..." : "Lakukan Check-in"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Cancel action */}
          {!showCancelForm ? (
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setShowCancelForm(true)}
            >
              <XCircle size={16} /> Batalkan booking ini
            </Button>
          ) : (
            <Card className="border-red-200 bg-red-50/40 p-5">
              <h3 className="font-bold text-red-900">Batalkan booking</h3>
              <p className="mt-1 text-sm text-slate-600">
                Tindakan ini tidak dapat diurungkan.
              </p>
              <div className="mt-4">
                <label className="block text-sm font-bold text-slate-700">
                  Alasan pembatalan (opsional)
                </label>
                <input
                  className="mt-2 min-h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  placeholder="Misal: jadwal berubah"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={cancel.isPending}
                />
              </div>

              {cancel.isError && (
                <p className="mt-3 rounded-xl bg-red-100 p-3 text-sm text-red-700">
                  Gagal membatalkan booking. Coba lagi.
                </p>
              )}

              <div className="mt-4 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelForm(false)}
                  disabled={cancel.isPending}
                >
                  Kembali
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={cancel.isPending}
                  onClick={() => cancel.mutate()}
                >
                  {cancel.isPending ? "Membatalkan..." : "Konfirmasi pembatalan"}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Navigasi untuk status selesai */}
      {isDone && (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("/app/bookings")}>
            Lihat semua booking
          </Button>
          <Link to="/app/branches">
            <Button>Buat booking baru</Button>
          </Link>
        </div>
      )}

      <p className="text-xs text-slate-400">
        Aturan check-in, grace period, dan status expired ditentukan sepenuhnya oleh backend.
        Frontend tidak menghitung ulang logika waktu tersebut.
      </p>
    </div>
  );
}
