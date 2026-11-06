import type { GanttCycle, GanttProject, GanttTask, GanttUser } from "@vdm-design-team/vcp-design-system";

/* Sample planning data for the Gantt Chart, as a backend would send it.
   No real people or work. Fixed to one "today" so the chart always shows the
   same picture: Thursday 5 November 2026, inside Cycle 44 (27 Oct – 9 Nov),
   so the cycle view crosses a month boundary. */
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

const PEOPLE = [
  { id: "u1", name: "John Mason Smith" },
  { id: "u2", name: "Alice Carter" },
  { id: "u3", name: "Jack Morgan" },
  { id: "u4", name: "Lena Novak" },
  { id: "u5", name: "Maya Bennett" },
  { id: "u6", name: "Noah Foster" },
];

export const TASKS: GanttTask[] = [
  { id: "av-101", userId: "u1", projectId: "vcp", title: "Collapsible sidebar for improved tables", status: "in-progress", statusLabel: "Design Review", initiator: "Alice Carter", points: 5, start: "2026-10-28", end: "2026-11-06" },
  { id: "av-102", userId: "u1", projectId: "offerpump", title: "Offer template editor", status: "planned", statusLabel: "Accepted", initiator: "Lena Novak", points: 8, start: "2026-11-09", end: "2026-11-20" },
  { id: "av-103", userId: "u1", projectId: "vcp", title: "Planning list filters", status: "completed", statusLabel: "Done", initiator: "Eve Kestrel", points: 3, start: "2026-10-14", end: "2026-10-23" },
  { id: "av-104", userId: "u1", projectId: "nt", title: "Invoice export", status: "overdue", statusLabel: "In Progress", initiator: "Noah Foster", points: 5, start: "2026-10-19", end: "2026-11-03" },
  { id: "av-105", userId: "u2", projectId: "whu", title: "Warehouse feed sync", status: "in-progress", statusLabel: "AB Testing", initiator: "Maya Bennett", points: 8, start: "2026-10-30", end: "2026-11-12" },
  { id: "av-106", userId: "u2", projectId: "vcp", title: "Holiday registry export", status: "pre-delivered", statusLabel: "Ready for Deploy", initiator: "Eve Kestrel", points: 3, start: "2026-10-26", end: "2026-11-05" },
  { id: "av-107", userId: "u2", projectId: "offerpump", title: "Supplier scorecard", status: "planned", statusLabel: "Backlog", initiator: "Jack Morgan", points: 5, start: "2026-11-23", end: "2026-12-04" },
  { id: "av-108", userId: "u3", projectId: "nt", title: "Credit note matching", status: "completed", statusLabel: "Done", initiator: "Noah Foster", points: 8, start: "2026-09-28", end: "2026-10-16" },
  { id: "av-109", userId: "u3", projectId: "nt", title: "Payment run report", status: "in-progress", statusLabel: "In Progress", initiator: "John Mason Smith", points: 5, start: "2026-11-02", end: "2026-11-13" },
  { id: "av-110", userId: "u3", projectId: "whu", title: "Dock scheduling", status: "planned", statusLabel: "Accepted", initiator: "Alice Carter", points: 13, start: "2026-11-16", end: "2026-12-11" },
  { id: "av-111", userId: "u4", projectId: "offerpump", title: "Bulk offer upload", status: "in-progress", statusLabel: "In Progress", initiator: "Eve Kestrel", points: 5, start: "2026-10-27", end: "2026-11-09" },
  { id: "av-112", userId: "u4", projectId: "offerpump", title: "Price break rules", status: "planned", statusLabel: "Accepted", initiator: "Lena Novak", points: 3, start: "2026-11-10", end: "2026-11-19" },
  { id: "av-113", userId: "u4", projectId: "vcp", title: "Task log trail", status: "completed", statusLabel: "Done", initiator: "Eve Kestrel", points: 8, start: "2026-08-03", end: "2026-08-21" },
  { id: "av-114", userId: "u5", projectId: "whu", title: "Pallet label printing", status: "overdue", statusLabel: "In Progress", initiator: "Jack Morgan", points: 3, start: "2026-10-20", end: "2026-11-02" },
  { id: "av-115", userId: "u5", projectId: "whu", title: "Returns intake form", status: "in-progress", statusLabel: "In Progress", initiator: "Maya Bennett", points: 5, start: "2026-11-03", end: "2026-11-17" },
  { id: "av-116", userId: "u5", projectId: "vcp", title: "Notification inbox filters", status: "planned", statusLabel: "Backlog", initiator: "Eve Kestrel", points: 5, start: "2026-12-07", end: "2026-12-18" },
  { id: "av-117", userId: "u6", projectId: "nt", title: "Ledger reconciliation", status: "pre-delivered", statusLabel: "QA", initiator: "John Mason Smith", points: 8, start: "2026-10-21", end: "2026-11-04" },
  { id: "av-118", userId: "u6", projectId: "nt", title: "Multi-currency invoices", status: "planned", statusLabel: "Accepted", initiator: "Noah Foster", points: 13, start: "2027-01-11", end: "2027-01-29" },
  { id: "av-119", userId: "u6", projectId: "vcp", title: "Changelog modal", status: "completed", statusLabel: "Done", initiator: "Eve Kestrel", points: 5, start: "2026-06-01", end: "2026-06-19" },
  /* Earlier in the year, so the year view opens on finished work rather than an empty January. */
  { id: "av-120", userId: "u1", projectId: "vcp", title: "Domain budget summary", status: "completed", statusLabel: "Done", initiator: "Eve Kestrel", points: 8, start: "2026-01-12", end: "2026-02-06" },
  { id: "av-121", userId: "u2", projectId: "offerpump", title: "Offer approval emails", status: "completed", statusLabel: "Done", initiator: "Lena Novak", points: 5, start: "2026-02-09", end: "2026-03-06" },
  { id: "av-122", userId: "u3", projectId: "whu", title: "Stock count import", status: "completed", statusLabel: "Done", initiator: "Maya Bennett", points: 13, start: "2026-01-19", end: "2026-03-27" },
  { id: "av-123", userId: "u4", projectId: "nt", title: "VAT report fixes", status: "completed", statusLabel: "Done", initiator: "Noah Foster", points: 3, start: "2026-03-16", end: "2026-04-10" },
  { id: "av-124", userId: "u5", projectId: "vcp", title: "Holiday registry", status: "completed", statusLabel: "Done", initiator: "Eve Kestrel", points: 8, start: "2026-04-06", end: "2026-05-15" },
];

/* Each person's panel figures, worked out from their tasks so the numbers on
   screen agree with the bars: WIP is what is under way (overdue included),
   EAD the day after their last open task ends. */
export const USERS: GanttUser[] = PEOPLE.map((person) => {
  const mine = TASKS.filter((t) => t.userId === person.id);
  const open = mine.filter((t) => t.status !== "completed");
  const today = dayOf(TODAY);
  const free = Math.max(today, ...open.map((t) => dayOf(t.end) + 1));
  return {
    ...person,
    wip: mine.filter((t) => t.status === "in-progress" || t.status === "overdue").length,
    planned: mine.filter((t) => t.status === "planned").length,
    ead: isoOf(free),
    eadTd: free - today,
  };
});
