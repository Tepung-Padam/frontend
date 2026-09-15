import { Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({ title, detail }: { title: string; detail: string }) { return <Card className="p-8 text-center"><Inbox className="mx-auto text-slate-400" size={26} /><h2 className="mt-3 font-bold text-ink">{title}</h2><p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{detail}</p></Card>; }
