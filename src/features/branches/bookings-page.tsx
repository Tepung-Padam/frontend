import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";
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

function getStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    PENDING: "Menunggu",
    CONFIRMED: "Dikonfirmasi",
    CHECKED_IN: "Sudah Check-in",
    SERVING: "Sedang dilayani",
    COMPLETED: "Selesai",
    CANCELLED: "Dibatalkan",
    EXPIRED: "Kadaluarsa",
    NO_SHOW: "Tidak hadir",
  };
  return labels[status] ?? status;
}

export function BookingsPage() {
  // api.bookings() sudah dinormalisasi ke Paginated<Booking> di api-client
  const query = useQuery({
    queryKey: ["bookings"],
    queryFn: api.bookings,
  });

  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        message="Booking belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  }

  const bookings = query.data.items;

  return (
    <div className="space-y-6 pt-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
            Branch booking
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Booking saya</h1>
          <p className="mt-2 text-slate-500">
            Semua jadwal kunjungan cabang yang pernah dibuat.
          </p>
        </div>
        <Link to="/app/branches">
          <Button variant="secondary">
            <MapPin size={16} />
            Buat booking baru
          </Button>
        </Link>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Belum ada booking"
          detail="Kunjungi menu Cabang untuk mencari jadwal dan membuat booking."
        />
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <BookingCard key={booking.booking_code} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: import("@/types/domain").Booking }) {
  const client = useQueryClient();

  const checkIn = useMutation({
    mutationFn: () => api.checkIn(booking.booking_code),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["bookings"] });
      void client.invalidateQueries({ queryKey: ["booking", booking.booking_code] });
    },
  });

  const cancel = useMutation({
    mutationFn: () => api.cancelBooking(booking.booking_code),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const canCheckIn =
    !checkIn.isPending &&
    !cancel.isPending &&
    ["PENDING", "CONFIRMED"].includes(booking.status);

  const canCancel =
    !cancel.isPending &&
    !checkIn.isPending &&
    ["PENDING", "CONFIRMED"].includes(booking.status);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="mt-0.5 rounded-xl bg-orange-50 p-2.5 text-orange-600">
            <CalendarDays size={18} />
          </span>
          <div>
            <h2 className="font-bold">{booking.branch_name ?? booking.branch_id}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(booking.appointment_date)} · {booking.start_time} – {booking.end_time}
            </p>
            <p className="mt-1 text-xs text-slate-400">Ref: {booking.booking_code}</p>
          </div>
        </div>
        <Badge tone={getStatusTone(booking.status)}>{getStatusLabel(booking.status)}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link to={`/app/bookings/${booking.booking_code}`}>
          <Button variant="secondary">Detail</Button>
        </Link>

        {canCheckIn && (
          <Button disabled={checkIn.isPending} onClick={() => checkIn.mutate()}>
            {checkIn.isPending ? "Memproses..." : "Check-in"}
          </Button>
        )}

        {canCancel && (
          <Button
            variant="ghost"
            disabled={cancel.isPending}
            onClick={() => cancel.mutate()}
          >
            {cancel.isPending ? "Membatalkan..." : "Batalkan"}
          </Button>
        )}
      </div>

      {checkIn.isSuccess && checkIn.data && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {checkIn.data.message}
        </p>
      )}
      {checkIn.isError && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Gagal check-in. Slot mungkin sudah melewati batas waktu.
        </p>
      )}
      {cancel.isError && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          Gagal membatalkan booking.
        </p>
      )}
    </Card>
  );
}