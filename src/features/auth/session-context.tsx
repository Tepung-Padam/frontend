import { useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api-client";
import { SessionContext } from "@/features/auth/session-store";
import type { AppUser } from "@/types/domain";
const storedUser = window.localStorage.getItem("retention.user");

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => storedUser ? JSON.parse(storedUser) as AppUser : null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!storedUser || !window.localStorage.getItem("retention.access_token")) return;
    setIsLoading(true);
    void api.me().then((currentUser) => {
      window.localStorage.setItem("retention.user", JSON.stringify(currentUser));
      setUser(currentUser);
    }).catch(() => {
      window.localStorage.removeItem("retention.access_token");
      window.localStorage.removeItem("retention.user");
      setUser(null);
    }).finally(() => setIsLoading(false));
  }, []);

  async function login(username: string, password: string) {
    setIsLoading(true);
    try {
      const result = await api.login(username, password);
      window.localStorage.setItem("retention.access_token", result.access_token);
      window.localStorage.setItem("retention.user", JSON.stringify(result.user));
      setUser(result.user);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try { await api.logout(); } finally {
      window.localStorage.removeItem("retention.access_token");
      window.localStorage.removeItem("retention.user");
      setUser(null);
    }
  }

  return <SessionContext.Provider value={{ user, isLoading, login, logout }}>{children}</SessionContext.Provider>;
}

