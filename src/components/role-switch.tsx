"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@vdm-design-team/vcp-design-system";
import { switchesRole, useScenario } from "./scenario";
import { ViewAs } from "./view-as";

/**
 * The prototype's own floating bar, not part of VCP: View as, and the way to the Flows & Scenarios list. It sits
 * bottom centre, out of the way of the design system's toasts (bottom right). With a scenario open it sits just
 * right of the scenario's card, which would otherwise cover it, and View as is usable only when the scenario
 * switches roles; otherwise it shows the scenario's role, disabled.
 */
export function RoleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, view } = useScenario();
  /* The catalogue is its own page, and a usability participant gets the task only. */
  if (pathname.startsWith("/flows") || view === "participant") return null;

  return (
    <div
      className={`fixed bottom-4 z-50 flex flex-wrap items-center gap-3 rounded-md border border-stroke-default bg-surface-elevated py-2 pl-4 pr-2 shadow-card ${
        /* The card is w-96 from left-4: start just past it, and wrap rather than run off a narrow window. */
        active ? "left-104 right-4 max-w-fit" : "left-1/2 -translate-x-1/2"
      }`}
    >
      <ViewAs locked={!!active && !switchesRole(active.scenario)} />
      <Button size="sm" variant="tertiary" onClick={() => router.push("/flows")}>
        Flows &amp; Scenarios
      </Button>
    </div>
  );
}
