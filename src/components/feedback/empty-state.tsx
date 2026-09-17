import { Inbox } from "lucide-react";
export function EmptyState({ title, detail }: { title: string; detail: string }) { return <div className="border-y border-line py-10 text-center"><Inbox className="mx-auto text-slate-300" size={24} /><h2 className="mt-3 font-semibold text-ink">{title}</h2><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{detail}</p></div>; }
