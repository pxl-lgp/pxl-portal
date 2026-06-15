"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FileText,
  PauseCircle,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApprovals, getAutomationLogs, getClients, getContentItems } from "@/lib/api";

export default function DashboardPage() {
  const clientsQuery = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const logsQuery = useQuery({ queryKey: ["automation", "logs"], queryFn: getAutomationLogs });
  const contentQuery = useQuery({ queryKey: ["content"], queryFn: () => getContentItems() });
  const approvalsQuery = useQuery({ queryKey: ["approvals"], queryFn: getApprovals });
  const clients = clientsQuery.data ?? [];
  const logs = logsQuery.data ?? [];
  const contentItems = contentQuery.data ?? [];
  const approvals = approvalsQuery.data ?? [];
  const active = clients.filter((client) => client.status === "ACTIVE").length;
  const onboarding = clients.filter((client) => client.status === "ONBOARDING").length;
  const paused = clients.filter((client) => client.status === "PAUSED").length;
  const inProduction = contentItems.filter((item) =>
    ["DRAFTING", "DESIGNING", "INTERNAL_REVIEW", "CLIENT_APPROVAL", "REVISION_REQUESTED"].includes(
      item.status,
    ),
  ).length;
  const pendingApprovals = approvals.filter((approval) => approval.status === "PENDING").length;

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Client onboarding, production, and account health.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/approvals">
            <CheckSquare />
            Review approvals
          </Link>
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Active" value={active} icon={<CheckCircle2 />} />
        <Metric label="Onboarding" value={onboarding} icon={<Clock3 />} />
        <Metric label="Paused" value={paused} icon={<PauseCircle />} />
        <Metric label="In production" value={inProduction} icon={<FileText />} />
        <Metric label="Pending approvals" value={pendingApprovals} icon={<CheckSquare />} />
      </section>

      <Card>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Operations workflow</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create clients, manage production, collect approvals, and publish from one workspace.
            </p>
          </div>
          <Badge className="bg-emerald-500/15 text-emerald-400">Ready</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Automation logs
          </CardTitle>
          <CardDescription>Latest workflow activity across the portal.</CardDescription>
        </CardHeader>
        {logs.length === 0 ? (
          <CardContent className="text-sm text-muted-foreground">No automation events yet.</CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.slice(0, 8).map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.eventName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={automationStatusClass(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.entityType}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(log.updatedAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
        </div>
        <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-5">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

function automationStatusClass(status: string) {
  if (status === "SUCCEEDED") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "FAILED") {
    return "border-red-500/30 bg-red-500/10 text-red-400";
  }

  if (status === "SENT") {
    return "border-sky-500/30 bg-sky-500/10 text-sky-400";
  }

  return "border-amber-500/30 bg-amber-500/10 text-amber-400";
}
