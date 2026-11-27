"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, Menu, useToast } from "@vdm-design-team/vcp-design-system";
import { useAddedValues } from "./av-store";
import { useHolidays } from "./holiday-store";
import { useNotifications } from "./notification-store";
import { useBudgets } from "./budget-store";
import { useSettings } from "./settings-store";
import { ADMIN_DOMAINS, useShellState } from "./shell-state";
import { findScenario } from "@/flows/catalogue";
import type { FlowDef, ScenarioDef, ScenarioStep, StepFill } from "@/flows/types";
import { ViewAs } from "./view-as";

export type ScenarioView = "reviewer" | "participant";

/**
 * One step walked: which step, the page it happened on, and how the walk got
 * there. `action`: the reviewer (or Next) pressed the previous step's target on
 * the same page, so what this step shows is that press's result. `fill`: the
 * previous step's change was made (by Next, or by the reviewer). `page`: the
 * reviewer's own click opened another page.
 */
export interface WalkedStep {
  index: number;
  path: string;
  via: "start" | "next" | "action" | "fill" | "page";
}

type FormValues = Record<string, unknown>;
/** What Back does again after rebuilding a form's page: a fill, or a press (a blocked Submit's errors). */
type Redo = { set: FormValues } | { press: string };
interface ScenarioForm {
  set: (patch: FormValues) => void;
}

const isObject = (v: unknown): v is FormValues => typeof v === "object" && v !== null && !Array.isArray(v);

/** `set` merged into the form's values, a nested object (`details`) one level deep. */
const merged = <T extends object>(values: T, set: FormValues): T => {
  const out: FormValues = { ...(values as FormValues) };
  for (const [k, v] of Object.entries(set)) out[k] = isObject(v) && isObject(out[k]) ? { ...out[k], ...v } : v;
  return out as T;
};

/** Whether the form holds `set` (each key the same; a nested object, key by key). */
const holds = (values: FormValues, set: FormValues): boolean =>
  Object.entries(set).every(([k, v]) =>
    isObject(v) && isObject(values[k]) ? holds(values[k], v) : JSON.stringify(values[k]) === JSON.stringify(v),
  );

const fillDone = (fill: StepFill, values: FormValues) => (fill.done ? fill.done(values) : holds(values, fill.set));

interface ScenarioState {
  /** The scenario running now, if one was started. Explore prototype has none. */
  active?: { flow: FlowDef; scenario: ScenarioDef };
  view: ScenarioView;
  /** Bumped on every start and Reset, so the screen remounts from the scenario's setup. */
  run: number;
  /** Bumped on Back, so the whole screen is rebuilt from the data put back (not on start: the start page would restart). */
  rebuilt: number;
  /** The steps walked so far; the last is the current one. Back goes to an earlier one. */
  trail: readonly WalkedStep[];
  /**
   * Go on: to the step with id `goto` (a branch), else to the current step's
   * `next`, else the following step. With `from`, only if the walk is still on
   * that step (a press that also opened another page has already moved it).
   * `via`: the walk moves because the current step's target was pressed (`action`) or its change made (`fill`).
   */
  next: (goto?: string, from?: number, via?: "action" | "fill") => void;
  back: () => void;
  /** Set the scenario's conditions (fresh data, its role, an open rail) and return the route it opens on. */
  start: (flowId: string, scenarioKey: string, view?: ScenarioView) => string | undefined;
  /** Leave the scenario (Finish, Leave scenario): the sample data, toasts, role and rail all go back to how they were. */
  clear: () => void;
  /** The values of the form on screen (the AV form), for `fill` steps; undefined when there's none. */
  formValues?: FormValues;
  /** Makes a `fill` step's change on the form on screen. */
  fillForm: (set: FormValues) => void;
  /** For `useScenarioForm`: the form on screen registers itself, reports its values, and takes the fills to put back. */
  connectForm: (form: ScenarioForm | null) => void;
  reportForm: (values: FormValues | undefined) => void;
  takeReplay: () => Redo[];
}

const ScenarioContext = React.createContext<ScenarioState | null>(null);

interface Snapshot {
  stores: unknown[];
  role: ReturnType<typeof useShellState>["role"];
  collapsed: boolean;
  domain: string;
  dashboardView: ReturnType<typeof useShellState>["dashboardView"];
}

/** Whether a step happens on this page. A `*` at the end matches the rest; one in the middle, one segment. */
const onPage = (step: ScenarioStep, scenario: ScenarioDef, pathname: string) => {
  const path = step.path ?? scenario.start;
  if (!path.includes("*")) return pathname === path;
  const parts = path.split("*").map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&"));
  const last = path.endsWith("*") ? ".*" : "";
  return new RegExp(`^${parts.slice(0, path.endsWith("*") ? -1 : undefined).join("[^/]+")}${last}$`).test(pathname);
};

/**
 * The prototype's Flows & Scenarios machinery, not part of VCP. A scenario
 * changes the data and conditions a screen starts with, never the screen.
 */
export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const { reset } = useAddedValues();
  const { reset: resetHolidays } = useHolidays();
  const { reset: resetNotifications } = useNotifications();
  const { reset: resetBudgets } = useBudgets();
  const { reset: resetSettings } = useSettings();
  const avStore = useAddedValues();
  const holidayStore = useHolidays();
  const notificationStore = useNotifications();
  const budgetStore = useBudgets();
  const settingsStore = useSettings();
  const { role, collapsed, domain, dashboardView, setRole, setCollapsed, setDomain, setDashboardView } = useShellState();
  const router = useRouter();
  const { dismissAll } = useToast();
  const pathname = usePathname();
  const [active, setActive] = React.useState<ScenarioState["active"]>();
  const [view, setView] = React.useState<ScenarioView>("reviewer");
  const [run, setRun] = React.useState(0);
  const [rebuilt, setRebuilt] = React.useState(0);
  const [trail, setTrail] = React.useState<WalkedStep[]>([{ index: 0, path: pathname, via: "start" }]);
  /* The form on screen, for fill steps: how to change it, what it holds, and the fills Back puts back into it. */
  const form = React.useRef<ScenarioForm | null>(null);
  const [formValues, setFormValues] = React.useState<FormValues>();
  const replay = React.useRef<{ at?: WalkedStep; redo: Redo[] }>({ redo: [] });

  /* What everything looked like when each walked step began: the sample data,
     the role, the rail. Taken once the step's page has drawn, so a press's
     result is in it. Back puts it back. */
  const snapshots = React.useRef(new WeakMap<WalkedStep, Snapshot>());
  const take = (): Snapshot => ({
    stores: [avStore, holidayStore, notificationStore, budgetStore, settingsStore].map((s) => s.snapshot()),
    role,
    collapsed,
    domain,
    dashboardView,
  });
  const latestTake = React.useRef(take);
  const stores = [avStore, holidayStore, notificationStore, budgetStore, settingsStore];
  const latestStores = React.useRef(stores);
  React.useEffect(() => {
    latestTake.current = take;
    latestStores.current = stores;
  });
  const top = trail[trail.length - 1];
  React.useEffect(() => {
    if (active && !snapshots.current.has(top)) snapshots.current.set(top, latestTake.current());
  }, [active, top]);

  /* When the user's own click lands them on another page (Submit opens the AV),
     the walk follows: to the first later step that happens there. */
  const [seenPath, setSeenPath] = React.useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (active) {
      const steps = active.scenario.steps;
      const current = trail[trail.length - 1].index;
      if (steps[current] && !onPage(steps[current], active.scenario, pathname)) {
        const later = steps.findIndex((s, i) => i > current && onPage(s, active.scenario, pathname));
        if (later !== -1) setTrail([...trail, { index: later, path: pathname, via: "page" }]);
      }
    }
  }

  const value = React.useMemo<ScenarioState>(
    () => ({
      active,
      view,
      run,
      rebuilt,
      trail,
      next: (goto, from, via) => {
        if (!active) return;
        const steps = active.scenario.steps;
        const current = trail[trail.length - 1].index;
        if (from !== undefined && from !== current) return;
        const target = goto ?? steps[current]?.next;
        const to = target ? steps.findIndex((s) => s.id === target) : current + 1;
        if (to >= 0 && to < steps.length) setTrail([...trail, { index: to, path: pathname, via: via ?? "next" }]);
      },
      back: () => {
        if (!active || trail.length < 2) return;
        /* Back rebuilds the screen as it was when that step began. A step that only shows what a press did on the
           same page (a blocked Submit's errors, an open dialog) can't be rebuilt without the press, so Back goes on
           to the step that asks for it: Next presses it again. */
        let to = trail.length - 1;
        while (to > 1 && trail[to - 1].via === "action" && trail[to - 1].path === trail[to - 2].path) to -= 1;
        const kept = trail.slice(0, to);
        const landing = kept[kept.length - 1];
        /* The form isn't sample data: it's rebuilt from the scenario's setup. So what the walk did on this page
           before the landing step is done again, in order: its fills (as the steps wrote them, not as typed) and
           its presses that stayed on the page (a blocked Submit, so its errors are back). */
        const arrived = kept.findLastIndex((w, i) => i === 0 || kept[i - 1].path !== w.path);
        replay.current = {
          at: landing,
          redo: kept.slice(arrived, -1).flatMap((w, i, walked): Redo[] => {
            const step = active.scenario.steps[w.index];
            if (step?.fill) return [{ set: step.fill.set }];
            if (step?.action && step.target && walked[i + 1]?.via === "action") return [{ press: step.target }];
            return [];
          }),
        };
        const snap = snapshots.current.get(landing);
        if (snap) {
          latestStores.current.forEach((s, i) => s.restore(snap.stores[i]));
          setRole(snap.role);
          setCollapsed(snap.collapsed);
          setDomain(snap.domain);
          setDashboardView(snap.dashboardView);
        }
        dismissAll();
        setTrail(kept);
        setRun((n) => n + 1);
        setRebuilt((n) => n + 1);
        if (landing.path !== pathname) router.push(landing.path);
      },
      start: (flowId, scenarioKey, nextView = "reviewer") => {
        const found = findScenario(flowId, scenarioKey);
        if (!found) return undefined;
        /* Isolation: nothing carries over from what ran before, shell state included. */
        reset(found.scenario.avs);
        resetHolidays();
        resetNotifications();
        resetBudgets();
        resetSettings();
        dismissAll();
        setRole(found.scenario.role);
        setDomain(found.scenario.domain ?? ADMIN_DOMAINS[0]);
        setDashboardView(found.scenario.dashboardView ?? "cycle");
        setCollapsed(false);
        setActive(found);
        setView(nextView);
        setTrail([{ index: 0, path: found.scenario.start, via: "start" }]);
        replay.current = { redo: [] };
        setRun((n) => n + 1);
        return found.scenario.start;
      },
      clear: () => {
        /* Nothing a scenario did outlives it: what it created or changed, its toasts, its role. */
        reset();
        resetHolidays();
        resetNotifications();
        resetBudgets();
        resetSettings();
        dismissAll();
        setRole("user");
        setDomain(ADMIN_DOMAINS[0]);
        setDashboardView("cycle");
        setCollapsed(false);
        setActive(undefined);
        setView("reviewer");
        setTrail([{ index: 0, path: "/flows", via: "start" }]);
      },
      formValues,
      fillForm: (set) => form.current?.set(set),
      connectForm: (f) => {
        form.current = f;
      },
      reportForm: setFormValues,
      /* Only while the walk is still on the step Back landed on. Not emptied on reading: a form can mount twice
         (React's development checks), and the second one must redo it too. */
      takeReplay: () => (replay.current.at === trail[trail.length - 1] ? replay.current.redo : []),
    }),
    [active, view, run, rebuilt, trail, formValues, pathname, router, reset, resetHolidays, resetNotifications, resetBudgets, resetSettings, dismissAll, setRole, setCollapsed, setDomain, setDashboardView],
  );

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>;
}

/**
 * The screen, rebuilt on Back: it starts again from the data put back, with
 * nothing left open from the step it came from. (Start and Reset rebuild the
 * form through `run`; keying this on `run` would restart the start page.)
 */
export function ScenarioScreen({ children }: { children: React.ReactNode }) {
  const { rebuilt } = useScenario();
  return <React.Fragment key={rebuilt}>{children}</React.Fragment>;
}

export function useScenario() {
  const state = React.useContext(ScenarioContext);
  if (!state) throw new Error("useScenario needs <ScenarioProvider> above it (it's in the root layout).");
  return state;
}

/**
 * A form a scenario's `fill` steps can change (the AV form): Next makes a step's
 * change through `setValues`, and the walk moves on when the user makes it
 * themselves. After Back rebuilds the screen, the fills walked before go back in.
 */
export function useScenarioForm<T extends object>(values: T, setValues: React.Dispatch<React.SetStateAction<T>>) {
  const { connectForm, reportForm, takeReplay } = useScenario();
  React.useEffect(() => {
    connectForm({ set: (set) => setValues((v) => merged(v, set)) });
    const redo = takeReplay();
    let stopped = false;
    void (async () => {
      for (const r of redo) {
        /* Each after the page has drawn the one before. */
        await new Promise((done) => window.setTimeout(done, 60));
        if (stopped) return;
        if ("set" in r) setValues((v) => merged(v, r.set));
        else redoPress(r.press);
      }
    })();
    return () => {
      stopped = true;
      connectForm(null);
      reportForm(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per form: a rebuilt screen mounts a new one
  }, []);
  React.useEffect(() => {
    reportForm(values as FormValues);
  }, [values, reportForm]);
}

/** The scenario's setup, when the running scenario belongs to one of the flows that open this screen. */
export function useScenarioSetup<T>(flowIds: string | readonly string[]): T | undefined {
  const { active } = useScenario();
  const ids: readonly string[] = typeof flowIds === "string" ? [flowIds] : flowIds;
  return active && ids.includes(active.flow.id) ? (active.scenario.setup as T) : undefined;
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

/** A button's words as a screen reader hears them: its text without the `aria-hidden` parts ("+2" → "Show 2 more reactions"). */
const spokenText = (el: HTMLElement) => {
  const copy = el.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
  return copy.textContent?.trim();
};

/** See `ScenarioStep.target`: `step:<name>`, `group:<Label>`, `button:<Text>` or `link:<href>`. */
function findTarget(target: string): HTMLElement | null {
  const at = target.indexOf(":");
  const kind = target.slice(0, at);
  const value = target.slice(at + 1);
  /* The card's own buttons are never a step's target; its View as is (a step can say "Switch View as to Admin"). */
  const outsideBar = (el: Element) => !el.closest("[data-scenario-bar]") || !!el.closest("[data-view-as]");
  if (kind === "step") return document.querySelector<HTMLElement>(`[data-flow-step="${CSS.escape(value)}"]`);
  if (kind === "button")
    return (
      [...document.querySelectorAll<HTMLElement>("button")].find(
        /* By its words, or for an icon-only button its name (`aria-label`, or a `title`, as IconButton's). */
        (b) => outsideBar(b) && [b.textContent?.trim(), spokenText(b), b.getAttribute("aria-label"), b.title].includes(value),
      ) ??
      null
    );
  if (kind === "group")
    return [...document.querySelectorAll<HTMLElement>('[role="group"]')].find((g) => nameOf(g).startsWith(value)) ?? null;
  if (kind === "link")
    return [...document.querySelectorAll<HTMLElement>("a")].find((a) => outsideBar(a) && a.getAttribute("href") === value) ?? null;
  return null;
}

/** What a press step presses: its target, or for a `step:` wrapper the button in it (the ⋮ menu's trigger, the back arrow). */
function pressable(target: string): HTMLElement | null {
  const found = findTarget(target);
  return found && found.tagName !== "BUTTON" ? (found.querySelector<HTMLElement>("button") ?? found) : found;
}
/* Back's own presses (redoing a blocked Submit) aren't the reviewer's: the walk doesn't move on them. */
let redoing = false;
const redoPress = (target: string) => {
  redoing = true;
  try {
    pressable(target)?.click();
  } finally {
    redoing = false;
  }
};

/**
 * A drag a reviewer would make with the mouse (`ScenarioStep.drop`), done with
 * the same drag events, so the page handles it as theirs. Nothing happens when
 * the row is already in that section (they dragged it themselves).
 */
async function dropRow({ row, on }: { row: string; on: string }) {
  const pause = () => new Promise((r) => window.setTimeout(r, 80));
  const sections = [...document.querySelectorAll<HTMLElement>("main section")];
  const titled = (title: string) => sections.find((s) => s.querySelector("h2")?.textContent?.startsWith(title));
  const rowIn = (section?: HTMLElement) =>
    [...(section?.querySelectorAll<HTMLTableRowElement>("tbody tr") ?? [])].find((r) =>
      r.cells[0]?.textContent?.startsWith(row),
    );
  if (rowIn(titled(on))) return;
  const tr = sections.map(rowIn).find(Boolean);
  const target = titled(on);
  if (!tr || !target) return;
  const data = new DataTransfer();
  tr.dispatchEvent(new DragEvent("dragstart", { bubbles: true, dataTransfer: data }));
  await pause();
  target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: data }));
  await pause();
  target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: data }));
  tr.dispatchEvent(new DragEvent("dragend", { bubbles: true, dataTransfer: data }));
  await pause();
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
      if (!redoing && el && event.target instanceof Node && el.contains(event.target)) window.setTimeout(() => done.current());
    };
    /* In the capture phase: a dialog takes its buttons off the page while it handles the click, so by the
       time the click bubbles up to `document`, its Cancel or Confirm is gone and can't be found. */
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [target]);
  return null;
}

/**
 * Moves the walk on when the user makes a fill step's change themselves: once
 * it's done and they've stopped typing for a moment, so it doesn't move on the
 * first letter.
 */
function FillWatcher({ fill, values, onDone }: { fill: StepFill; values: FormValues; onDone: () => void }) {
  const done = React.useRef(onDone);
  React.useEffect(() => {
    done.current = onDone;
  });
  /* Only a change made on this step counts: a step that starts done waits for Next. */
  const [start] = React.useState(values);
  React.useEffect(() => {
    if (values === start || !fillDone(fill, values)) return;
    const t = window.setTimeout(() => done.current(), 800);
    return () => window.clearTimeout(t);
  }, [fill, values, start]);
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
  const { active, view, trail, next, back, start, clear, formValues, fillForm } = useScenario();
  const headingId = React.useId();
  if (!active || pathname.startsWith("/flows")) return null;
  const { flow, scenario } = active;
  const key = scenario.id.slice(flow.id.length + 1);
  /* Back to the list, at this scenario's card. */
  const leave = () => {
    clear();
    router.push(`/flows#${encodeURIComponent(scenario.id)}`);
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

  const index = trail[trail.length - 1].index;
  const step = scenario.steps[index];
  const last = !step?.options && !step?.next && index >= scenario.steps.length - 1;
  const here = step && onPage(step, scenario, pathname);
  /* A press whose next step is on another page (Submit → the AV's page) can fail: a blocked Submit stays put. So the
     walk moves only when that page opens, which the page-change follow above does; moving on the click would describe
     a success that did not happen. A press whose next step is on this page (a menu, a dialog, "Blocked: …") moves on
     the click. */
  const following = step?.next ? scenario.steps.find((s) => s.id === step.next) : scenario.steps[index + 1];
  const movesOnClick = !following || onPage(following, scenario, pathname);
  /* Next does what the step asks: the press, the change, the page, the drop. The walk then moves on as it would
     if the reviewer had done it. */
  const actOrNext = () => {
    if (step?.drop && !document.querySelector('[role="dialog"]')) {
      void dropRow(step.drop).then(() => next(undefined, undefined, "action"));
      return;
    }
    if (step?.fill && here && formValues) {
      if (!fillDone(step.fill, formValues)) fillForm(step.fill.set);
      next(undefined, undefined, "fill");
      return;
    }
    if (step?.open && pathname !== step.open) {
      router.push(step.open);
      return;
    }
    if (step?.action && step.target) {
      const target = step.target;
      /* After Next's own click is done: a menu the press opens would otherwise take that click as one
         outside it and close at once. */
      window.setTimeout(() => {
        const el = pressable(target);
        if (el) return el.click();
        /* Not on screen: Next's click closed the menu it's in. Open it again with the step before's press, then
           press it. Never move on without doing it, unless it can't be found at all. */
        const before = trail.length > 1 ? scenario.steps[trail[trail.length - 2].index] : undefined;
        if (!before?.action || !before.target) return next();
        pressable(before.target)?.click();
        window.setTimeout(() => {
          const again = pressable(target);
          if (again) again.click();
          else next();
        }, 150);
      });
      return;
    }
    next();
  };

  return (
    <>
      {step?.target && here && <StepHighlight target={step.target} stepKey={`${scenario.id}:${index}`} />}
      {step?.action && step.target && here && movesOnClick && (
        <ActionWatcher target={step.target} onDone={() => next(undefined, index, "action")} />
      )}
      {step?.fill && here && formValues && (
        <FillWatcher key={index} fill={step.fill} values={formValues} onDone={() => next(undefined, index, "fill")} />
      )}
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
        {/* The floating View as bar would sit under this card, so the card carries it while a scenario is open. */}
        <ViewAs />
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
