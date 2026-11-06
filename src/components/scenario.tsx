"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, useToast } from "@vdm-design-team/vcp-design-system";
import { useAddedValues } from "./av-store";
import { useShellState } from "./shell-state";
import { findScenario } from "@/flows/catalogue";
import type { FlowDef, ScenarioDef } from "@/flows/types";

export type ScenarioView = "reviewer" | "participant";

interface ScenarioState {
  /** The scenario running now, if one was started. Explore prototype has none. */
  active?: { flow: FlowDef; scenario: ScenarioDef };
  view: ScenarioView;
  /** Bumped on every start and Reset, so the screen remounts from the scenario's setup. */
  run: number;
  /** Set the scenario's conditions (fresh data, its role, an open rail) and return the route it opens on. */
  start: (flowId: string, scenarioKey: string, view?: ScenarioView) => string | undefined;
  /** Leave the scenario: Explore prototype from here on. */
  clear: () => void;
}

const ScenarioContext = React.createContext<ScenarioState | null>(null);

/**
 * The prototype's Flows & Scenarios machinery, not part of VCP. A scenario
 * changes the data and conditions a screen starts with, never the screen.
 */
export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const { reset } = useAddedValues();
  const { setRole, setCollapsed } = useShellState();
  const { dismissAll } = useToast();
  const [active, setActive] = React.useState<ScenarioState["active"]>();
  const [view, setView] = React.useState<ScenarioView>("reviewer");
  const [run, setRun] = React.useState(0);

  const value = React.useMemo<ScenarioState>(
    () => ({
      active,
      view,
      run,
      start: (flowId, scenarioKey, nextView = "reviewer") => {
        const found = findScenario(flowId, scenarioKey);
        if (!found) return undefined;
        /* Isolation: nothing carries over from what ran before, shell state included. */
        reset();
        dismissAll();
        setRole(found.scenario.role);
        setCollapsed(false);
        setActive(found);
        setView(nextView);
        setRun((n) => n + 1);
        return found.scenario.start;
      },
      clear: () => {
        setActive(undefined);
        setView("reviewer");
      },
    }),
    [active, view, run, reset, dismissAll, setRole, setCollapsed],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

export function useScenario() {
  const state = React.useContext(ScenarioContext);
  if (!state) throw new Error("useScenario needs <ScenarioProvider> above it (it's in the root layout).");
  return state;
}

/** The scenario's setup, when the running scenario opens on this screen. */
export function useScenarioSetup<T>(flowId: string): T | undefined {
  const { active } = useScenario();
  return active?.flow.id === flowId ? (active.scenario.setup as T) : undefined;
}

/**
 * While a scenario runs: the reviewer sees what it shows and what should
 * happen, with Reset and the way back to the catalogue. A participant sees only
 * the task. The prototype's own control, floating bottom left (the role switch
 * is bottom centre, the toasts bottom right).
 */
export function ScenarioBar() {
  const router = useRouter();
  const { active, view, start, clear } = useScenario();
  const headingId = React.useId();
  if (!active) return null;
  const { flow, scenario } = active;
  const key = scenario.id.slice(flow.id.length + 1);

  if (view === "participant") {
    return (
      <aside
        aria-labelledby={headingId}
        className="fixed bottom-4 left-4 z-50 w-80 rounded-md border border-stroke-default bg-surface-elevated p-4 shadow-card"
      >
        <h2 id={headingId} className="text-label-sm-medium text-text-secondary">
          Your task
        </h2>
        <p className="mt-1 text-body-sm-medium text-text-primary">{scenario.task}</p>
      </aside>
    );
  }

  return (
    <aside
      aria-labelledby={headingId}
      className="fixed bottom-4 left-4 z-50 flex w-96 flex-col gap-3 rounded-md border border-stroke-default bg-surface-elevated p-4 shadow-card"
    >
      <div className="flex flex-col gap-1">
        <p className="text-label-sm-medium text-text-secondary">
          Scenario · {flow.area} · {flow.number} {flow.name}
        </p>
        <h2 id={headingId} className="text-title-sm-semibold text-text-primary">
          {scenario.name}
        </h2>
        <p className="text-body-sm-regular text-text-secondary">{scenario.demonstrates}</p>
      </div>
      <details className="text-body-sm-regular text-text-secondary">
        <summary className="cursor-pointer text-label-sm-medium text-text-primary">What should happen</summary>
        <p className="mt-1">{scenario.expected}</p>
      </details>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const route = start(flow.id, key, view);
            if (route) router.push(route);
          }}
        >
          Reset
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => router.push("/flows")}>
          All scenarios
        </Button>
        <Button size="sm" variant="tertiary" onClick={clear}>
          Leave scenario
        </Button>
      </div>
      <p className="text-caption-md-medium text-text-tertiary">
        Share it: <Link className="text-text-link-default underline" href={`/flows/${flow.id}/${key}`}>/flows/{flow.id}/{key}</Link>
      </p>
    </aside>
  );
}
