import { useSession } from "@/features/auth/use-session";
import { roleLabel } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProfilePage() { const { user } = useSession(); return <div className="space-y-6 pt-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Profil</p><h1 className="mt-2 font-display text-3xl font-bold">Akses demo</h1></div><Card className="max-w-xl p-6"><Badge tone="warning">Synthetic identity</Badge><dl className="mt-6 space-y-4"><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Username</dt><dd className="mt-1 font-bold">{user?.username}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</dt><dd className="mt-1 font-bold">{user ? roleLabel(user.role) : "-"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer binding</dt><dd className="mt-1 break-all text-sm text-slate-600">{user?.customer_id ?? "Internal scope"}</dd></div></dl></Card></div>; }
