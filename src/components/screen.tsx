"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AppShell, NotificationPopover, Sidebar, TopBar } from "@vdm-design-team/vcp-design-system";
import { useShellState } from "./shell-state";
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
  const router = useRouter();
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
    router.push(a.getAttribute("href")!);
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
}: {
  active: string;
  header?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { collapsed, setCollapsed, role } = useShellState();
  const mounted = useMounted();
  const { active: scenario, view } = useScenario();

  return (
    <AppShell
      sidebar={
        <Sidebar
          userType={railFor(role)}
          active={active}
          onNavigate={(key) => router.push(routeFor(key))}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />
      }
      topBar={
        <TopBar
          primaryAction={<CreateAVButton />}
          notificationPopover={<Bell />}
          theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
          onThemeChange={setTheme}
          user={{ name: "Eve Kestrel" }}
          onUserMenu={() => {}}
        />
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
