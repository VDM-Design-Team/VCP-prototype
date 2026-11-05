"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { roleForPath, type Role } from "./roles";

/* What the shell remembers between screens. The root layout stays mounted
   while you click from screen to screen, so state kept here survives. */
interface ShellState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Who the prototype is being viewed as. Switched by the floating RoleSwitch. */
  role: Role;
  setRole: (role: Role) => void;
}

const ShellStateContext = React.createContext<ShellState | null>(null);

export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  /* A page opened directly starts in a role whose rail has it. */
  const [role, setRole] = React.useState<Role>(() => roleForPath(pathname));
  return (
    <ShellStateContext.Provider value={{ collapsed, setCollapsed, role, setRole }}>
      {children}
    </ShellStateContext.Provider>
  );
}

export function useShellState() {
  const state = React.useContext(ShellStateContext);
  if (!state) throw new Error("useShellState needs <ShellStateProvider> above it (it's in the root layout).");
  return state;
}
