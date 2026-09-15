import type { UserRole } from "@/types/domain";

export const roleHome: Record<UserRole, string> = {
  CONSUMER: "/app",
  MERCHANT: "/business",
  CORPORATE: "/corporate",
  ANALYST: "/staff",
  RM: "/rm",
  ADMIN: "/admin",
};

export function canAccess(role: UserRole, roles: UserRole[]): boolean {
  return roles.includes(role);
}
