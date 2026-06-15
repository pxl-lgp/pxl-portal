import { AuthGate } from "@/components/portal/auth-gate";
import { PortalShell } from "@/components/portal/portal-shell";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate allowedRoles={["CLIENT"]}>
      <PortalShell mode="client">{children}</PortalShell>
    </AuthGate>
  );
}
