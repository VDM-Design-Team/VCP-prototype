import type { AssigneeAvailability } from "@vdm-design-team/vcp-design-system";
import type { AddedValue } from "./added-values";
import { CYCLES, PEOPLE, TODAY } from "./gantt";

/* Planning · 02: the rules the Planning List runs on. Figma draws the
   screens, not the numbers, so each rule here is the prototype's until the
   product says otherwise (see flows/planning-02-cycles.md). */

/** Leave, until the Holiday Registry (Planning · 03) owns it. */
export const LEAVE = [{ name: "Noah Foster", start: "2026-11-16", end: "2026-11-20" }];

/** Points one person can take on in a cycle. Total Capacity is this for everyone. */
export const POINTS_PER_PERSON = 10;
export const TOTAL_CAPACITY = POINTS_PER_PERSON * PEOPLE.length;

/** Statuses that sit in a cycle on the Planning List; Backlog has its own section. */
const IN_A_CYCLE = new Set(["Accepted", "In Progress", "Review", "Completed"]);

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const isoOf = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);
const weekend = (day: number) => [0, 6].includes(new Date(day * DAY).getUTCDay());

/** The first working day on or after `iso`. */
const workingDayFrom = (iso: string) => {
  let d = dayOf(iso);
  while (weekend(d)) d++;
  return isoOf(d);
};

/** `n` working days after `iso`. */
export const addWorkingDays = (iso: string, n: number) => {
  let d = dayOf(iso);
  for (let left = n; left > 0; ) {
    d++;
    if (!weekend(d)) left--;
  }
  return isoOf(d);
};

/** `n` working days before `iso`. */
const subtractWorkingDays = (iso: string, n: number) => {
  let d = dayOf(iso);
  for (let left = n; left > 0; ) {
    d--;
    if (!weekend(d)) left--;
  }
  return isoOf(d);
};

/** The buffer in "Due Date = Approx. Start Date + Approx. Working Days + Buffer" (PlanningTable's hint). */
const BUFFER_DAYS = 1;

/** Due Date: a point is a working day, plus the buffer. */
export const estimateDue = (start: string, points: number) => addWorkingDays(start, Math.max(points, 1) - 1 + BUFFER_DAYS);
/** Start Date back from a Due Date, the same rule the other way. */
export const estimateStart = (due: string, points: number) => subtractWorkingDays(due, Math.max(points, 1) - 1 + BUFFER_DAYS);

export const cycleOf = (iso: string) => CYCLES.find((c) => c.start <= iso && iso <= c.end);
export const CURRENT_CYCLE = cycleOf(TODAY)!;

/** A cycle's estimated Start Date: its first working day, or today's, in the cycle that's running. */
export const cycleStart = (cycleId: string) => {
  const c = CYCLES.find((x) => x.id === cycleId)!;
  return workingDayFrom(c.start < TODAY ? TODAY : c.start);
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
 * Whether a person is free over some dates: Unavailable on leave, Busy with
 * other scheduled work, otherwise Available. Unknown dates read Available.
 */
export function availability(
  name: string,
  dates: { start?: string; end?: string },
  avs: readonly AddedValue[],
  except?: string,
): AssigneeAvailability {
  if (!dates.start || !dates.end) return "available";
  const span = { start: dates.start, end: dates.end };
  if (LEAVE.some((l) => l.name === name && overlaps(l, span))) return "unavailable";
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

/** When an unavailable person is free again: the day after their leave. */
export const freeFrom = (name: string, dates: { start?: string; end?: string }) => {
  const l = LEAVE.find((x) => x.name === name && dates.start && dates.end && overlaps(x, { start: dates.start, end: dates.end }));
  return l ? isoOf(dayOf(l.end) + 1) : undefined;
};
