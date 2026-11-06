"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Menu, useToast } from "@vdm-design-team/vcp-design-system";
import { useAddedValues } from "./av-store";
import { useShellState } from "./shell-state";
import { findScenario } from "@/flows/catalogue";
import type { FlowDef, ScenarioDef, ScenarioStep } from "@/flows/types";

export type ScenarioView = "reviewer" | "participant";

interface ScenarioState {
  /** The scenario running now, if one was started. Explore prototype has none. */
  active?: { flow: FlowDef; scenario: ScenarioDef };
  view: ScenarioView;
  /** Bumped on every start and Reset, so the screen remounts from the scenario's setup. */
  run: number;
  /** The steps walked so far (indexes into `scenario.steps`); the last is the current one. Back pops it. */
  trail: readonly number[];
  /** Go on: to the step with id `goto` (a branch), else to the current step's `next`, else the following step. */
  next: (goto?: string) => void;
  back: () => void;
  /** Set the scenario's conditions (fresh data, its role, an open rail) and return the route it opens on. */
  start: (flowId: string, scenarioKey: string, view?: ScenarioView) => string | undefined;
  /** Leave the scenario: Explore prototype from here on. */
  clear: () => void;
}

const ScenarioContext = React.createContext<ScenarioState | null>(null);

/** Whether a step happens on this page. */
const onPage = (step: ScenarioStep, scenario: ScenarioDef, pathname: string) =>
  pathname.startsWith(step.path ?? scenario.start);

/**
 * The prototype's Flows & Scenarios machinery, not part of VCP. A scenario
 * changes the data and conditions a screen starts with, never the screen.
 */
export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const { reset } = useAddedValues();
  const { setRole, setCollapsed } = useShellState();
  const { dismissAll } = useToast();
  const pathname = usePathname();
  const [active, setActive] = React.useState<ScenarioState["active"]>();
  const [view, setView] = React.useState<ScenarioView>("reviewer");
  const [run, setRun] = React.useState(0);
  const [trail, setTrail] = React.useState<number[]>([0]);

  /* When the user's own click lands them on another page (Submit opens the AV),
     the walk follows: to the first later step that happens there. */
  const [seenPath, setSeenPath] = React.useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (active) {
      const steps = active.scenario.steps;
      const current = trail[trail.length - 1];
      if (steps[current] && !onPage(steps[current], active.scenario, pathname)) {
        const later = steps.findIndex((s, i) => i > current && onPage(s, active.scenario, pathname));
        if (later !== -1) setTrail([...trail, later]);
      }
    }
  }

  const value = React.useMemo<ScenarioState>(
    () => ({
      active,
      view,
      run,
      trail,
      next: (goto) => {
        if (!active) return;
        const steps = active.scenario.steps;
        const current = trail[trail.length - 1];
        const target = goto ?? steps[current]?.next;
        const to = target ? steps.findIndex((s) => s.id === target) : current + 1;
        if (to >= 0 && to < steps.length) setTrail([...trail, to]);
      },
      back: () => setTrail((t) => (t.length > 1 ? t.slice(0, -1) : t)),
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
        setTrail([0]);
        setRun((n) => n + 1);
        return found.scenario.start;
      },
      clear: () => {
        setActive(undefined);
        setView("reviewer");
        setTrail([0]);
      },
    }),
    [active, view, run, trail, reset, dismissAll, setRole, setCollapsed],
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

/* ---------- Finding and highlighting what a step is about ---------- */

const nameOf = (el: Element) =>
  (
    el.getAttribute("aria-label") ??
    (el.getAttribute("aria-labelledby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
  ).trim();

/** See `ScenarioStep.target`: `step:<name>`, `group:<Label>` or `button:<Text>`. */
function findTarget(target: string): HTMLElement | null {
  const at = target.indexOf(":");
  const kind = target.slice(0, at);
  const value = target.slice(at + 1);
  const outsideBar = (el: Element) => !el.closest("[data-scenario-bar]");
  if (kind === "step") return document.querySelector<HTMLElement>(`[data-flow-step="${CSS.escape(value)}"]`);
  if (kind === "button")
    return (
      [...document.querySelectorAll<HTMLElement>("button")].find((b) => outsideBar(b) && b.textContent?.trim() === value) ??
      null
    );
  if (kind === "group")
    return [...document.querySelectorAll<HTMLElement>('[role="group"]')].find((g) => nameOf(g).startsWith(value)) ?? null;
  return null;
}

/**
 * An outline around the part of the screen the current step is about. It
 * follows the element as the page scrolls or changes, and never takes a click.
 */
function StepHighlight({ target, stepKey }: { target: string; stepKey: string }) {
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    let frame = 0;
    let scrolled = false;
    const tick = () => {
      const el = findTarget(target);
      if (el && !scrolled) {
        /* Only when it's out of view, and only as far as needed, so it never
           fights the page's own scrolling (a blocked Submit scrolls to its first error). */
        const box = el.getBoundingClientRect();
        if (box.top < 0 || box.bottom > window.innerHeight) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        scrolled = true;
      }
      const r = el?.getBoundingClientRect() ?? null;
      setRect((prev) =>
        prev && r && prev.x === r.x && prev.y === r.y && prev.width === r.width && prev.height === r.height ? prev : r,
      );
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, stepKey]);

  if (!rect || rect.width === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-40 rounded-md outline-4 outline-offset-4 outline-stroke-focused shadow-card transition-all"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
    />
  );
}

/** Moves the walk on when the user presses an action step's target themselves. */
function ActionWatcher({ target, onDone }: { target: string; onDone: () => void }) {
  const done = React.useRef(onDone);
  React.useEffect(() => {
    done.current = onDone;
  });
  React.useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const el = findTarget(target);
      /* After the page has handled the press, so the step after sees its result. */
      if (el && event.target instanceof Node && el.contains(event.target)) window.setTimeout(() => done.current());
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [target]);
  return null;
}

/* ---------- The card ---------- */

/**
 * While a scenario runs. The reviewer is walked through it a step at a time:
 * Back and Next, Next opening a menu where the step has more than one way on,
 * and the part of the screen each step is about outlined. A participant sees
 * only the task, with no guidance. The prototype's own control, floating bottom
 * left (the role switch is bottom centre, the toasts bottom right).
 */
export function ScenarioBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { active, view, trail, next, back, start, clear } = useScenario();
  const headingId = React.useId();
  if (!active || pathname.startsWith("/flows")) return null;
  const { flow, scenario } = active;
  const key = scenario.id.slice(flow.id.length + 1);
  const leave = () => {
    clear();
    router.push("/flows");
  };

  if (view === "participant") {
    return (
      <aside
        data-scenario-bar
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

  const index = trail[trail.length - 1];
  const step = scenario.steps[index];
  const last = !step?.options && !step?.next && index >= scenario.steps.length - 1;
  const here = step && onPage(step, scenario, pathname);
  /* An action step: Next does the action (presses Submit), which then moves the walk on. */
  const actOrNext = () => {
    const el = step?.action && step.target ? findTarget(step.target) : null;
    if (el) el.click();
    else next();
  };

  return (
    <>
      {step?.target && here && <StepHighlight target={step.target} stepKey={`${scenario.id}:${index}`} />}
      {step?.action && step.target && here && <ActionWatcher target={step.target} onDone={() => next()} />}
      <aside
        data-scenario-bar
        aria-labelledby={headingId}
        className="fixed bottom-4 left-4 z-50 flex w-96 flex-col gap-3 rounded-md border border-stroke-default bg-surface-elevated p-4 shadow-card"
      >
        <div className="flex flex-col gap-1">
          <p className="text-label-sm-medium text-text-secondary">
            {flow.area} · {flow.number} {flow.name}
          </p>
          <h2 id={headingId} className="text-title-sm-semibold text-text-primary">
            {scenario.name}
          </h2>
        </div>
        {step && (
          <div className="flex flex-col gap-1 rounded-sm bg-surface-neutral-subtle p-3">
            <p className="text-label-sm-medium text-text-secondary">Step {trail.length}</p>
            {/* Polite: a new step is read out after whatever the user just did. */}
            <p aria-live="polite" className="text-body-sm-medium text-text-primary">
              {step.text}
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" disabled={trail.length < 2} onClick={back}>
            Back
          </Button>
          {last ? (
            <Button size="sm" onClick={leave}>
              Finish
            </Button>
          ) : step?.options ? (
            <Menu
              align="left"
              trigger={<Button size="sm">Next</Button>}
              items={step.options.map((o) => ({ key: o.goto, label: o.label }))}
              onSelect={(goto) => goto && next(goto)}
            />
          ) : (
            <Button size="sm" onClick={actOrNext}>
              Next
            </Button>
          )}
          <span className="flex-1" />
          <Button
            size="sm"
            variant="tertiary"
            onClick={() => {
              const route = start(flow.id, key, view);
              if (route) router.push(route);
            }}
          >
            Reset
          </Button>
          {/* On the last step Finish already goes back to the list. */}
          {!last && (
            <Button size="sm" variant="tertiary" onClick={leave}>
              Leave scenario
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
