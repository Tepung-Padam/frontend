import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, Building2, FileClock, LayoutDashboard, LogOut, ReceiptText, Search, ShieldCheck, UserRound } from "lucide-react";
import { useSession } from "@/features/auth/use-session";
import { roleLabel } from "@/lib/format";
import { PlatformHeader } from "@/components/layout/platform-header";

const corporateColors = {
  active: "bg-[#f26522] text-white shadow-[0_5px_16px_rgba(242,101,34,0.24)]",
  idle: "text-[#50627a] hover:bg-[#eef4fb] hover:text-[#173b68]",
};

export function BusinessLayout() {
  const { user, logout } = useSession();
  const isCorporate = user?.role === "CORPORATE";
  const corporateName = user?.username === "corporate_demo" ? "Siti Rahmawati" : (user?.username ?? "Corporate User");
  const prefix = isCorporate ? "/corporate" : "/business";
  const links = [
    { to: prefix, label: "Dashboard", icon: LayoutDashboard },
    ...(isCorporate ? [{ to: `${prefix}/advisory`, label: "AI Advisory", icon: FileClock }, { to: `${prefix}/notifications`, label: "Notifikasi", icon: Bell }, { to: `${prefix}/invoices`, label: "Tagihan & Invoice", icon: ReceiptText }] : [{ to: `${prefix}/financing`, label: "Financing", icon: FileClock }]),
    { to: `${prefix}/profile`, label: "Profil", icon: UserRound },
  ];

  if (!isCorporate) {
    return <div className="min-h-screen bg-[#f5f7f5] text-ink"><PlatformHeader user={user} /><SimpleBusinessHeader user={user} logout={logout} /><BusinessNavigation prefix={prefix} links={links} /><div className="mx-auto max-w-7xl px-5 py-6 lg:px-8"><Outlet /></div></div>;
  }

  const linkClass = ({ isActive }: { isActive: boolean }) => `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? corporateColors.active : corporateColors.idle}`;

  return <div className="min-h-screen bg-[#f4f7fb] text-[#172b45] lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
    <aside className="hidden min-h-screen border-r border-[#e4eaf2] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="flex h-[72px] items-center border-b border-[#edf1f6] px-[18px]"><div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-lg bg-[#173b68] text-sm font-extrabold text-white">AV</div><div><p className="font-display text-lg font-bold leading-none">Alta<span className="text-[#f26522]">vest</span></p><p className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-[#71829a]">Corporate banking</p></div></div></div>
      <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label="Navigasi Corporate">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === prefix} className={linkClass}><Icon size={17} />{label}</NavLink>)}</nav>
      <div className="m-3 rounded-xl bg-[#f4f8fc] p-3"><div className="flex items-center gap-2 text-xs font-bold text-[#173b68]"><ShieldCheck size={15} className="text-[#16805c]" />Sesi aman</div><p className="mt-1 text-[10px] leading-4 text-[#7c8da3]">Akses perusahaan terverifikasi</p></div>
    </aside>
    <div className="min-w-0">
      <header className="sticky top-0 z-30 border-b border-[#dfe6ef] bg-white/95 backdrop-blur"><div className="flex h-[72px] items-center px-4 sm:px-7"><div className="flex items-center gap-2 lg:hidden"><Building2 size={19} className="text-[#173b68]" /><span className="font-display font-bold">Alta<span className="text-[#f26522]">vest</span></span></div><label className="ml-auto hidden h-10 w-[min(52vw,520px)] items-center gap-2.5 rounded-xl bg-[#f0f4fa] px-4 sm:flex lg:ml-0"><Search size={16} className="shrink-0 text-[#70839e]" /><input aria-label="Cari" placeholder="Cari..." className="w-full bg-transparent text-sm text-[#173b68] outline-none placeholder:text-[#7f91aa]" /></label><div className="ml-auto flex items-center gap-3"><Link to="/corporate/notifications" aria-label="Notifikasi" className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#f5f7fb] text-[#50627a] hover:bg-[#edf2f8]"><Bell size={18} /><span className="absolute right-0.5 top-0 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-[#d71920] px-1 text-[9px] font-bold leading-none text-white">5</span></Link><div className="hidden h-8 w-px bg-[#dfe6ef] sm:block" /><div className="hidden min-w-[170px] text-right sm:block"><p className="text-[13px] font-bold leading-tight text-[#173b68]">{corporateName}</p><p className="mt-0.5 text-[10px] leading-tight text-[#71829a]">Finance Manager · Corporate</p></div><div className="grid h-10 w-10 place-items-center rounded-full border border-[#dae4ef] bg-[#eaf1f8] text-xs font-bold text-[#173b68]">{corporateName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><button aria-label="Keluar" className="grid h-10 w-10 place-items-center rounded-lg text-[#71829a] hover:bg-[#fff1e9] hover:text-[#f26522]" onClick={() => void logout()}><LogOut size={18} /></button></div></div></header>
      <nav className="flex gap-1 overflow-x-auto border-b border-[#e4eaf2] bg-white px-3 py-2 lg:hidden" aria-label="Navigasi Corporate mobile">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === prefix} className={linkClass}><Icon size={16} />{label}</NavLink>)}</nav>
      <main className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7"><Outlet /></main>
    </div>
  </div>;
}

function SimpleBusinessHeader({ user, logout }: { user: ReturnType<typeof useSession>["user"]; logout: () => Promise<void> }) { return <header className="border-b border-line bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="font-display text-xl font-bold">Alta<span className="text-orange-500">vest</span></p><p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-600">Business workspace</p></div><div className="flex items-center gap-4"><div className="hidden text-right sm:block"><p className="text-sm font-bold">{user?.username}</p><p className="text-xs text-slate-500">{user ? roleLabel(user.role) : ""}</p></div><button aria-label="Keluar" className="rounded-xl p-2 text-slate-500 hover:bg-paper" onClick={() => void logout()}><LogOut size={18} /></button></div></div></header>; }

function BusinessNavigation({ prefix, links }: { prefix: string; links: Array<{ to: string; label: string; icon: typeof Building2 }> }) { const linkClass = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${isActive ? "bg-teal-700 text-white" : "text-slate-600 hover:bg-white"}`; return <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto border-b border-line bg-white px-4 py-2" aria-label="Navigasi bisnis">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === prefix} className={linkClass}><Icon size={17} />{label}</NavLink>)}</nav>; }
