"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { roleForPath, type Role } from "./roles";

/* What the shell remembers between screens. The root layout stays mounted
   while you click from screen to screen, so state kept here survives. */
interface ShellState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Who the prototype is being viewed as. Switched by the floating RoleSwitch. */
  role: Role;
  setRole: (role: Role) => void;
  /** Admin · 01: the admin's domain, from the rail's switcher (decided 10 Nov 2026: an admin has several). */
  domain: string;
  setDomain: (domain: string) => void;
  /** Admin · 02: the Development admin's dashboard view, Cycle or Quarter (Figma's switch); kept between screens. */
  dashboardView: DashboardView;
  setDashboardView: (view: DashboardView) => void;
  /**
   * A page with unsaved edits (Admin · 01) claims navigation: given where to, it returns true when it will ask
   * first (and go later, or not). Every in-app link goes through `useGuardedPush`.
   */
  leaveGuard: React.MutableRefObject<((go: () => void) => boolean) | null>;
  /** Claim navigation (a page with unsaved edits), or let it go (`null`). */
  setLeaveGuard: (guard: ((go: () => void) => boolean) | null) => void;
}

export type DashboardView = "cycle" | "quarter";

const ShellStateContext = React.createContext<ShellState | null>(null);

export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  /* A page opened directly starts in a role whose rail has it. */
  const [role, setRole] = React.useState<Role>(() => roleForPath(pathname));
  const [domain, setDomain] = React.useState(ADMIN_DOMAINS[0]);
  const [dashboardView, setDashboardView] = React.useState<DashboardView>("cycle");
  const leaveGuard = React.useRef<((go: () => void) => boolean) | null>(null);
  const setLeaveGuard = React.useCallback((guard: ((go: () => void) => boolean) | null) => {
    leaveGuard.current = guard;
  }, []);
  return (
    <ShellStateContext.Provider
      value={{ collapsed, setCollapsed, role, setRole, domain, setDomain, dashboardView, setDashboardView, leaveGuard, setLeaveGuard }}
    >
      {children}
    </ShellStateContext.Provider>
  );
}

/** The domains the prototype's admin looks after (Figma's admin rail has a switcher; the domain names are DOMAINS'). */
export const ADMIN_DOMAINS = ["Development", "Design (BESA)", "Content"];

/** Navigate in the app, unless the page asks first (unsaved edits): then it decides. */
export function useGuardedPush() {
  const router = useRouter();
  const { leaveGuard } = useShellState();
  return React.useCallback(
    (href: string) => {
      const go = () => router.push(href);
      if (!leaveGuard.current?.(go)) go();
    },
    [router, leaveGuard],
  );
}

export function useShellState() {
  const state = React.useContext(ShellStateContext);
  if (!state) throw new Error("useShellState needs <ShellStateProvider> above it (it's in the root layout).");
  return state;
}
