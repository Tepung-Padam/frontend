import { useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/use-session";
import { roleHome } from "@/features/auth/route-roles";
import { ApiError } from "@/lib/api-client";

export function LoginPage() {
  const { login, isLoading } = useSession();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    try { await login(username, password); const role = window.localStorage.getItem("retention.user"); const parsed = role ? JSON.parse(role) as { role: keyof typeof roleHome } : null; navigate(parsed ? roleHome[parsed.role] : "/app"); }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : "Login belum berhasil. Periksa koneksi dan kredensial demo."); }
  }
  return <div className="grid min-h-screen place-items-center bg-[#202d35] px-5 py-10"><div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-paper shadow-2xl lg:grid-cols-[0.9fr_1.1fr]"><div className="relative hidden overflow-hidden bg-orange-500 p-10 text-white lg:block"><div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[38px] border-white/15" /><p className="text-sm font-bold uppercase tracking-[0.2em]">Relationship intelligence</p><h1 className="mt-28 max-w-sm font-display text-5xl font-bold leading-[1.05]">Baca hubungan. Pilih langkah yang relevan.</h1><p className="mt-6 max-w-sm leading-7 text-orange-50">Ruang kerja prototipe untuk insight perilaku, layanan pelanggan, dan keputusan yang tetap ditinjau manusia.</p></div><div className="p-7 sm:p-12"><div className="mb-10"><p className="font-display text-xl font-bold">Nusa<span className="text-orange-500">.relate</span></p><p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Demo access</p><h2 className="mt-3 font-display text-3xl font-bold">Masuk ke workspace</h2><p className="mt-2 text-slate-500">Gunakan kredensial synthetic yang disediakan backend.</p></div><form className="space-y-5" onSubmit={(event) => void submit(event)}><label className="block text-sm font-bold">Username<input className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label className="block text-sm font-bold">Password<input type="password" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="w-full" disabled={isLoading}>{isLoading ? "Memeriksa..." : <>Masuk <ArrowRight size={17} /></>}</Button></form><p className="mt-8 flex items-center gap-2 text-xs leading-5 text-slate-500"><LockKeyhole size={14} /> Ini bukan login produksi dan tidak terhubung ke infrastruktur BNI.</p></div></div></div>;
}
