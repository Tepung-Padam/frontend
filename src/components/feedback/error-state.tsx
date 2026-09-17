import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="border-l-2 border-red-500 bg-red-50/60 p-5" role="alert"><div className="flex items-start gap-3 text-red-700"><AlertCircle size={20} /><div><p className="font-semibold">Data belum dapat dimuat</p><p className="mt-1 text-sm text-slate-600">{message}</p>{onRetry && <Button className="mt-4" variant="secondary" onClick={onRetry}>Coba lagi</Button>}</div></div></div>;
}
