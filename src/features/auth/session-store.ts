import { createContext } from "react";
import type { AppUser } from "@/types/domain";

export interface SessionContextValue {
  user: AppUser | null;
  isLoading: boolean;
  // FIX: login sekarang return AppUser agar login-page tidak perlu
  // re-parse localStorage untuk mendapatkan role setelah login.
  login: (username: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);