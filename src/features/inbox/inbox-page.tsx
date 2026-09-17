import { ChevronRight, Mail, MailOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/lib/format";

export function InboxPage() {
  const query = useQuery({ queryKey: ["messages"], queryFn: () => api.messages() });
  if (query.isLoading) return <LoadingState />;
  if (query.isError || !query.data) return <ErrorState message="Inbox belum dapat dimuat." onRetry={() => void query.refetch()} />;
  return <div className="space-y-7"><header><p className="text-xs font-semibold uppercase tracking-wider text-orange-600">Inbox</p><h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Pesan untuk Anda</h1><p className="mt-2 text-sm text-slate-500">Informasi layanan dan penawaran yang dikirim melalui bank.</p></header>{query.data.items.length === 0 ? <EmptyState title="Inbox masih kosong" detail="Pesan baru akan tersimpan dan dapat dibuka kembali dari halaman ini." /> : <div className="divide-y divide-line border-y border-line">{query.data.items.map((message) => { const unread = message.response_state === null; return <Link key={message.id} to={`/app/inbox/${message.id}`} className="group flex gap-3 py-5"><span className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full ${unread ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"}`}>{unread ? <Mail size={18} /> : <MailOpen size={18} />}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>{message.title}</h2>{message.response_state && <Badge tone={message.response_state === "ACCEPTED" ? "success" : message.response_state === "DECLINED" ? "neutral" : "info"}>{message.response_state}</Badge>}</div><p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{message.body}</p><p className="mt-2 text-xs text-slate-400">{formatDate(message.created_at)}</p></div><ChevronRight className="mt-3 shrink-0 text-slate-300 transition group-hover:translate-x-0.5" size={18} /></Link>; })}</div>}</div>;
}
