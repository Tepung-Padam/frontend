import { Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CapabilityGap({ title, detail }: { title: string; detail: string }) {
  return <Card className="border-dashed bg-[#fffdf9] p-8"><div className="flex max-w-xl items-start gap-4"><div className="rounded-xl bg-orange-50 p-3 text-orange-600"><Wrench size={22} /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Belum tersedia di prototype</p><h2 className="mt-2 text-xl font-bold text-ink">{title}</h2><p className="mt-2 leading-7 text-slate-600">{detail}</p></div></div></Card>;
}
