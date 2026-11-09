import type { DomainBudgetPeriod, Quarter } from "@vdm-design-team/vcp-design-system";
import { DOMAINS, type AddedValue } from "./added-values";
import { TODAY } from "./gantt";

/* Admin · 01: each domain's development-point budget, per quarter (Figma's Domain Budget pages, 696:54964 and
   696:54963). Allocations and notes are the super admin's; Consumed is worked out, never typed. */

export type QuarterKey = `${number}-Q${Quarter}`;
export const quarterKey = (year: number, q: Quarter): QuarterKey => `${year}-Q${q}`;
export const YEARS = [2027, 2026, 2025, 2024, 2023] as const;

const startOf = (year: number, q: Quarter) => `${year}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`;
const endOf = (year: number, q: Quarter) => {
  const d = new Date(Date.UTC(year, q * 3, 0));
  return d.toISOString().slice(0, 10);
};
const short = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

export const CURRENT = { year: Number(TODAY.slice(0, 4)), quarter: (Math.floor((Number(TODAY.slice(5, 7)) - 1) / 3) + 1) as Quarter };

/** The quarter as the summary card reads it: current (days left), past or upcoming. */
export function periodOf(year: number, q: Quarter): DomainBudgetPeriod {
  const start = startOf(year, q);
  const end = endOf(year, q);
  if (end < TODAY) return { kind: "past", startedOn: short(start), endedOn: short(end) };
  if (start > TODAY) return { kind: "upcoming", startsOn: short(start), endsOn: short(end) };
  const day = 86_400_000;
  return {
    kind: "current",
    endsOn: short(end),
    daysLeft: Math.round((Date.parse(end) - Date.parse(TODAY)) / day),
    daysTotal: Math.round((Date.parse(end) - Date.parse(start)) / day) + 1,
  };
}

export interface DomainBudget {
  allocated: number | null;
  notes?: string;
}
export type Budgets = Record<QuarterKey, Record<string, DomainBudget>>;

/* The sample allocations. Q1 2027 has none yet ("Set Budget"). */
export const BUDGETS: Budgets = {
  "2026-Q3": {
    development: { allocated: 100 }, design: { allocated: 60 }, content: { allocated: 40 },
    governance: { allocated: 30 }, partners: { allocated: 50 }, qa: { allocated: 40 },
  },
  "2026-Q4": {
    development: { allocated: 120, notes: "Holiday weeks in December: kept lower than Q3's plan." },
    design: { allocated: 80 }, content: { allocated: 40 },
    governance: { allocated: 120, notes: "Audit prep." }, partners: { allocated: 60 }, qa: { allocated: 50 },
  },
  "2027-Q1": {},
};

/* What each domain other than Development has used, by quarter: sample figures (their AVs aren't in the prototype). */
const OTHER_CONSUMED: Record<string, Record<string, number>> = {
  "2026-Q3": { design: 58, content: 35, governance: 22, partners: 41, qa: 37 },
  "2026-Q4": { design: 64, content: 12, governance: 160, partners: 0, qa: 30 },
};

/**
 * Consumed: "Development points used by planned AVs, calculated automatically from their points and active
 * dates" (Figma's tooltip). Development's comes from its AVs whose Start Date is in the quarter.
 */
export function consumedFor(domain: string, key: QuarterKey, avs: readonly AddedValue[]) {
  if (domain !== "development") return OTHER_CONSUMED[key]?.[domain] ?? 0;
  const [year, q] = [Number(key.slice(0, 4)), Number(key.slice(-1)) as Quarter];
  const from = startOf(year, q);
  const to = endOf(year, q);
  return avs
    .filter((av) => av.domain === "development" && !["Draft", "Pending", "Rejected", "Backlog"].includes(av.status))
    .filter((av) => av.startDate && av.startDate >= from && av.startDate <= to)
    .reduce((sum, av) => sum + (av.capacityPoints ?? av.assignees.reduce((s, a) => s + (a.points ?? 0), 0)), 0);
}

export const BUDGET_DOMAINS = DOMAINS.map((d) => ({ id: d.value as string, name: d.name as string }));
