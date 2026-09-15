import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/feedback/loading-state";
import { ErrorState } from "@/components/feedback/error-state";
import { EmptyState } from "@/components/feedback/empty-state";

export function InboxPage() { const query = useQuery({ queryKey: ["messages"], queryFn: () => api.messages() }); if (query.isLoading) return <LoadingState />; if (query.isError) return <ErrorState message="Inbox belum dapat dimuat." onRetry={() => void query.refetch()} />; if (!query.data) return <ErrorState message="Data inbox kosong." onRetry={() => void query.refetch()} />; return <div className="space-y-6 pt-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Inbox</p><h1 className="mt-2 font-display text-3xl font-bold">Pesan untuk Anda</h1></div>{query.data.items.length === 0 ? <EmptyState title="Belum ada pesan" detail="Pesan simulasi akan muncul setelah staff mengirimkannya melalui backend." /> : <div className="grid gap-4">{query.data.items.map((message) => <Link key={message.id} to={`/app/inbox/${message.id}`}><Card className="p-5 transition hover:-translate-y-0.5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-bold">{message.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{message.body}</p></div><Badge tone="warning">{message.response_state ?? "NEW"}</Badge></div><p className="mt-4 text-xs text-slate-500">{message.is_simulation ? "Simulated message" : "Message"}</p></Card></Link>)}</div>}</div>; }
