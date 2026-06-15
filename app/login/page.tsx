import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Client Login — PXL Digital Marketing",
  description:
    "Sign in to your PXL client portal to view live campaign dashboards, reports, content calendars, and results.",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
