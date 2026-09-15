import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <Card className="p-6"><div className="flex items-start gap-3 text-red-700"><AlertCircle size={20} /><div><p className="font-bold">Data belum dapat dimuat</p><p className="mt-1 text-sm text-slate-600">{message}</p>{onRetry && <Button className="mt-4" variant="secondary" onClick={onRetry}>Coba lagi</Button>}</div></div></Card>;
}
