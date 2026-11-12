import type { AddedValue } from "./added-values";
import { CYCLES } from "./gantt";

/* The rest of the team's work, as Added Values, so every bar on the Gantt
   Chart is an AV that opens (Planning · 01, decided 9 Nov 2026). Eve's and
   Jack's AVs come from the main sample data. Older references (VCP-11xx) than
   the sample AVs, and last updated before them, so the AV lists keep the
   sample AVs on top. */

type Row = {
  n: number;
  title: string;
  who: string;
  project: string;
  status: "Accepted" | "In Progress" | "Completed";
  step?: string;
  initiator: string;
  points: number;
  start: string;
  due: string;
  problem: string;
};

const ROWS: Row[] = [
  { n: 1102, title: "Offer template editor", who: "John Mason Smith", project: "OfferPump", status: "Accepted", initiator: "Lena Novak", points: 8, start: "2026-11-09", due: "2026-11-20", problem: "Every offer is written from scratch, so the same terms are typed again and again." },
  { n: 1104, title: "Invoice export", who: "John Mason Smith", project: "NT", status: "In Progress", initiator: "Noah Foster", points: 5, start: "2026-10-19", due: "2026-11-03", problem: "Finance can't get invoices out of NT for the accountant without copying them." },
  { n: 1105, title: "Warehouse feed sync", who: "Alice Carter", project: "WHU", status: "In Progress", step: "for-qa", initiator: "Maya Bennett", points: 8, start: "2026-10-30", due: "2026-11-12", problem: "The warehouse feed lags by a day, so stock levels on WHU are often wrong." },
  { n: 1107, title: "Supplier rating import", who: "Alice Carter", project: "OfferPump", status: "Accepted", initiator: "Jack Morgan", points: 5, start: "2026-11-23", due: "2026-12-04", problem: "Supplier ratings live in a spreadsheet nobody else can see." },
  { n: 1108, title: "Credit note matching", who: "Jack Morgan", project: "NT", status: "Completed", initiator: "Noah Foster", points: 8, start: "2026-09-28", due: "2026-10-16", problem: "Credit notes are matched to invoices by hand at month end." },
  { n: 1109, title: "Payment run report", who: "Jack Morgan", project: "NT", status: "In Progress", initiator: "John Mason Smith", points: 5, start: "2026-11-02", due: "2026-11-13", problem: "Nobody can see what a payment run paid until the bank statement arrives." },
  { n: 1110, title: "Dock scheduling", who: "Jack Morgan", project: "WHU", status: "Accepted", initiator: "Alice Carter", points: 13, start: "2026-11-16", due: "2026-12-11", problem: "Trucks queue at the docks because slots are booked by phone." },
  { n: 1111, title: "Offer price history", who: "Lena Novak", project: "OfferPump", status: "In Progress", initiator: "Alice Carter", points: 5, start: "2026-10-27", due: "2026-11-09", problem: "Sales can't see what we offered a customer last time." },
  { n: 1112, title: "Price break rules", who: "Lena Novak", project: "OfferPump", status: "Accepted", initiator: "Lena Novak", points: 3, start: "2026-11-10", due: "2026-11-19", problem: "Volume discounts are worked out by hand on every offer." },
  { n: 1113, title: "Task log trail", who: "Lena Novak", project: "VCP", status: "Completed", initiator: "Alice Carter", points: 8, start: "2026-08-03", due: "2026-08-21", problem: "Nobody could tell who changed an AV, or when." },
  { n: 1114, title: "Pallet label printing", who: "Maya Bennett", project: "WHU", status: "In Progress", initiator: "Jack Morgan", points: 3, start: "2026-10-20", due: "2026-11-02", problem: "Pallet labels are printed from a separate tool and often mismatch the order." },
  { n: 1115, title: "Returns intake form", who: "Maya Bennett", project: "WHU", status: "In Progress", initiator: "Maya Bennett", points: 5, start: "2026-11-03", due: "2026-11-17", problem: "Returns arrive with handwritten notes the warehouse can't read." },
  { n: 1117, title: "Ledger reconciliation", who: "Noah Foster", project: "NT", status: "In Progress", step: "ready-for-deploy", initiator: "John Mason Smith", points: 8, start: "2026-10-21", due: "2026-11-04", problem: "Reconciling the ledger takes two people a full day each month." },
  { n: 1118, title: "Multi-currency invoices", who: "Noah Foster", project: "NT", status: "Accepted", initiator: "Noah Foster", points: 13, start: "2027-01-11", due: "2027-01-29", problem: "NT can only invoice in euros." },
  { n: 1119, title: "Changelog modal", who: "Noah Foster", project: "VCP", status: "Completed", initiator: "Alice Carter", points: 5, start: "2026-06-01", due: "2026-06-19", problem: "Users missed what changed in each release." },
  { n: 1120, title: "Domain budget summary", who: "John Mason Smith", project: "VCP", status: "Completed", initiator: "Alice Carter", points: 8, start: "2026-01-12", due: "2026-02-06", problem: "Each domain's budget was tracked in its own spreadsheet." },
  { n: 1121, title: "Offer approval emails", who: "Alice Carter", project: "OfferPump", status: "Completed", initiator: "Lena Novak", points: 5, start: "2026-02-09", due: "2026-03-06", problem: "Approvers didn't know an offer was waiting for them." },
  { n: 1122, title: "Stock count import", who: "Jack Morgan", project: "WHU", status: "Completed", initiator: "Maya Bennett", points: 13, start: "2026-01-19", due: "2026-03-27", problem: "Stock counts were typed in from paper sheets." },
  { n: 1123, title: "VAT report fixes", who: "Lena Novak", project: "NT", status: "Completed", initiator: "Noah Foster", points: 3, start: "2026-03-16", due: "2026-04-10", problem: "The VAT report rounded each line, so totals were off by cents." },
  { n: 1124, title: "Holiday registry", who: "Maya Bennett", project: "VCP", status: "Completed", initiator: "Alice Carter", points: 8, start: "2026-04-06", due: "2026-05-15", problem: "Leave was booked by email, so nobody knew who was away." },
];

const cycleOf = (iso: string) => CYCLES.find((c) => c.start <= iso && iso <= c.end)?.id;
const daysBefore = (iso: string, days: number) =>
  new Date(Date.parse(`${iso}T00:00:00Z`) - days * 86_400_000).toISOString().slice(0, 10);

function toAV(r: Row): AddedValue {
  const accepted = daysBefore(r.start, 7);
  const history: AddedValue["history"] = [{ actor: "Alice Carter", from: "Pending", to: "Accepted", when: accepted.split("-").reverse().join("/") }];
  if (r.status !== "Accepted") history.push({ actor: r.who, from: "Accepted", to: "In Progress", when: r.start.split("-").reverse().join("/") });
  if (r.status === "Completed") history.push({ actor: r.who, from: "In Progress", to: "Completed", when: r.due.split("-").reverse().join("/") });
  return {
    id: `vcp-${r.n}`,
    ref: `VCP-${r.n}`,
    title: r.title,
    domain: "development",
    status: r.status,
    ...(r.step ? { step: r.step } : {}),
    urgency: "Normal",
    type: "Type 2",
    project: r.project,
    category: "Feature",
    tags: ["Performance", "Development"],
    initiator: r.initiator,
    assignees: [{ name: r.who, points: r.points }],
    startDate: r.start,
    dueDate: r.due,
    cycle: cycleOf(r.start),
    capacityPoints: r.points,
    dateInitiated: daysBefore(r.start, 14),
    dateAccepted: accepted,
    problems: [r.problem],
    solutions: [`${r.title}, built into ${r.project}.`],
    deliverables: [`${r.title} in ${r.project}.`],
    desiredOutcome: "The manual step goes away.",
    files: [],
    links: [],
    history,
    comments: [],
    /* Before every sample AV's, so these sort below them on the lists. */
    updatedAt: `${r.status === "Completed" && r.due < "2026-10-01" ? r.due : "2026-10-01"}T09:00:00Z`,
  };
}

/* Development's Backlog (Planning · 02): Accepted work that was parked, waiting
   to be planned into a cycle. Each shows one way a drop on a cycle goes. */
const backlogAV = (
  n: number,
  title: string,
  problem: string,
  plan: Partial<Pick<AddedValue, "assignees" | "startDate" | "dueDate" | "capacityPoints">>,
): AddedValue => ({
  id: `vcp-${n}`,
  ref: `VCP-${n}`,
  title,
  domain: "development",
  status: "Backlog",
  urgency: "Normal",
  type: "Type 2",
  project: "VCP",
  category: "Improvement",
  tags: ["UX debt", "Development"],
  initiator: "Alice Carter",
  assignees: [],
  ...plan,
  dateInitiated: "2026-09-14",
  dateAccepted: "2026-09-21",
  problems: [problem],
  solutions: [`${title}.`],
  deliverables: [`${title} on the VCP pages.`],
  desiredOutcome: "One less thing to do by hand.",
  files: [],
  links: [],
  remarks: "Parked until there's room in a cycle.",
  history: [
    { actor: "Alice Carter", from: "Pending", to: "Accepted", when: "21/09/2026" },
    { actor: "Alice Carter", from: "Accepted", to: "Backlog", when: "28/09/2026" },
  ],
  comments: [],
  updatedAt: "2026-09-28T09:00:00Z",
});

const BACKLOG_AVS: AddedValue[] = [
  /* Has its dates already, in Cycle 45: a drop just adds it there. */
  backlogAV(1125, "Keyboard shortcuts for the AV table", "Power users reach for the mouse for every row.", {
    assignees: [{ name: "John Mason Smith", points: 3 }],
    capacityPoints: 3,
    startDate: "2026-11-16",
    dueDate: "2026-11-19",
  }),
  /* Assignee and points but no dates: the cycle's estimated dates are filled in. */
  backlogAV(1126, "Copy link to a comment", "Comments can't be pointed at from Slack.", {
    assignees: [{ name: "Alice Carter", points: 2 }],
    capacityPoints: 2,
  }),
  /* Dates in Cycle 47, which isn't on the page yet: it appears, with the AV in it. */
  backlogAV(1127, "Archive search", "Old AVs can't be found once archived.", {
    assignees: [{ name: "Lena Novak", points: 5 }],
    capacityPoints: 5,
    startDate: "2026-12-08",
    dueDate: "2026-12-15",
  }),
  /* No assignee, points or dates: a drop asks for them (Add Required Details). */
  backlogAV(1128, "Bulk export of comments", "Reviews need the comments in a spreadsheet.", {}),
];

export const PLANNING_AVS: AddedValue[] = [...ROWS.map(toAV), ...BACKLOG_AVS];
