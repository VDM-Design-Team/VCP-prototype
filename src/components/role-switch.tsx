"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { SegmentedControl } from "@vdm-design-team/vcp-design-system";
import { useShellState } from "./shell-state";
import { keyForPath, ROLES, roleSees, type Role } from "./roles";

/**
 * The prototype's own control, not part of VCP: a floating switch for who the
 * prototype is being viewed as. Switching keeps the page if the new role's
 * rail has it, and otherwise goes to that role's Dashboard. It sits bottom
 * centre, out of the way of the design system's toasts (bottom right).
 */
export function RoleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useShellState();
  const labelId = React.useId();

  const switchTo = (next: string) => {
    const nextRole = next as Role;
    setRole(nextRole);
    const key = keyForPath(pathname);
    /* Pages outside the rails (an Added Value) are everyone's, so they stay. */
    const inSomeRail = ROLES.some((r) => roleSees(r.value, key));
    if (inSomeRail && !roleSees(nextRole, key)) router.push("/");
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border border-stroke-default bg-surface-elevated py-2 pl-4 pr-2 shadow-card">
      <span id={labelId} className="text-label-sm-medium text-text-secondary">
        View as
      </span>
      <SegmentedControl
        aria-labelledby={labelId}
        size="lg"
        options={ROLES.map(({ value, label }) => ({ value, label }))}
        value={role}
        onChange={switchTo}
      />
    </div>
  );
}
