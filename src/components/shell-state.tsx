"use client";

import * as React from "react";

/* What the shell remembers between screens. The root layout stays mounted
   while you click from screen to screen, so state kept here survives. */
interface ShellState {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const ShellStateContext = React.createContext<ShellState | null>(null);

export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <ShellStateContext.Provider value={{ collapsed, setCollapsed }}>{children}</ShellStateContext.Provider>
  );
}

export function useShellState() {
  const state = React.useContext(ShellStateContext);
  if (!state) throw new Error("useShellState needs <ShellStateProvider> above it (it's in the root layout).");
  return state;
}
