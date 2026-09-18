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
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(null); try { const user = await login(username, password); navigate(roleHome[user.role]); } catch (cause) { setError(cause instanceof ApiError ? cause.message : "Login belum berhasil. Periksa koneksi dan kredensial demo."); } }
  return <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(320px,0.8fr)_1.2fr]">
    <aside className="hidden bg-[#17343b] px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between"><p className="font-display text-xl font-bold">Alta<span className="text-orange-400">vest</span></p><div><p className="text-xs font-semibold uppercase tracking-wider text-orange-300">Banking relationship platform</p><h1 className="mt-4 max-w-md font-display text-3xl font-bold leading-tight">Satu akses untuk layanan nasabah dan keputusan operasional.</h1><p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Altavest memadukan Alta (tinggi) dengan Vest atau investment: standar layanan tinggi untuk relasi dan investasi yang lebih terarah.</p></div><p className="text-xs text-slate-400">Demo environment</p></aside>
    <main className="grid min-h-screen place-items-center px-5 py-10"><div className="w-full max-w-md"><div className="mb-10"><p className="font-display text-xl font-bold lg:hidden">Alta<span className="text-orange-500">vest</span></p><p className="mt-10 text-xs font-semibold uppercase tracking-wider text-orange-600 lg:mt-0">Akses akun</p><h2 className="mt-3 font-display text-3xl font-bold">Masuk ke workspace</h2><p className="mt-2 text-sm text-slate-500">Gunakan kredensial yang disediakan untuk akun demo Anda.</p></div>
      <form className="space-y-5" onSubmit={(event) => void submit(event)}><label className="block text-sm font-semibold">Username<input className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" value={username} onChange={(event) => setUsername(event.target.value)} required autoComplete="username" /></label><label className="block text-sm font-semibold">Password<input type="password" className="mt-2 min-h-12 w-full rounded-xl border border-line bg-white px-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>{error && <p role="alert" className="border-l-2 border-red-500 bg-red-50 p-3 text-sm text-red-700">{error}</p>}<Button className="w-full" disabled={isLoading}>{isLoading ? "Memeriksa..." : <>Masuk <ArrowRight size={17} /></>}</Button></form><p className="mt-8 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole className="mt-0.5 shrink-0" size={14} /> Lingkungan demonstrasi; tidak terhubung ke infrastruktur produksi BNI.</p>
    </div></main>
  </div>;
}
