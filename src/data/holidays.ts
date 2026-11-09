import type { HolidaySource, HolidayType } from "@vdm-design-team/vcp-design-system";
import { PEOPLE } from "./gantt";

/* Planning · 03: the Holiday Registry's entries. No real people. "Today" is
   05/11/2026, so the Planning List's November cycles meet Noah's leave, and
   the public holidays fall outside them. */

export interface Holiday {
  id: string;
  name: string;
  /** ISO; `end` equals `start` for a single day. */
  start: string;
  end: string;
  type: HolidayType;
  /**
   * Who it covers, by name. Public and Team holidays cover everyone in the
   * prototype (Figma has no field to choose; see flows/planning-03-holidays.md).
   */
  people: readonly string[];
  allDay: boolean;
  recurring: boolean;
  addedBy: "system" | string;
  source: HolidaySource;
  duplicateOfHubstaff?: boolean;
}

export const EVERYONE = PEOPLE.map((p) => p.name);

export const HOLIDAYS: readonly Holiday[] = [
  { id: "h1", name: "New Year's Day", start: "2026-01-01", end: "2026-01-01", type: "public", people: EVERYONE, allDay: true, recurring: true, addedBy: "system", source: "google-calendar" },
  { id: "h2", name: "Labour Day", start: "2026-05-01", end: "2026-05-01", type: "public", people: EVERYONE, allDay: true, recurring: true, addedBy: "system", source: "google-calendar" },
  { id: "h3", name: "Annual leave (Noah Foster)", start: "2026-11-16", end: "2026-11-20", type: "individual", people: ["Noah Foster"], allDay: true, recurring: false, addedBy: "Eve Kestrel", source: "manual" },
  { id: "h4", name: "Dentist (Alice Carter)", start: "2026-11-12", end: "2026-11-12", type: "individual", people: ["Alice Carter"], allDay: false, recurring: false, addedBy: "Eve Kestrel", source: "manual" },
  { id: "h5", name: "Annual leave (Jack Morgan)", start: "2026-12-07", end: "2026-12-11", type: "individual", people: ["Jack Morgan"], allDay: true, recurring: false, addedBy: "Eve Kestrel", source: "manual", duplicateOfHubstaff: true },
  { id: "h6", name: "Leave (Jack Morgan)", start: "2026-12-07", end: "2026-12-11", type: "individual", people: ["Jack Morgan"], allDay: true, recurring: false, addedBy: "system", source: "hubstaff" },
  { id: "h7", name: "Team offsite", start: "2026-12-18", end: "2026-12-18", type: "team", people: EVERYONE, allDay: true, recurring: false, addedBy: "Eve Kestrel", source: "manual" },
  { id: "h8", name: "Christmas", start: "2026-12-25", end: "2026-12-26", type: "public", people: EVERYONE, allDay: true, recurring: true, addedBy: "system", source: "google-calendar" },
  { id: "h9", name: "Winter break (Lena Novak)", start: "2026-12-21", end: "2026-12-31", type: "individual", people: ["Lena Novak"], allDay: true, recurring: false, addedBy: "Eve Kestrel", source: "manual" },
];

const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) => a.start <= b.end && b.start <= a.end;

/** A person's holidays over some dates (a yearly one counts every year). */
export function holidaysFor(name: string, span: { start: string; end: string }, holidays: readonly Holiday[]) {
  return holidays.filter((h) => {
    if (!h.people.includes(name)) return false;
    if (overlaps(h, span)) return true;
    if (!h.recurring) return false;
    /* The same days in the span's years. */
    const years = new Set([span.start.slice(0, 4), span.end.slice(0, 4)]);
    return [...years].some((y) => overlaps({ start: `${y}${h.start.slice(4)}`, end: `${y}${h.end.slice(4)}` }, span));
  });
}

/** Days no one works (public holidays), for the planning estimate. Yearly ones repeat. */
export function publicDays(holidays: readonly Holiday[]) {
  const days = new Set<string>();
  for (const h of holidays.filter((x) => x.type === "public")) {
    for (let t = Date.parse(`${h.start}T00:00:00Z`); t <= Date.parse(`${h.end}T00:00:00Z`); t += 86_400_000) {
      const iso = new Date(t).toISOString().slice(0, 10);
      days.add(h.recurring ? iso.slice(5) : iso);
    }
  }
  return days;
}
