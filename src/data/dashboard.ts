import type { ChartSeries, CapacitySegment, Quarter } from "@vdm-design-team/vcp-design-system";
import type { AddedValue } from "./added-values";
import { VIEWER } from "./added-values";
import { CYCLES, PEOPLE, TODAY } from "./gantt";
import { holidaysFor, publicDays, type Holiday } from "./holidays";
import { inCycle, pointsOf } from "./planning";

/* Admin · 02: the numbers on the Development admin's dashboard (Figma's Dashboard Page, 947:304368). Figma
   draws the screens, not the sums, so every rule here is the prototype's until the product says otherwise
   (see flows/admin-02-dashboard.md). Everything is worked out from the sample AVs, the cycles and the
   Holiday Registry, so the dashboard agrees with the Planning List and the Gantt Chart. */

/** Figma's team filter lists teams by name; these are the prototype's people, grouped. */
export const TEAMS = [
  { value: "all", label: "All Teams", people: PEOPLE.map((p) => p.name) },
  { value: "platform", label: "Team Platform", people: ["Eve Kestrel", "John Mason Smith", "Alice Carter"] },
  { value: "finance", label: "Team Finance", people: ["Jack Morgan", "Noah Foster"] },
  { value: "warehouse", label: "Team Warehouse", people: ["Lena Novak", "Maya Bennett"] },
] as const;
export type TeamId = (typeof TEAMS)[number]["value"];
const peopleOf = (team: TeamId) => TEAMS.find((t) => t.value === team)!.people as readonly string[];

type Cycle = (typeof CYCLES)[number];
export const cycleById = (id: string) => CYCLES.find((c) => c.id === id)!;

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const isoOf = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);

/** A cycle's working days: weekdays that aren't public holidays (Planning · 03). */
function workingDays(c: { start: string; end: string }, holidays: readonly Holiday[]) {
  const pub = publicDays(holidays);
  const days: string[] = [];
  for (let d = dayOf(c.start); d <= dayOf(c.end); d++) {
    const iso = isoOf(d);
    const wd = new Date(d * DAY).getUTCDay();
    if (wd !== 0 && wd !== 6 && !pub.has(iso) && !pub.has(iso.slice(5))) days.push(iso);
  }
  return days;
}

/** A person's points in an AV: their own, or an even share of the AV's. */
const share = (av: AddedValue, name: string) => {
  const a = av.assignees.find((x) => x.name === name);
  if (!a) return 0;
  return a.points ?? Math.round(pointsOf(av) / Math.max(av.assignees.length, 1));
};

/** When it was completed: the history's "to Completed" date, or its due date. */
const completedOn = (av: AddedValue) => {
  const h = [...av.history].reverse().find((e) => e.to === "Completed");
  const when = typeof h?.when === "string" ? h.when.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) : null;
  return when ? `${when[3]}-${when[2]}-${when[1]}` : av.dueDate ?? TODAY;
};

/** How an AV in a cycle stands on a day: done, late, or still committed. */
const standing = (av: AddedValue, day: string): "completed" | "overdue" | "committed" =>
  av.status === "Completed" && completedOn(av) <= day ? "completed" : av.dueDate && av.dueDate < day ? "overdue" : "committed";

/** "Now" for a cycle: today while it runs, its last day once it's over. */
const asOf = (c: Cycle) => (c.end < TODAY ? c.end : TODAY);

/** The team's Added Values in a cycle (Development, accepted onwards), and each one's points for the team. */
function work(avs: readonly AddedValue[], cycleId: string, team: TeamId) {
  const people = peopleOf(team);
  return avs
    .filter((av) => inCycle(av) && av.cycle === cycleId)
    .map((av) => ({ av, points: people.reduce((sum, name) => sum + share(av, name), 0) }))
    .filter((w) => w.points > 0);
}

/** Each person's capacity: a point is a working day (Planning · 02), less their own leave in the Holiday Registry. */
export function capacityFor(name: string, c: Cycle, holidays: readonly Holiday[]) {
  const days = workingDays(c, holidays);
  const theirs = holidaysFor(name, c, holidays).filter((h) => h.type !== "public" && h.allDay);
  const leave = days.filter((d) => theirs.some((h) => (h.start <= d && d <= h.end) || (h.recurring && h.start.slice(5) <= d.slice(5) && d.slice(5) <= h.end.slice(5)))).length;
  return { days: days.length, leave, capacity: days.length - leave };
}

/** Cycle Summary: points committed and completed, those carried over (late, so they go on into the next cycle), and the rate. */
export function cycleSummary(avs: readonly AddedValue[], cycleId: string, team: TeamId) {
  const c = cycleById(cycleId);
  const day = asOf(c);
  const items = work(avs, cycleId, team);
  const committed = items.reduce((s, w) => s + w.points, 0);
  const completed = items.filter((w) => standing(w.av, day) === "completed").reduce((s, w) => s + w.points, 0);
  /* Carried over: unfinished and past its due date (a cycle that's over carries everything unfinished). */
  const carriedOver = items
    .filter((w) => standing(w.av, day) !== "completed" && (c.end < TODAY || standing(w.av, day) === "overdue"))
    .reduce((s, w) => s + w.points, 0);
  return { committed, completed, carriedOver, completion: committed ? (completed / committed) * 100 : null };
}

const segment = (series: ChartSeries, value: number): CapacitySegment[] => (value > 0 ? [{ series, value }] : []);

/** Team Capacity: the team's points by how they stand, then what's left of their capacity. */
export function teamCapacity(avs: readonly AddedValue[], cycleId: string, team: TeamId, holidays: readonly Holiday[]) {
  const c = cycleById(cycleId);
  const day = asOf(c);
  const items = work(avs, cycleId, team);
  const by = (s: string) => items.filter((w) => standing(w.av, day) === s).reduce((sum, w) => sum + w.points, 0);
  const capacity = peopleOf(team).reduce((sum, name) => sum + capacityFor(name, c, holidays).capacity, 0);
  const used = items.reduce((s, w) => s + w.points, 0);
  return {
    segments: [...segment("completed", by("completed")), ...segment("committed", by("committed")), ...segment("overdue", by("overdue")), ...segment("available", capacity - used)],
    remaining: capacity - used,
  };
}

/** User Capacity: one row per person, with their leave. */
export function userCapacity(avs: readonly AddedValue[], cycleId: string, team: TeamId, holidays: readonly Holiday[]) {
  const c = cycleById(cycleId);
  const day = asOf(c);
  const items = avs.filter((av) => inCycle(av) && av.cycle === cycleId);
  return peopleOf(team).map((name) => {
    const { leave, capacity } = capacityFor(name, c, holidays);
    const mine = items.map((av) => ({ av, points: share(av, name) })).filter((w) => w.points > 0);
    const by = (s: string) => mine.filter((w) => standing(w.av, day) === s).reduce((sum, w) => sum + w.points, 0);
    const used = mine.reduce((s, w) => s + w.points, 0);
    return {
      id: name,
      name,
      segments: [
        ...segment("completed", by("completed")),
        ...segment("committed", by("committed")),
        ...segment("overdue", by("overdue")),
        ...segment("available", capacity - used),
        ...segment("leave", leave),
      ],
    };
  });
}

const shortDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
export const cycleRange = (c: Cycle) => `${shortDate(c.start)} - ${shortDate(c.end)}`;

/** Sprint Metrics: the chosen cycle and the three before it (Figma draws four). */
export function sprintMetrics(avs: readonly AddedValue[], cycleId: string, team: TeamId, holidays: readonly Holiday[]) {
  const i = CYCLES.findIndex((c) => c.id === cycleId);
  return CYCLES.slice(Math.max(i - 3, 0), i + 1).map((c) => {
    const day = asOf(c);
    const items = work(avs, c.id, team);
    const by = (s: string) => items.filter((w) => standing(w.av, day) === s).reduce((sum, w) => sum + w.points, 0);
    return {
      key: c.id,
      label: cycleRange(c),
      values: {
        available: peopleOf(team).reduce((sum, name) => sum + capacityFor(name, c, holidays).capacity, 0),
        committed: items.reduce((s, w) => s + w.points, 0),
        completed: by("completed"),
        overdue: by("overdue"),
      },
    };
  });
}

/**
 * Cycle Burndown, one point per working day: Committed is the even line from everything committed down to
 * nothing; Completed is what's actually left, and Overdue what's past due, up to today (the lines stop there).
 */
export function burndown(avs: readonly AddedValue[], cycleId: string, team: TeamId, holidays: readonly Holiday[]) {
  const c = cycleById(cycleId);
  const items = work(avs, cycleId, team);
  const total = items.reduce((s, w) => s + w.points, 0);
  const days = workingDays(c, holidays);
  const data = days.map((day, i) => {
    const seen = day <= TODAY;
    const done = items.filter((w) => standing(w.av, day) === "completed").reduce((s, w) => s + w.points, 0);
    const late = items.filter((w) => standing(w.av, day) === "overdue").reduce((s, w) => s + w.points, 0);
    return {
      key: day,
      label: shortDate(day),
      title: day.split("-").reverse().join("."),
      values: {
        committed: Math.round((total * (days.length - 1 - i)) / Math.max(days.length - 1, 1)),
        completed: seen ? total - done : null,
        overdue: seen ? late : null,
      },
    };
  });
  const day = asOf(c);
  const done = items.filter((w) => standing(w.av, day) === "completed").reduce((s, w) => s + w.points, 0);
  const late = items.filter((w) => standing(w.av, day) === "overdue").reduce((s, w) => s + w.points, 0);
  return {
    data,
    stats: [
      { key: "completed", label: "Completed", value: done, tone: "success" as const },
      { key: "remaining", label: "Remaining", value: total - done, tone: "brand" as const },
      { key: "off-track", label: "Off-track", value: late, tone: "critical" as const },
    ],
  };
}

/** The cycles that start in a quarter. */
export const cyclesInQuarter = (year: number, quarter: Quarter) =>
  CYCLES.filter((c) => Number(c.start.slice(0, 4)) === year && Math.ceil(Number(c.start.slice(5, 7)) / 3) === quarter);

/** Cycle Performance: each of the quarter's cycles, its capacity against what was completed and what ran late. */
export function cyclePerformance(avs: readonly AddedValue[], year: number, quarter: Quarter, team: TeamId, holidays: readonly Holiday[]) {
  return cyclesInQuarter(year, quarter).map((c) => {
    const day = asOf(c);
    const items = work(avs, c.id, team);
    const by = (s: string) => items.filter((w) => standing(w.av, day) === s).reduce((sum, w) => sum + w.points, 0);
    const month = new Date(`${c.start}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    return {
      key: c.id,
      label: `${month} ${c.short}`,
      values: {
        available: peopleOf(team).reduce((sum, name) => sum + capacityFor(name, c, holidays).capacity, 0),
        overdue: by("overdue"),
        completed: by("completed"),
      },
    };
  });
}

/** Figma's "whose" choices for the Value Cards. */
export const WHOSE = ["All", "Initiated", "Assigned", "Team"] as const;
export type Whose = (typeof WHOSE)[number];

/** Value Cards: the domain's Added Values by where they stand, for whose the admin picked (Figma's four). */
export function valueCards(avs: readonly AddedValue[], domain: string, whose: Whose) {
  const team = TEAMS.find((t) => t.value !== "all" && (t.people as readonly string[]).includes(VIEWER.name));
  const mine = avs.filter((av) => {
    if (av.domain !== domain) return false;
    if (whose === "Initiated") return av.initiator === VIEWER.name;
    if (whose === "Assigned") return av.assignees.some((a) => a.name === VIEWER.name);
    if (whose === "Team") return av.assignees.some((a) => (team?.people as readonly string[] | undefined)?.includes(a.name));
    return true;
  });
  const open = (av: AddedValue) => !["Completed", "Rejected", "Draft", "Backlog"].includes(av.status);
  const overdue = mine.filter((av) => open(av) && av.status !== "Pending" && av.dueDate && av.dueDate < TODAY).length;
  return [
    { key: "overdue", label: "Overdue", value: overdue, accent: "critical" as const },
    { key: "in-progress", label: "In Progress", value: mine.filter((av) => av.status === "In Progress" || av.status === "Review").length, accent: "brand" as const },
    { key: "pending", label: "Pending", value: mine.filter((av) => av.status === "Pending").length, accent: "yellow" as const },
    { key: "draft", label: "Draft", value: mine.filter((av) => av.status === "Draft").length, accent: "neutral" as const },
  ];
}
