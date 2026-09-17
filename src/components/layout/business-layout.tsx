import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Bell, Building2, FileClock, LayoutDashboard, LogOut, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import { api } from "@/lib/api-client";
import { useSession } from "@/features/auth/use-session";
import { roleLabel } from "@/lib/format";

const navColors = {
  active: "bg-business-accent text-white shadow-[0_5px_16px_rgba(242,101,34,0.24)]",
  idle: "text-business-muted hover:bg-business-surface hover:text-business-navy",
};

export function BusinessLayout() {
  const { user, logout } = useSession();
  const isCorporate = user?.role === "CORPORATE";
  const businessName = user?.username ?? "Business user";
  const prefix = isCorporate ? "/corporate" : "/business";
  const links = [
    { to: prefix, label: "Dashboard", icon: LayoutDashboard },
    ...(isCorporate
      ? [
          { to: `${prefix}/advisory`, label: "AI Advisory", icon: FileClock },
          { to: `${prefix}/notifications`, label: "Notifikasi", icon: Bell },
          { to: `${prefix}/invoices`, label: "Tagihan & Invoice", icon: ReceiptText },
        ]
      : [{ to: `${prefix}/financing`, label: "Financing", icon: FileClock }]),
    { to: `${prefix}/profile`, label: "Profil", icon: UserRound },
  ];

  // Unread count is real: it counts messages whose response_state the backend has not set yet.
  // Fetched unconditionally (React Hooks must run in the same order every render) but only
  // meaningful/shown for the corporate branch, which is the only one with a notifications page.
  const messages = useQuery({ queryKey: ["corporate-messages"], queryFn: () => api.messages(), enabled: isCorporate });
  const unread = messages.data?.items.filter((message) => message.response_state === null).length ?? 0;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${isActive ? navColors.active : navColors.idle}`;
  const initials = businessName.slice(0, 2).toUpperCase();
  const eyebrow = isCorporate ? "Corporate banking" : "Merchant banking";

  return (
    <div className="min-h-screen bg-business-surface text-business-ink lg:grid lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-business-border bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="flex h-[72px] items-center border-b border-business-borderLight px-[18px]">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-business-navy text-sm font-extrabold text-white">AV</div>
            <div>
              <p className="font-display text-lg font-bold leading-none">
                Alta<span className="text-business-accent">vest</span>
              </p>
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.2em] text-business-faint">{eyebrow}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 px-3 py-5" aria-label="Navigasi bisnis">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === prefix} className={linkClass}>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-xl bg-business-surfaceAlt p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-business-navy">
            <ShieldCheck size={15} className="text-business-success" />
            Sesi aman
          </div>
          <p className="mt-1 text-[10px] leading-4 text-business-faint">Akses bisnis terverifikasi</p>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-business-border bg-white/95 backdrop-blur">
          <div className="flex h-[72px] items-center px-4 sm:px-7">
            <div className="flex items-center gap-2 lg:hidden">
              <Building2 size={19} className="text-business-navy" />
              <span className="font-display font-bold">
                Alta<span className="text-business-accent">vest</span>
              </span>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {isCorporate && (
                <Link
                  to="/corporate/notifications"
                  aria-label={unread > 0 ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
                  className="relative grid h-10 w-10 place-items-center rounded-xl bg-business-surface text-business-muted hover:bg-business-border"
                >
                  <Bell size={18} />
                  {unread > 0 && (
                    <span className="absolute right-0.5 top-0 grid min-h-[17px] min-w-[17px] place-items-center rounded-full bg-business-danger px-1 text-[9px] font-bold leading-none text-white">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              )}
              <div className="hidden h-8 w-px bg-business-border sm:block" />
              <div className="hidden min-w-[170px] text-right sm:block">
                <p className="text-[13px] font-bold leading-tight text-business-navy">{businessName}</p>
                <p className="mt-0.5 text-[10px] leading-tight text-business-faint">{roleLabel(user?.role ?? "MERCHANT")}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full border border-business-border bg-business-surface text-xs font-bold text-business-navy">
                {initials}
              </div>
              <button
                aria-label="Keluar"
                className="grid h-10 w-10 place-items-center rounded-lg text-business-faint hover:bg-orange-50 hover:text-business-accent"
                onClick={() => void logout()}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-business-border bg-white px-3 py-2 lg:hidden" aria-label="Navigasi bisnis mobile">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === prefix} className={linkClass}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-[1180px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
