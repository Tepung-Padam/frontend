import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/features/auth/use-session";
import { canAccess, roleHome } from "@/features/auth/route-roles";
import type { UserRole } from "@/types/domain";

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { user } = useSession(); const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !canAccess(user.role, roles)) return <Navigate to={roleHome[user.role]} replace />;
  return <Outlet />;
}
