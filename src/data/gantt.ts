import type { GanttCycle, GanttProject } from "@vdm-design-team/vcp-design-system";

/* The Gantt Chart's calendar, projects and people. No real people or work.
   Fixed to one "today" so the chart always shows the same picture: Thursday
   5 November 2026, inside Cycle 44 (27 Oct – 9 Nov), so the cycle view
   crosses a month boundary. */
export const TODAY = "2026-11-05";

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const isoOf = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);

/* A cycle is a fortnight; Cycle 37 began on 21 July 2026. C23–C56 covers all
   of 2026 and the first half of 2027 for the year view. */
export const CYCLES: GanttCycle[] = Array.from({ length: 34 }, (_, i) => {
  const n = 23 + i;
  const start = dayOf("2026-07-21") + (n - 37) * 14;
  return { id: `c${n}`, label: `Cycle ${n}`, short: `C${n}`, start: isoOf(start), end: isoOf(start + 13) };
});

export const PROJECTS: GanttProject[] = [
  { id: "vcp", name: "VCP" },
  { id: "offerpump", name: "OfferPump" },
  { id: "whu", name: "WHU" },
  { id: "nt", name: "NT" },
];

/* Who the chart has rows for: Eve (the viewer) and the team. Their bars are
   the Added Values assigned to them, read from the AV store (see gantt-tasks.ts). */
export const PEOPLE = [
  { id: "u-eve", name: "Eve Kestrel" },
  { id: "u1", name: "John Mason Smith" },
  { id: "u2", name: "Alice Carter" },
  { id: "u3", name: "Jack Morgan" },
  { id: "u4", name: "Lena Novak" },
  { id: "u5", name: "Maya Bennett" },
  { id: "u6", name: "Noah Foster" },
];
