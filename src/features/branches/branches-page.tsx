import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function BranchesPage() {
  const { id } = useParams();

  return id ? <BranchDetailPage id={id} /> : <BranchListPage />;
}

/* -------------------------------------------------------------------------- */
/* Branch list                                                                */
/* -------------------------------------------------------------------------- */

function BranchListPage() {
  const [city, setCity] = useState("");
  const [nearestEnabled, setNearestEnabled] = useState(false);
  const [nearestBranch, setNearestBranch] = useState<{ latitude: number; longitude: number } | null>(null);

  // Handle geolocation for nearest branch
  const findNearestBranch = () => {
    if (!navigator.geolocation) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearestBranch({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setNearestEnabled(true);
      },
      () => {
        // Permission denied - fallback to city search
        setNearestEnabled(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const query = useQuery({
    queryKey: ["branches", city, nearestEnabled ? "nearest" : "all", nearestBranch],
    queryFn: () => {
      if (nearestBranch) {
        return api.branches({ latitude: nearestBranch.latitude, longitude: nearestBranch.longitude, radius_km: 10, page_size: 5 });
      }
      return api.branches({ city: city.trim() || undefined });
    },
    enabled: !nearestBranch || Boolean(nearestBranch),
  });

  if (query.isLoading) {
    return <LoadingState />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Daftar cabang belum dapat dimuat."
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.data) {
    return (
      <ErrorState
        message="Data cabang kosong."
        onRetry={() => void query.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 pt-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
          Branch service
        </p>

        <h1 className="mt-2 font-display text-3xl font-bold">
          Cari cabang BNI
        </h1>

        <p className="mt-2 max-w-2xl text-slate-500">
          Temukan cabang dan pilih jadwal kunjungan yang tersedia.
        </p>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              aria-label="Kota"
              className="min-h-11 w-full rounded-xl border border-line bg-white pl-11 pr-4 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              placeholder="Cari berdasarkan kota"
              value={city}
              onChange={(event) => {
                setCity(event.target.value);
                setNearestBranch(null);
                setNearestEnabled(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void query.refetch();
                }
              }}
            />
          </div>

          <Button variant="secondary" onClick={() => { findNearestBranch(); void query.refetch(); }}>
            <MapPin size={16} className="mr-2" />
            Terdekat
          </Button>

          <Button onClick={() => void query.refetch()}>
            Cari cabang
          </Button>
        </div>

        {nearestBranch && (
          <p className="mt-2 text-xs text-slate-500">
            Menampilkan cabang dalam radius 10km dari lokasi Anda.
          </p>
        )}
      </Card>

      {(!query.data.items || query.data.items.length === 0) ? (
        <EmptyState
          title="Cabang tidak ditemukan"
          detail="Coba kota lain atau hapus filter pencarian."
        />
      ) : (
        <div className="grid gap-4">
          {query.data.items.map((branch) => (
            <Link
              key={branch.id}
              to={`/app/branches/${branch.id}`}
              className="group"
            >
              <Card className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="rounded-xl bg-orange-50 p-3 text-orange-600 transition group-hover:bg-orange-100">
                      <MapPin size={20} />
                    </span>

                    <div>
                      <h2 className="font-bold">
                        {branch.branch_name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-600">
                        {branch.address}, {branch.city}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {branch.branch_code} · {branch.timezone}
                      </p>
                    </div>
                  </div>

                  <span className="hidden text-sm font-bold text-orange-600 sm:block">
                    Lihat →
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Branch detail                                                              */
/* -------------------------------------------------------------------------- */

function BranchDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const [selectedSlot, setSelectedSlot] = useState<{
    start_time: string;
    end_time: string;
  } | null>(null);

  const branch = useQuery({
    queryKey: ["branch", id],
    queryFn: () => api.branch(id),
  });

  const availability = useQuery({
    queryKey: ["availability", id, date],
    queryFn: () => api.branchAvailability(id, date),
    enabled: Boolean(date),
  });

  const booking = useMutation({
    mutationFn: (slot: {
      start_time: string;
      end_time: string;
    }) =>
      api.createBooking({
        branch_id: id,
        appointment_date: date,
        start_time: slot.start_time,
        end_time: slot.end_time,
        idempotency_key: `${id}-${date}-${slot.start_time}`,
      }),
    onSuccess: (createdBooking) => {
      navigate(`/app/bookings/${createdBooking.booking_code}`);
    },
  });

  if (branch.isLoading) {
    return <LoadingState />;
  }

  if (branch.isError || !branch.data) {
    return (
      <ErrorState
        message="Detail cabang tidak ditemukan."
        onRetry={() => void branch.refetch()}
      />
    );
  }

  const branchData = branch.data;

  return (
    <div className="max-w-4xl space-y-6 pt-3">
      <Link
        className="inline-flex text-sm font-bold text-orange-600 transition hover:text-orange-700"
        to="/app/branches"
      >
        ← Kembali ke daftar cabang
      </Link>

      {/* Branch information */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-orange-50 p-3 text-orange-600">
                  <MapPin size={21} />
                </span>

                <Badge tone="success">Cabang tersedia</Badge>
              </div>

              <h1 className="mt-5 font-display text-3xl font-bold">
                {branchData.branch_name}
              </h1>

              <p className="mt-2 text-slate-600">
                {branchData.address}, {branchData.city}
              </p>

              <p className="mt-2 text-xs font-medium text-slate-500">
                {branchData.branch_code} · {branchData.timezone}
              </p>
            </div>
          </div>

          <div className="mt-7 border-t border-line pt-6">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-teal-600" />

              <h2 className="font-bold">
                Jam operasional
              </h2>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {branchData.operating_hours.map((hours) => (
                <div
                  key={hours.day_of_week}
                  className="flex items-center justify-between rounded-xl bg-paper px-4 py-3"
                >
                  <span className="text-sm font-medium">
                    Hari {hours.day_of_week}
                  </span>

                  <span className="text-sm text-slate-600">
                    {hours.is_closed
                      ? "Tutup"
                      : `${hours.opening_time} – ${hours.closing_time}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Availability */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays
                size={18}
                className="text-teal-600"
              />

              <h2 className="font-bold">
                Pilih tanggal kunjungan
              </h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Slot yang tersedia berasal langsung dari backend.
            </p>
          </div>

          <input
            aria-label="Tanggal booking"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            className="min-h-11 rounded-xl border border-line px-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            value={date}
            onChange={(event) => {
              setDate(event.target.value);
              setSelectedSlot(null);
            }}
          />
        </div>

        {availability.isLoading && (
          <div className="mt-6">
            <LoadingState />
          </div>
        )}

        {availability.isError && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Ketersediaan jadwal belum dapat dimuat. Silakan coba lagi.
          </div>
        )}

        {!availability.isLoading &&
          !availability.isError &&
          availability.data?.closed_reason && (
            <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              {availability.data.closed_reason}
            </div>
          )}

        {!availability.isLoading &&
          !availability.isError &&
          !availability.data?.closed_reason &&
          availability.data?.slots.length === 0 && (
            <EmptyState
              title="Tidak ada slot tersedia"
              detail="Pilih tanggal lain untuk melihat jadwal yang tersedia."
            />
          )}

        {!availability.isLoading &&
          !availability.isError &&
          !availability.data?.closed_reason &&
          availability.data?.slots &&
          availability.data.slots.length > 0 && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {availability.data.slots.map((slot) => {
                const isAvailable =
                  slot.status === "AVAILABLE";

                const isSelected =
                  selectedSlot?.start_time ===
                  slot.start_time;

                return (
                  <button
                    key={slot.start_time}
                    type="button"
                    disabled={!isAvailable || booking.isPending}
                    onClick={() =>
                      isAvailable &&
                      setSelectedSlot({
                        start_time: slot.start_time,
                        end_time: slot.end_time,
                      })
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                        : "border-line bg-white hover:-translate-y-0.5 hover:shadow-sm"
                    } ${
                      !isAvailable
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {slot.start_time} – {slot.end_time}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {slot.remaining_capacity} slot tersisa
                        </p>
                      </div>

                      <Badge
                        tone={
                          isAvailable
                            ? "success"
                            : "warning"
                        }
                      >
                        {isAvailable
                          ? "Tersedia"
                          : slot.status}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
      </Card>

      {/* Booking confirmation */}
      {selectedSlot && (
        <Card className="border-orange-200 bg-orange-50/50 p-6">
          <div className="flex gap-4">
            <div className="rounded-xl bg-white p-3 text-orange-600 shadow-sm">
              <CheckCircle2 size={21} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
                Konfirmasi booking
              </p>

              <h2 className="mt-2 font-display text-xl font-bold">
                Pastikan jadwal kamu sudah benar
              </h2>

              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <p>
                  <strong>Cabang:</strong>{" "}
                  {branchData.branch_name}
                </p>

                <p>
                  <strong>Tanggal:</strong>{" "}
                  {date}
                </p>

                <p>
                  <strong>Waktu:</strong>{" "}
                  {selectedSlot.start_time} –{" "}
                  {selectedSlot.end_time}
                </p>
              </div>

              {booking.isError && (
                <div className="mt-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
                  Booking gagal. Slot mungkin sudah penuh
                  atau tidak lagi tersedia. Silakan pilih
                  slot lain.
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  disabled={booking.isPending}
                  onClick={() =>
                    booking.mutate(selectedSlot)
                  }
                >
                  {booking.isPending
                    ? "Memproses..."
                    : "Konfirmasi booking"}
                </Button>

                <Button
                  variant="secondary"
                  disabled={booking.isPending}
                  onClick={() =>
                    setSelectedSlot(null)
                  }
                >
                  Pilih slot lain
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="rounded-xl bg-paper p-4 text-sm leading-6 text-slate-600">
        <strong>Catatan:</strong> aturan keterlambatan
        mengikuti keputusan backend. Frontend tidak
        menghitung grace period sendiri. Jika backend
        mengizinkan check-in setelah waktu booking,
        pengguna tetap mengikuti proses check-in tanpa
        membuat booking baru.
      </div>
    </div>
  );
}