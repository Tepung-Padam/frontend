import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";

export function BookingDetailPage() { const { code = "" } = useParams(); const query = useQuery({ queryKey: ["booking", code], queryFn: () => api.booking(code), enabled: Boolean(code) }); if (query.isLoading) return <LoadingState />; if (query.isError || !query.data) return <ErrorState message="Booking tidak ditemukan atau tidak dapat diakses." onRetry={() => void query.refetch()} />; const booking = query.data; return <div className="max-w-2xl space-y-6 pt-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Booking detail</p><h1 className="mt-2 font-display text-3xl font-bold">{booking.branch_name ?? booking.branch_id}</h1></div><Card className="space-y-4 p-6"><div className="flex justify-between gap-4"><span>Status</span><Badge tone="success">{booking.status}</Badge></div><div className="flex justify-between gap-4"><span>Reference</span><strong>{booking.booking_code}</strong></div><div className="flex justify-between gap-4"><span>Jadwal</span><strong>{booking.appointment_date} · {booking.start_time} - {booking.end_time}</strong></div><p className="rounded-xl bg-paper p-4 text-sm leading-6 text-slate-600">Check-in window berasal dari backend. Bila backend mengembalikan booking tetap eligible setelah terlambat, Anda tetap dilayani dan tidak perlu mengambil antrean baru.</p></Card></div>; }
