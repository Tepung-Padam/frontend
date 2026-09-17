import { NavLink, Outlet } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, Database, FileClock, LogOut, ShieldCheck, UsersRound } from "lucide-react";
import { useSession } from "@/features/auth/use-session";
import { roleLabel } from "@/lib/format";
import { PlatformHeader } from "@/components/layout/platform-header";

export function WorkspaceLayout() {
  const { user, logout } = useSession();
  const prefix = user?.role === "ADMIN" ? "/admin" : user?.role === "RM" ? "/rm" : "/staff";
  const links = [
    { to: prefix, label: user?.role === "ADMIN" ? "Operasional" : "Portfolio", icon: BarChart3 },
    { to: `${prefix}/at-risk`, label: "Nasabah at-risk", icon: UsersRound },
    { to: `${prefix}/campaigns`, label: "Intervensi", icon: BriefcaseBusiness },
    { to: `${prefix}/models`, label: "Model dan data", icon: Database },
    { to: `${prefix}/applications`, label: "Alur kredit", icon: FileClock },
  ];
  return <div className="min-h-screen bg-[#f4f2ee] text-ink">
    <PlatformHeader user={user} />
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-white/10 bg-[#202d35] px-5 py-6 text-white lg:block">
      <p className="font-display text-xl font-bold">Alta<span className="text-orange-400">vest</span></p><p className="mt-1 text-xs text-slate-300">Internal decision support</p>
      <nav className="mt-12 space-y-1" aria-label="Navigasi workspace">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === prefix} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${isActive ? "bg-white/10 text-orange-300" : "text-slate-300 hover:bg-white/5"}`}><Icon size={18} />{label}</NavLink>)}</nav>
      <div className="absolute bottom-6 left-5 right-5 border-t border-white/10 pt-4"><p className="text-xs text-slate-400">Demo environment</p><button className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-200" onClick={() => void logout()}><LogOut size={16} />Keluar</button></div>
    </aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-5 py-4 backdrop-blur lg:px-10"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Ruang kerja</p><p className="mt-1 text-sm font-bold text-slate-600">{user ? roleLabel(user.role) : ""}</p></div><div className="flex items-center gap-2"><ShieldCheck size={18} className="text-teal-600" /><span className="hidden text-xs font-bold text-slate-500 sm:inline">Data sintetis</span></div></header>
      <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white px-4 py-2 lg:hidden" aria-label="Navigasi workspace mobile">{links.map(({ to, label }) => <NavLink key={to} to={to} end={to === prefix} className={({ isActive }) => `whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold ${isActive ? "bg-orange-50 text-orange-700" : "text-slate-500"}`}>{label}</NavLink>)}</nav>
      <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-10"><Outlet /></main></div>
  </div>;
}
