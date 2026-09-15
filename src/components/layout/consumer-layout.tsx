import { NavLink, Outlet } from "react-router-dom";
import { Bell, Home, LogOut, UserRound, WalletCards } from "lucide-react";
import { useSession } from "@/features/auth/use-session";
import { roleLabel } from "@/lib/format";

const links = [{ to: "/app", label: "Home", icon: Home }, { to: "/app/activity", label: "Aktivitas", icon: WalletCards }, { to: "/app/inbox", label: "Inbox", icon: Bell }, { to: "/app/profile", label: "Profil", icon: UserRound }];

export function ConsumerLayout() {
  const { user, logout } = useSession();
  return <div className="min-h-screen bg-paper text-ink"><header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="font-display text-lg font-bold tracking-tight">Nusa<span className="text-orange-500">.relate</span></p><p className="text-xs text-slate-500">Prototype workspace</p></div><div className="flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-sm font-bold">{user?.username}</span><span className="block text-xs text-slate-500">{user ? roleLabel(user.role) : ""}</span></span><button aria-label="Keluar" className="rounded-xl p-2 text-slate-500 hover:bg-white" onClick={() => void logout()}><LogOut size={18} /></button></div></header><main className="mx-auto max-w-6xl px-5 pb-28 lg:px-8 lg:pb-10"><Outlet /></main><nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-white/95 px-4 pb-3 pt-2 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-md justify-around">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === "/app"} className={({ isActive }) => `flex min-h-11 flex-col items-center justify-center gap-1 px-3 text-[11px] font-bold ${isActive ? "text-orange-600" : "text-slate-400"}`}><Icon size={19} /><span>{label}</span></NavLink>)}</div></nav></div>;
}
