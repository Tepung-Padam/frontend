import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api-client";
import { SessionContext } from "@/features/auth/session-store";
import type { AppUser } from "@/types/domain";

export function SessionProvider({ children }: { children: ReactNode }) {
  // FIX: storedUser dibaca di dalam component (bukan module scope),
  // sehingga setiap mount membaca localStorage yang paling mutakhir.
  const [user, setUser] = useState<AppUser | null>(() => {
    const raw = window.localStorage.getItem("retention.user");
    try {
      return raw ? (JSON.parse(raw) as AppUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = window.localStorage.getItem("retention.access_token");
    const raw = window.localStorage.getItem("retention.user");
    if (!token || !raw) return;

    setIsLoading(true);
    void api
      .me()
      .then((currentUser) => {
        window.localStorage.setItem("retention.user", JSON.stringify(currentUser));
        setUser(currentUser);
      })
      .catch(() => {
        window.localStorage.removeItem("retention.access_token");
        window.localStorage.removeItem("retention.user");
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const clearSession = () => setUser(null);
    window.addEventListener("retention:unauthorized", clearSession);
    return () => window.removeEventListener("retention:unauthorized", clearSession);
  }, []);

  async function login(username: string, password: string) {
    setIsLoading(true);
    try {
      const result = await api.login(username, password);
      window.localStorage.setItem("retention.access_token", result.access_token);
      window.localStorage.setItem("retention.user", JSON.stringify(result.user));
      setUser(result.user);
      return result.user;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
    } finally {
      window.localStorage.removeItem("retention.access_token");
      window.localStorage.removeItem("retention.user");
      setUser(null);
    }
  }

  return (
    <SessionContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
