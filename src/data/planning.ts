import type { AssigneeAvailability } from "@vdm-design-team/vcp-design-system";
import type { AddedValue } from "./added-values";
import { holidaysFor, type Holiday } from "./holidays";
import { CYCLES, TODAY } from "./gantt";

/* Planning · 02: the rules the Planning List runs on. Figma draws the
   screens, not the numbers, so each rule here is the prototype's until the
   product says otherwise (see flows/planning-02-cycles.md). */


/**
 * Each cycle's Total Capacity in points: a fixed number per cycle (decided 9 Nov 2026), standing in for
 * the figure an admin sets. Capacity Remaining is it minus every AV in the cycle, Completed ones
 * included (decided), and it may go below 0: no warning, no block (decided, as Figma).
 */
const CAPACITY: Record<string, number> = { c45: 50, c46: 40 };
export const DEFAULT_CAPACITY = 60;
export const capacityOf = (cycleId: string) => CAPACITY[cycleId] ?? DEFAULT_CAPACITY;

/** Statuses that sit in a cycle on the Planning List; Backlog has its own section. */
const IN_A_CYCLE = new Set(["Accepted", "In Progress", "Review", "Completed"]);

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const isoOf = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);
const weekend = (day: number) => [0, 6].includes(new Date(day * DAY).getUTCDay());
/** Days off: weekends, and public holidays (Planning · 03) as `publicDays` gives them. */
const off = (day: number, holidays?: ReadonlySet<string>) =>
  weekend(day) || (!!holidays && (holidays.has(isoOf(day)) || holidays.has(isoOf(day).slice(5))));

/** The first working day on or after `iso`. */
const workingDayFrom = (iso: string, holidays?: ReadonlySet<string>) => {
  let d = dayOf(iso);
  while (off(d, holidays)) d++;
  return isoOf(d);
};

/** `n` working days after `iso`. */
export const addWorkingDays = (iso: string, n: number, holidays?: ReadonlySet<string>) => {
  let d = dayOf(iso);
  for (let left = n; left > 0; ) {
    d++;
    if (!off(d, holidays)) left--;
  }
  return isoOf(d);
};

/** `n` working days before `iso`. */
const subtractWorkingDays = (iso: string, n: number, holidays?: ReadonlySet<string>) => {
  let d = dayOf(iso);
  for (let left = n; left > 0; ) {
    d--;
    if (!off(d, holidays)) left--;
  }
  return isoOf(d);
};

/** The buffer in "Due Date = Approx. Start Date + Approx. Working Days + Buffer" (PlanningTable's hint). */
const BUFFER_DAYS = 1;

/** Due Date: a point is a working day, plus the buffer. Public holidays aren't working days. */
export const estimateDue = (start: string, points: number, holidays?: ReadonlySet<string>) =>
  addWorkingDays(start, Math.max(points, 1) - 1 + BUFFER_DAYS, holidays);
/** Start Date back from a Due Date, the same rule the other way. */
export const estimateStart = (due: string, points: number, holidays?: ReadonlySet<string>) =>
  subtractWorkingDays(due, Math.max(points, 1) - 1 + BUFFER_DAYS, holidays);

export const cycleOf = (iso: string) => CYCLES.find((c) => c.start <= iso && iso <= c.end);
export const CURRENT_CYCLE = cycleOf(TODAY)!;

/** A cycle's estimated Start Date: its first working day, or today's, in the cycle that's running. */
export const cycleStart = (cycleId: string, holidays?: ReadonlySet<string>) => {
  const c = CYCLES.find((x) => x.id === cycleId)!;
  return workingDayFrom(c.start < TODAY ? TODAY : c.start, holidays);
};

export const pointsOf = (av: AddedValue) => av.capacityPoints ?? av.assignees.reduce((sum, a) => sum + (a.points ?? 0), 0);

export const inPlanning = (av: AddedValue) => av.domain === "development";
export const inCycle = (av: AddedValue) => inPlanning(av) && IN_A_CYCLE.has(av.status) && !!av.cycle;
export const inBacklog = (av: AddedValue) => inPlanning(av) && av.status === "Backlog";

/**
 * The cycles on the page: the one running and the next always, any later
 * cycle with work in it, and an earlier one only while it has unfinished work
 * (late AVs stay in view).
 */
export function shownCycles(avs: readonly AddedValue[]) {
  const next = CYCLES[CYCLES.indexOf(CURRENT_CYCLE) + 1];
  const used = new Set(avs.filter(inCycle).map((av) => av.cycle));
  const unfinished = new Set(avs.filter((av) => inCycle(av) && av.status !== "Completed").map((av) => av.cycle));
  return CYCLES.filter(
    (c) =>
      c === CURRENT_CYCLE ||
      c === next ||
      (c.start > CURRENT_CYCLE.start ? used.has(c.id) : unfinished.has(c.id)),
  );
}

const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) => a.start <= b.end && b.start <= a.end;

/**
 * Whether a person is free over some dates, from the Holiday Registry
 * (Planning · 03) and the plan: Unavailable on an all-day holiday or leave
 * that covers them, Busy on a partial day or with other scheduled work,
 * otherwise Available. Unknown dates read Available.
 */
export function availability(
  name: string,
  dates: { start?: string; end?: string },
  avs: readonly AddedValue[],
  holidays: readonly Holiday[],
  except?: string,
): AssigneeAvailability {
  if (!dates.start || !dates.end) return "available";
  const span = { start: dates.start, end: dates.end };
  const theirs = holidaysFor(name, span, holidays);
  if (theirs.some((h) => h.allDay)) return "unavailable";
  if (theirs.length) return "busy";
  const busy = avs.some(
    (av) =>
      av.id !== except &&
      inCycle(av) &&
      av.status !== "Completed" &&
      av.startDate &&
      av.dueDate &&
      av.assignees.some((a) => a.name === name) &&
      overlaps({ start: av.startDate, end: av.dueDate }, span),
  );
  return busy ? "busy" : "available";
}

/** When an unavailable person is free again: the day after their last all-day holiday in those dates. */
export const freeFrom = (name: string, dates: { start?: string; end?: string }, holidays: readonly Holiday[]) => {
  if (!dates.start || !dates.end) return undefined;
  const ends = holidaysFor(name, { start: dates.start, end: dates.end }, holidays)
    .filter((h) => h.allDay)
    .map((h) => h.end)
    .sort();
  return ends.length ? isoOf(dayOf(ends[ends.length - 1]) + 1) : undefined;
};
