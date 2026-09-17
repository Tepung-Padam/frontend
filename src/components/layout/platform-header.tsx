import { useQuery } from "@tanstack/react-query";
import { Database, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { codeLabel, roleLabel } from "@/lib/format";
import type { AppUser } from "@/types/domain";

export function PlatformHeader({ user }: { user: AppUser | null }) {
  const model = useQuery({
    queryKey: ["platform-model"],
    queryFn: api.activeModel,
    enabled: Boolean(user && ["ADMIN", "ANALYST", "RM"].includes(user.role)),
    staleTime: 5 * 60 * 1000,
  });
  const dataset = model.data?.training_dataset_version ?? "Dataset sintetis terhubung";
  return (
    <div className="border-b border-line bg-[#172a30] text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 lg:px-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-orange-400 bg-orange-500 text-xs font-black text-white">ALT</span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold">Altavest</p>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-right">
          <div className="hidden sm:block"><p className="text-xs font-semibold">{user ? roleLabel(user.role) : "Workspace"}</p><p className="text-[10px] text-slate-300">{user?.username ?? ""}</p></div>
          <ShieldCheck size={17} className="text-teal-300" aria-label="Sesi terverifikasi" />
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#1d383d]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2 px-5 py-2 text-[11px] lg:px-10">
          <span className="font-semibold text-teal-100">{user ? `${roleLabel(user.role)} workspace` : "Workspace"}</span>
          <span className="inline-flex items-center gap-1.5 text-slate-200"><Database size={13} />{codeLabel(dataset)}</span>
        </div>
      </div>
    </div>
  );
}
