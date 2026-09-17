import { Building2, ChevronRight, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useSession } from "@/features/auth/use-session";
import { roleLabel } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProfilePage() {
  const { user } = useSession();
  const isCorporate = user?.role === "CORPORATE";

  if (user?.role === "CONSUMER") return <div className="space-y-5"><div className="text-center"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#00588b] text-white shadow-lg"><UserRound size={36} /></div><h1 className="mt-3 text-2xl font-bold">{consumerName(user.username)}</h1><p className="mt-1 text-sm text-[#667080]">Nasabah terverifikasi</p><span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#d9f7ea] px-3 py-1 text-xs font-bold text-[#087c5b]"><ShieldCheck size={14} />KYC terverifikasi</span></div><Card className="overflow-hidden border-0 bg-white shadow-[0_6px_18px_rgba(27,44,73,0.1)]"><ProfileRow label="Username" value={user.username} /><ProfileRow label="Jenis akses" value={roleLabel(user.role)} /><ProfileRow label="Customer binding" value={shortId(user.customer_id)} last /></Card><div className="space-y-3"><MobileInfo icon={<ShieldCheck size={19} />} title="Keamanan akun" detail="Sesi Consumer dilindungi token akses backend." /><MobileInfo icon={<KeyRound size={19} />} title="Data dan privasi" detail="Informasi yang tampil dibatasi pada data milik akun ini." /></div></div>;

  if (!isCorporate) return <div className="space-y-6 pt-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Profil</p><h1 className="mt-2 font-display text-3xl font-bold">Akses demo</h1></div><Card className="max-w-xl p-6"><Badge tone="warning">Synthetic identity</Badge><ProfileData user={user} /></Card></div>;

  return <div className="space-y-5">
    <div><p className="text-xs font-semibold text-[#7c8da3]">Dashboard / Profil</p><h1 className="mt-2 text-2xl font-bold text-[#173b68]">Profil perusahaan</h1><p className="mt-1 text-sm text-[#6e7f94]">Informasi akses dan hubungan perusahaan yang terdaftar.</p></div>
    <section className="grid gap-5 lg:grid-cols-[1fr_0.72fr]">
      <Card className="border-[#dfe7f2] p-6 shadow-[0_4px_18px_rgba(19,48,91,0.05)]"><div className="flex items-center gap-4"><div className="grid h-14 w-14 place-items-center rounded-xl bg-[#eaf1f8] text-[#173b68]"><Building2 size={24} /></div><div><Badge tone="warning">Corporate client</Badge><h2 className="mt-2 text-lg font-bold text-[#173b68]">PT Rekaguna Integra Perkasa</h2><p className="text-xs text-[#7c8da3]">Manufaktur Presisi & Alat Berat</p></div></div><ProfileData user={user} /></Card>
      <div className="space-y-4"><InfoPanel icon={<ShieldCheck size={18} />} title="Akses terverifikasi" detail="Sesi ini menggunakan role dan customer binding dari backend." /><InfoPanel icon={<KeyRound size={18} />} title="Keamanan akun" detail="Keluar dari sesi setelah selesai menggunakan perangkat bersama." /><InfoPanel icon={<UserRound size={18} />} title="Relationship manager" detail="Hubungi RM melalui kanal resmi untuk perubahan data perusahaan." /></div>
    </section>
  </div>;
}

function ProfileData({ user }: { user: ReturnType<typeof useSession>["user"] }) { return <dl className="mt-6 grid gap-4 sm:grid-cols-2"><ProfileItem label="Username" value={user?.username ?? "-"} /><ProfileItem label="Role" value={user ? roleLabel(user.role) : "-"} /><div className="sm:col-span-2"><ProfileItem label="Customer binding" value={user?.customer_id ?? "Internal scope"} /></div></dl>; }
function ProfileItem({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-[#f5f8fc] p-4"><dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a99ac]">{label}</dt><dd className="mt-1 break-all text-sm font-bold text-[#173b68]">{value}</dd></div>; }
function InfoPanel({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <Card className="border-[#dfe7f2] p-5"><div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#fff1e9] text-[#f26522]">{icon}</span><div><h3 className="text-sm font-bold text-[#173b68]">{title}</h3><p className="mt-1 text-xs leading-5 text-[#6e7f94]">{detail}</p></div></div></Card>; }
function ProfileRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) { return <div className={`flex items-center justify-between gap-3 px-5 py-4 ${last ? "" : "border-b border-[#edf0f5]"}`}><div><p className="text-xs text-[#7a8494]">{label}</p><p className="mt-1 max-w-[250px] truncate text-sm font-bold text-[#17253b]">{value}</p></div><ChevronRight size={18} className="text-[#a1a9b5]" /></div>; }
function MobileInfo({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) { return <div className="flex gap-3 rounded-2xl bg-[#e9edff] p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#075888]">{icon}</span><div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-[#626a78]">{detail}</p></div></div>; }
function consumerName(value: string) { return value.replace(/^(consumer|eco|comp|bd1)[_-]?/i, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Nasabah"; }
function shortId(value: string | null) { return value ? `${value.slice(0, 8)}...${value.slice(-4)}` : "Tidak tersedia"; }
