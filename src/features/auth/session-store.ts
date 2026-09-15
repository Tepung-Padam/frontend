import { createContext } from "react";
import type { AppUser } from "@/types/domain";

export interface SessionContextValue {
  user: AppUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);