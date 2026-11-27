"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { SegmentedControl } from "@vdm-design-team/vcp-design-system";
import { useShellState } from "./shell-state";
import { keyForPath, ROLES, roleSees, type Role } from "./roles";

/**
 * Who the prototype is being viewed as: the prototype's own control, not VCP's. Switching keeps the page if the
 * new role's rail has it, and otherwise goes to that role's Dashboard. `locked`: it shows the role, disabled (a
 * scenario that doesn't switch roles).
 */
export function ViewAs({ locked = false }: { locked?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useShellState();
  const labelId = React.useId();
  const hintId = React.useId();

  const switchTo = (next: string) => {
    const nextRole = next as Role;
    setRole(nextRole);
    const key = keyForPath(pathname);
    /* Pages outside the rails (an Added Value) are everyone's, so they stay. */
    const inSomeRail = ROLES.some((r) => roleSees(r.value, key));
    if (inSomeRail && !roleSees(nextRole, key)) router.push("/");
  };

  return (
    <div className="flex items-center gap-3" title={locked ? "This scenario is for one role" : undefined}>
      <span id={labelId} className="text-label-sm-medium text-text-secondary">
        View as
      </span>
      {locked && (
        <span id={hintId} className="sr-only">
          This scenario is for one role.
        </span>
      )}
      <SegmentedControl
        aria-labelledby={labelId}
        aria-describedby={locked ? hintId : undefined}
        size="lg"
        options={ROLES.map(({ value, label }) => ({ value, label, disabled: locked }))}
        value={role}
        onChange={switchTo}
      />
    </div>
  );
}
