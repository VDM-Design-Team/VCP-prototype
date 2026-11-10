"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { AppShell, NotificationPopover, Sidebar, TopBar } from "@vdm-design-team/vcp-design-system";
import { ADMIN_DOMAINS, useGuardedPush, useShellState } from "./shell-state";
import { CreateAVButton } from "./create-av-button";
import { useScenario } from "./scenario";
import { railFor } from "./roles";
import { useNotifications } from "./notification-store";
import { NotificationRow } from "./notification-rows";

/** The rail reports a row's key — `drafts`, or a sub-row's `planning/gantt-chart` —
    and every key is a route of the same name, except Dashboard. */
export const routeFor = (key: string) => (key === "dashboard" ? "/" : `/${key}`);

/* The theme is only known in the browser, so the server renders the switch as light. */
const useMounted = () =>
  React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/**
 * Activity · 02: the bell opens the latest notifications (DS NotificationPopover in TopBar's
 * `notificationPopover`, DS #342). All / Mentions and Unread only filter here; Mark all as read is in
 * its menu; a row opens its AV, and the footer link the inbox, both without leaving the app.
 */
function Bell() {
  const push = useGuardedPush();
  const { notifications, unread, markAllRead } = useNotifications();
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "mentions">("all");
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const rows = notifications
    .filter((n) => filter === "all" || n.kind === "mention")
    .filter((n) => !unreadOnly || n.unread);
  /* The footer is a real link; a plain click stays in the app, so the prototype keeps its state. */
  const inApp = (e: React.MouseEvent) => {
    const a = (e.target as Element).closest("a");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    setOpen(false);
    push(a.getAttribute("href")!);
  };
  return (
    <span onClick={inApp} data-flow-step="bell">
      <NotificationPopover
        count={unread}
        open={open}
        onOpenChange={setOpen}
        filter={filter}
        onFilterChange={setFilter}
        unreadOnly={unreadOnly}
        onUnreadOnlyChange={setUnreadOnly}
        onMarkAllRead={markAllRead}
        inboxHref="/notifications"
        emptyLabel={unreadOnly ? "No unread notifications" : "No notifications"}
      >
        {rows.map((n) => (
          <NotificationRow key={n.id} n={n} withComment onOpened={() => setOpen(false)} />
        ))}
      </NotificationPopover>
    </span>
  );
}

/**
 * Every screen sits in this: VCP's AppShell with the rail, the app bar and the
 * screen's own title band. `active` is the rail row this screen belongs to —
 * a sub-row's key (`planning/gantt-chart`) for a screen under Planning or Archive.
 * The rail is the one for the role the floating RoleSwitch is set to.
 */
export function Screen({
  active,
  header,
  children,
  rail = true,
  primaryAction,
}: {
  active: string;
  header?: React.ReactNode;
  children: React.ReactNode;
  /** `false`: no left menu, and the top bar's logo instead of Create Added Value (Figma's inbox, decided 9 Nov 2026). */
  rail?: boolean;
  /** The top bar's button, instead of Create Added Value (the super admin's Accounts: Add Account, Figma 921:152559). */
  primaryAction?: React.ReactNode;
}) {
  const push = useGuardedPush();
  const { resolvedTheme, setTheme } = useTheme();
  const { collapsed, setCollapsed, role, domain, setDomain } = useShellState();
  /* Admin · 01: an admin switches between their domains (Figma's admin rail). Development's admin has Planning. */
  const userType = role === "admin" ? (domain === "Development" ? "admin-dev" : "admin") : railFor(role);
  const mounted = useMounted();
  const { active: scenario, view } = useScenario();

  return (
    <AppShell
      sidebar={
        rail && (
          <Sidebar
            userType={userType}
            active={active}
            onNavigate={(key) => push(routeFor(key))}
            {...(role === "admin" && {
              showDomainSelector: true,
              domain,
              domains: ADMIN_DOMAINS,
              onDomainChange: setDomain,
            })}
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        )
      }
      topBar={
        /* The logo is a real link home; a plain click stays in the app, so the prototype keeps its state. */
        <div
          onClick={(e) => {
            const a = (e.target as Element).closest("a[href='/']");
            if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
            e.preventDefault();
            push("/");
          }}
        >
          <TopBar
            primaryAction={primaryAction ?? (rail ? <CreateAVButton /> : undefined)}
            homeHref={rail ? undefined : "/"}
            notificationPopover={<Bell />}
            theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
            onThemeChange={setTheme}
            user={{ name: "Eve Kestrel" }}
            /* The user menu: Settings opens Admin · 04's page; Logout has nowhere to go in the prototype. */
            onUserMenuSelect={(key) => {
              if (key === "settings") push("/settings");
            }}
          />
        </div>
      }
      header={header}
    >
      {children}
      {/* Room under the content for the prototype's floating controls (the role
          switch, and a scenario's card), so the last field can scroll clear of them. */}
      <div aria-hidden="true" className={scenario && view === "reviewer" ? "h-64 shrink-0" : "h-20 shrink-0"} />
    </AppShell>
  );
}
