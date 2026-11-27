"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@vdm-design-team/vcp-design-system";
import { useScenario } from "./scenario";
import { ViewAs } from "./view-as";

/**
 * The prototype's own floating bar, not part of VCP: View as, and the way to the Flows & Scenarios list. It sits
 * bottom centre, out of the way of the design system's toasts (bottom right). While a scenario is open its card
 * carries View as instead, and Leave scenario is the way back, so the bar steps aside.
 */
export function RoleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, view } = useScenario();
  /* The catalogue is its own page, and a usability participant gets the task only. */
  if (pathname.startsWith("/flows") || view === "participant" || active) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-md border border-stroke-default bg-surface-elevated py-2 pl-4 pr-2 shadow-card">
      <ViewAs />
      <Button size="sm" variant="tertiary" onClick={() => router.push("/flows")}>
        Flows &amp; Scenarios
      </Button>
    </div>
  );
}
