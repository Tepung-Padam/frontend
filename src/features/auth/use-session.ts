import { useContext } from "react";
import { SessionContext } from "@/features/auth/session-store";

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession must be used within SessionProvider");
  return value;
}