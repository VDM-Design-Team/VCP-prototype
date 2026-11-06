"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AppShell, Sidebar, TopBar } from "@vdm-design-team/vcp-design-system";
import { useShellState } from "./shell-state";
import { CreateAVButton } from "./create-av-button";
import { railFor } from "./roles";

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
          notifications={3}
          onNotifications={() => {}}
          theme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
          onThemeChange={setTheme}
          user={{ name: "Eve Kestrel" }}
          onUserMenu={() => {}}
        />
      }
      header={header}
    >
      {children}
    </AppShell>
  );
}
