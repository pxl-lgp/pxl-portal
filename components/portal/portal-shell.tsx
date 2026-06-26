"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Archive,
  Activity,
  BarChart3,
  Building2,
  CalendarDays,
  CheckSquare,
  Cog,
  ClipboardList,
  FileCheck2,
  FileText,
  FolderOpen,
  HeartPulse,
  LayoutDashboard,
  LayoutTemplate,
  LineChart,
  LogOut,
  Megaphone,
  ScrollText,
  UserCog,
  UserPlus,
  Bell,
  ChevronDown,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PxlLogo } from "@/components/site/pxl-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/api";
import { clearAccessToken } from "@/lib/auth";
import { UserRole } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  // When set, the entry is only shown to these roles. Otherwise visible to the whole area.
  roles?: UserRole[];
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const adminGroups: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { href: "/admin/super-admin", label: "Super Admin", icon: SlidersHorizontal, roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    label: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/search", label: "Search", icon: Search },
      { href: "/admin/client-health", label: "Health", icon: HeartPulse },
    ],
  },
  {
    label: "Client Work",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Building2 },
      { href: "/admin/leads", label: "Leads", icon: UserPlus },
      { href: "/admin/workspace", label: "Workspace", icon: FolderOpen },
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/admin/content", label: "Content", icon: FileText },
      { href: "/admin/content-templates", label: "Templates", icon: LayoutTemplate },
      { href: "/admin/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/admin/approvals", label: "Approvals", icon: CheckSquare },
      { href: "/admin/assets", label: "Assets", icon: Archive },
    ],
  },
  {
    label: "Performance",
    items: [
      { href: "/admin/analytics", label: "Analytics", icon: LineChart },
      { href: "/admin/reports", label: "Reports", icon: ScrollText },
      { href: "/admin/automation", label: "Automation", icon: Cog },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/users", label: "Users", icon: UserCog, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/permissions", label: "Permissions", icon: ShieldCheck, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/audit-log", label: "Audit Log", icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/import-export", label: "Import/Export", icon: Upload, roles: ["SUPER_ADMIN", "ADMIN"] },
      { href: "/admin/observability", label: "Observability", icon: Activity, roles: ["SUPER_ADMIN", "ADMIN"] },
    ],
  },
];

const clientGroups: NavGroup[] = [
  {
    label: "Your Account",
    items: [
      { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/client/files", label: "Files", icon: FolderOpen },
    ],
  },
  {
    label: "Reviews",
    items: [
      { href: "/client/dashboard#approvals", label: "Approvals", icon: FileCheck2 },
      { href: "/client/dashboard#assets", label: "Assets", icon: Archive },
      { href: "/client/dashboard#reports", label: "Reports", icon: ScrollText },
    ],
  },
];

export function PortalShell({
  children,
  mode,
}: {
  children: React.ReactNode;
  mode: "admin" | "client";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getCurrentUser,
  });
  const user = userQuery.data;
  const groups = (mode === "admin" ? adminGroups : clientGroups)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.roles || (user ? item.roles.includes(user.role) : false)),
    }))
    .filter((group) => group.items.length > 0);
  const items = groups.flatMap((group) => group.items);
  // Match exact path or a nested route, so "/admin/content" doesn't claim "/admin/content-templates".
  const matchesPath = (href: string) =>
    !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));
  const currentItem = items.find((item) => matchesPath(item.href)) ?? items[0];
  const initials = (user?.name ?? "PXL User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function logout() {
    clearAccessToken();
    router.replace("/login");
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((current) => ({ ...current, [label]: !current[label] }));
  }

  return (
    <SidebarProvider
      className="portal-theme"
      style={
        {
          "--sidebar-width": "17rem",
          "--header-height": "3.75rem",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader className="border-b border-sidebar-border p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-10 px-2" size="lg">
                <Link href={mode === "admin" ? "/admin/dashboard" : "/client/dashboard"}>
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                    <BarChart3 className="size-4 text-primary" />
                  </span>
                  <span className="min-w-0">
                    <PxlLogo className="h-5 max-w-24" />
                    <span className="block truncate text-[10px] text-muted-foreground">
                      {mode === "admin" ? "Operations portal" : "Client workspace"}
                    </span>
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => {
            const isCollapsed = collapsedGroups[group.label] ?? false;

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel asChild>
                  <button
                    aria-expanded={!isCollapsed}
                    className="w-full pr-8 text-left text-sm font-bold text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    onClick={() => toggleGroup(group.label)}
                    type="button"
                  >
                    {group.label}
                  </button>
                </SidebarGroupLabel>
                <SidebarGroupAction
                  aria-expanded={!isCollapsed}
                  aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${group.label}`}
                  onClick={() => toggleGroup(group.label)}
                  type="button"
                >
                  <ChevronDown className={isCollapsed ? "-rotate-90 transition-transform" : "transition-transform"} />
                </SidebarGroupAction>
                {!isCollapsed ? (
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = matchesPath(item.href);

                        return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                              <Link href={item.href}>
                                <Icon />
                                <span>{item.label}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                ) : null}
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="grid min-w-0 flex-1 text-left leading-tight">
                      <span className="truncate font-medium">{user?.name ?? "PXL User"}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user?.email ?? "Loading account..."}
                      </span>
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64" side="right">
                  <DropdownMenuLabel>
                    <span className="block">{user?.name ?? "PXL User"}</span>
                    <span className="block text-xs font-normal text-muted-foreground">
                      {user?.role ?? ""}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <UserCog />
                      Account settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} variant="destructive">
                    <LogOut />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <div>
              <p className="text-sm font-semibold">{currentItem.label}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {mode === "admin" ? "PXL operations" : "PXL client portal"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </header>
        <div className="flex flex-1 flex-col">
          <main className="mx-auto grid w-full max-w-[1500px] gap-6 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
