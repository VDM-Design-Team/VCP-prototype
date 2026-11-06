"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EmptyState, Icon } from "@vdm-design-team/vcp-design-system";
import { useScenario } from "@/components/scenario";
import { findScenario } from "@/flows/catalogue";

/**
 * Opening a scenario's link sets its conditions, then opens its screen: a link
 * to the screen alone isn't enough. `?view=participant` starts it for a
 * usability session (the task only, no reviewer controls).
 */
export function ScenarioStart({ flowId, scenarioKey }: { flowId: string; scenarioKey: string }) {
  const router = useRouter();
  const { start } = useScenario();
  const missing = !findScenario(flowId, scenarioKey);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current || missing) return;
    started.current = true;
    const view = new URLSearchParams(window.location.search).get("view") === "participant" ? "participant" : "reviewer";
    const route = start(flowId, scenarioKey, view);
    if (route) router.replace(route);
  }, [flowId, scenarioKey, start, router, missing]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-canvas p-8">
      <h1 className="sr-only">Flows &amp; Scenarios</h1>
      {missing ? (
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title="This scenario isn't here"
          description="Its link may be out of date. Open the Flows & Scenarios catalogue to find it."
        />
      ) : (
        <p role="status" className="text-body-md-regular text-text-secondary">
          Setting up the scenario…
        </p>
      )}
    </main>
  );
}
