import { AuthGate } from "@/components/portal/auth-gate";
import { PortalShell } from "@/components/portal/portal-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate allowedRoles={["SUPER_ADMIN", "ADMIN", "TEAM"]}>
      <PortalShell mode="admin">{children}</PortalShell>
    </AuthGate>
  );
}
