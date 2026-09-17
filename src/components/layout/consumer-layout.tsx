import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Bell, CircleUserRound, Home, LogOut, QrCode, ReceiptText, WalletCards } from "lucide-react";
import { useSession } from "@/features/auth/use-session";

const links = [
  { to: "/app", label: "Beranda", icon: Home },
  { to: "/app/activity", label: "Transaksi", icon: ReceiptText },
  { to: "/app/bookings", label: "Kantong", icon: WalletCards },
  { to: "/app/profile", label: "Profil", icon: CircleUserRound },
];

export function ConsumerLayout() {
  const { user, logout } = useSession();
  const location = useLocation();
  const isHome = location.pathname === "/app";
  return <div className="min-h-screen bg-[#edf0f7] text-[#111d33]">
    <div className="relative mx-auto min-h-screen w-full max-w-[460px] bg-[#f8f7ff] shadow-[0_0_40px_rgba(18,36,62,0.12)]">
      {!isHome && <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e8eaf2] bg-[#f8f7ff]/95 px-5 backdrop-blur"><NavLink to="/app" className="font-display text-lg font-bold text-[#005a73]">Alta<span className="text-[#ff6b1a]">vest</span></NavLink><div className="flex items-center gap-1"><NavLink to="/app/inbox" aria-label="Notifikasi" className="relative grid h-10 w-10 place-items-center rounded-full text-[#445064]"><Bell size={20} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff6b1a]" /></NavLink><button aria-label={`Keluar dari akun ${user?.username ?? ""}`} className="grid h-10 w-10 place-items-center rounded-full text-[#566176]" onClick={() => void logout()}><LogOut size={18} /></button></div></header>}
      <main className="px-4 pb-28 pt-4 sm:px-6"><Outlet /></main>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[460px] border-t border-[#e2e6ef] bg-white/95 px-3 pt-2 shadow-[0_-8px_30px_rgba(26,43,71,0.08)] backdrop-blur" aria-label="Navigasi Consumer">
        <div className="grid grid-cols-5 items-end"><BottomLink {...links[0]} /><BottomLink {...links[1]} /><NavLink to="/app/offers" aria-label="Buka QRIS dan penawaran" className="relative -top-5 mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#ff6b1a] text-white shadow-[0_8px_22px_rgba(255,107,26,0.35)]"><div className="text-center"><QrCode className="mx-auto" size={26} /><span className="mt-0.5 block text-[10px] font-bold">QRIS</span></div></NavLink><BottomLink {...links[2]} /><BottomLink {...links[3]} /></div>
      </nav>
    </div>
  </div>;
}

function BottomLink({ to, label, icon: Icon }: { to: string; label: string; icon: typeof Home }) { return <NavLink to={to} end={to === "/app"} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-bold ${isActive ? "text-[#005a86]" : "text-[#4f5867]"}`}><Icon size={22} strokeWidth={2.3} /><span>{label}</span></NavLink>; }
