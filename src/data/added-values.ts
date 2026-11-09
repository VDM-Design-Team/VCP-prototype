import type {
  AVChainStep,
  AVStatus,
  AVType,
  AVUrgency,
  CommentData,
  DeliverableFile,
  DeliverableLinkItem,
  StatusHistoryEntry,
} from "@vdm-design-team/vcp-design-system";
import { CYCLES, TODAY } from "./gantt";

/* Sample Added Values for the AV pages and the lists that lead to them.
   No real people or work. "Today" is the Gantt chart's: 5 November 2026. */

/** Who the prototype is signed in as — the name in the top bar. */
export const VIEWER = { id: "u-eve", name: "Eve Kestrel" };

/**
 * References kept free for Added Values created in the prototype. The site is
 * static, so each needs its page built ahead (see generateStaticParams on
 * /added-values/[id]): the first twenty new AVs get vcp-1211 … vcp-1230.
 */
export const NEW_AV_IDS = Array.from({ length: 20 }, (_, i) => `vcp-${1211 + i}`);

export type AVDomain = "development" | "design";

/* Each domain's own steps after In Progress. A domain names these itself,
   so they are data here, not design-system vocabulary. */
export const CHAINS: Record<AVDomain, readonly AVChainStep[]> = {
  development: [
    { id: "for-review", label: "For review" },
    { id: "for-qa", label: "For QA" },
    { id: "in-qa", label: "In QA" },
    { id: "ready-for-deploy", label: "Ready for deploy" },
    { id: "confirmed-prod", label: "Confirmed prod" },
  ],
  design: [
    { id: "in-design", label: "In design" },
    { id: "design-review", label: "Design review" },
  ],
};

export interface Handoff {
  date: string;
  links: string[];
  attachments: string[];
  overdueReason?: string;
}

export interface AddedValue {
  /** The route segment: /added-values/vcp-1203. */
  id: string;
  /** "VCP-1203". */
  ref: string;
  title: string;
  domain: AVDomain;
  /** Where it is on the shared spine. */
  status: AVStatus;
  /** A step of the domain's chain, once past In Progress. Wins over `status` for what is shown. */
  step?: string;
  urgency: AVUrgency;
  type: AVType;
  project: string;
  category: string;
  tags: string[];
  initiator: string;
  assignees: { name: string; points?: number }[];
  startDate?: string;
  dueDate?: string;
  cycle?: string;
  capacityPoints?: number;
  dateInitiated: string;
  dateAccepted?: string;
  problems: string[];
  solutions: string[];
  deliverables: string[];
  desiredOutcome: string;
  files: DeliverableFile[];
  links: DeliverableLinkItem[];
  history: StatusHistoryEntry[];
  comments: CommentData[];
  /** ISO date-time, for sorting. */
  updatedAt: string;
  /** Set when something changes in the prototype: "Just now". */
  updatedLabel?: string;
  rejection?: { reason: string; detail?: string };
  /** The Feedback given when it was moved to the Backlog (AV · 05), shown as Remarks. */
  remarks?: string;
  handoff?: Handoff;
}

/** What an AV's status reads as: its chain step's name, or its spine status. */
export const stageLabel = (av: Pick<AddedValue, "domain" | "status" | "step">) =>
  (av.step && CHAINS[av.domain].find((s) => s.id === av.step)?.label) || av.status;

/** The statuses that move an AV off the working lists and into Archive. */
export const ARCHIVED: readonly AVStatus[] = ["Completed", "Rejected", "Backlog"];

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.floor(Date.parse(iso.length === 10 ? `${iso}T00:00:00Z` : iso) / DAY);

/** Whole days an AV is past its due date, or 0. */
export const daysOverdue = (av: Pick<AddedValue, "dueDate">) =>
  av.dueDate ? Math.max(0, dayOf(TODAY) - dayOf(av.dueDate)) : 0;

/** "7 days ago", counted from the prototype's today, so it never drifts between build and browser. */
export const updatedLabel = (av: Pick<AddedValue, "updatedAt" | "updatedLabel">) => {
  if (av.updatedLabel) return av.updatedLabel;
  const days = dayOf(TODAY) - dayOf(av.updatedAt);
  return days <= 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
};

/** The cycles in the shape DetailCard's options take. */
export const CYCLE_OPTIONS = CYCLES.map((c) => ({ value: c.id, code: c.short ?? c.label, start: c.start, end: c.end }));

const text = (s: string) => [{ type: "text" as const, text: s }];

export const ADDED_VALUES: AddedValue[] = [
  /* Eve's own: a draft she started and a Pending AV she submitted (AV · 03, AV · 04). */
  {
    id: "vcp-1199",
    ref: "VCP-1199",
    title: "Saved filters on the AV table",
    domain: "development",
    status: "Draft",
    urgency: "Normal",
    type: "Type 2",
    project: "VCP",
    category: "Improvement",
    tags: ["UX debt", "Frontend"],
    initiator: VIEWER.name,
    assignees: [],
    dateInitiated: "2026-11-04",
    problems: ["Everyone sets the same status and assignee filters on the AV table every morning."],
    solutions: ["Let people save a set of filters under a name and pick it from the filter bar."],
    deliverables: [],
    desiredOutcome: "",
    files: [],
    links: [],
    history: [{ actor: VIEWER.name, from: "Initial Creation", to: "Draft", when: "Yesterday" }],
    comments: [],
    updatedAt: "2026-11-04T16:20:00Z",
  },
  {
    id: "vcp-1200",
    ref: "VCP-1200",
    title: "Undo for deleted description cards",
    domain: "development",
    status: "Pending",
    urgency: "Normal",
    type: "Type 3",
    project: "VCP",
    category: "Improvement",
    tags: ["UX debt", "Frontend"],
    initiator: VIEWER.name,
    assignees: [],
    dateInitiated: "2026-11-03",
    problems: ["Removing a problem or solution card can't be taken back; people retype whole paragraphs."],
    solutions: ["Show an Undo snackbar for 15 seconds after a card is removed."],
    deliverables: ["Undo restores the removed card, in its place, with its text."],
    desiredOutcome: "Nobody retypes a card they removed by mistake.",
    files: [],
    links: [],
    history: [{ actor: VIEWER.name, from: "Draft", to: "Pending", when: "2 days ago" }],
    comments: [],
    updatedAt: "2026-11-03T11:05:00Z",
  },
  {
    id: "vcp-1201",
    ref: "VCP-1201",
    title: "Supplier scorecard on the planning page",
    domain: "development",
    status: "Pending",
    urgency: "High",
    type: "Type 1",
    project: "VCP",
    category: "Improvement",
    tags: ["Performance", "Development"],
    initiator: "Marvin Ode",
    assignees: [],
    dateInitiated: "2026-11-02",
    problems: ["Planners can't see which suppliers are behind until a delivery is already late."],
    solutions: ["Show a scorecard per supplier on the planning page, with their overdue count and trend."],
    deliverables: ["A scorecard panel on the planning page.", "A CSV export of the scorecard."],
    desiredOutcome: "Late suppliers are chased within a day of slipping.",
    files: [{ id: "f1", name: "scorecard-brief.pdf", kind: "pdf" }],
    links: [],
    history: [{ actor: "Marvin Ode", from: "Draft", to: "Pending", when: "3 days ago" }],
    comments: [
      {
        id: "c1",
        author: { id: "u-marvin", name: "Marvin Ode" },
        time: "2 days ago",
        createdAt: "2026-11-03T09:12:00Z",
        body: text("The planning team asked for this twice in the last retro."),
      },
    ],
    updatedAt: "2026-11-02T10:00:00Z",
  },
  {
    id: "vcp-1202",
    ref: "VCP-1202",
    title: "Empty states for the archive pages",
    domain: "design",
    status: "Pending",
    urgency: "Normal",
    type: "Type 3",
    project: "VCP",
    category: "Improvement",
    tags: ["Accessibility", "Design"],
    initiator: "Lena Novak",
    assignees: [],
    dateInitiated: "2026-11-04",
    problems: ["An empty archive page shows a bare table header, which reads as broken."],
    solutions: ["Design an empty state for Completed, Rejected and Backlogs."],
    deliverables: ["Three empty states in Figma, light and dark."],
    desiredOutcome: "Nobody reports an empty archive as a bug again.",
    files: [],
    links: [],
    history: [{ actor: "Lena Novak", from: "Draft", to: "Pending", when: "Yesterday" }],
    comments: [],
    updatedAt: "2026-11-04T15:30:00Z",
  },
  {
    id: "vcp-1203",
    ref: "VCP-1203",
    title: "Collapsible sidebar for improved table workspace",
    domain: "development",
    status: "Accepted",
    urgency: "Normal",
    type: "Type 2",
    project: "VCP",
    category: "Improvement",
    tags: ["UX debt", "Development"],
    initiator: "Marvin Ode",
    assignees: [{ name: VIEWER.name, points: 5 }],
    startDate: "2026-11-09",
    dueDate: "2026-11-20",
    cycle: "c45",
    capacityPoints: 5,
    dateInitiated: "2026-10-20",
    dateAccepted: "2026-10-28",
    problems: ["Wide tables are cramped next to the open rail on a laptop screen."],
    solutions: ["Let the rail collapse to its icons, and remember the choice between pages."],
    deliverables: ["A collapse toggle on the rail.", "The choice kept while moving between pages."],
    desiredOutcome: "Tables show every column on a 1440 screen.",
    files: [{ id: "f1", name: "table-widths.png", kind: "image" }],
    links: [{ id: "l1", title: "Figma: collapsed rail", url: "https://www.figma.com/", domain: "design" }],
    history: [
      { actor: "Marvin Ode", from: "Draft", to: "Pending", when: "2 weeks ago" },
      { actor: "Alice Carter", from: "Pending", to: "Accepted", when: "8 days ago" },
    ],
    comments: [],
    updatedAt: "2026-10-28T11:00:00Z",
  },
  {
    id: "vcp-1204",
    ref: "VCP-1204",
    title: "Holiday registry export",
    domain: "development",
    status: "In Progress",
    step: "in-qa",
    urgency: "Low",
    type: "Type 3",
    project: "VCP",
    category: "Feature",
    tags: ["Performance", "Development"],
    initiator: "Alice Carter",
    assignees: [
      { name: VIEWER.name, points: 3 },
      { name: "Jack Morgan", points: 2 },
    ],
    startDate: "2026-10-26",
    dueDate: "2026-11-12",
    cycle: "c44",
    capacityPoints: 5,
    dateInitiated: "2026-10-12",
    dateAccepted: "2026-10-20",
    problems: ["HR copies the holiday registry into a spreadsheet by hand every month."],
    solutions: ["Add a CSV export to the Holiday Registry."],
    deliverables: ["An Export button on the Holiday Registry that downloads a CSV."],
    desiredOutcome: "The monthly copy takes one click.",
    files: [],
    links: [{ id: "l1", title: "Pull request", url: "https://github.com/", domain: "development" }],
    history: [
      { actor: "Alice Carter", from: "Pending", to: "Accepted", when: "2 weeks ago" },
      { actor: VIEWER.name, from: "Accepted", to: "In Progress", when: "10 days ago" },
      { actor: VIEWER.name, from: "For QA", to: "In QA", when: "2 days ago" },
    ],
    comments: [],
    updatedAt: "2026-11-03T14:00:00Z",
  },
  {
    id: "vcp-1205",
    ref: "VCP-1205",
    title: "Filters for the notification inbox",
    domain: "development",
    status: "In Progress",
    step: "confirmed-prod",
    urgency: "Urgent",
    type: "Type 1",
    project: "VCP",
    category: "Feature",
    tags: ["UX debt", "Development"],
    initiator: "Marvin Ode",
    assignees: [{ name: VIEWER.name, points: 8 }],
    startDate: "2026-10-19",
    dueDate: "2026-11-02",
    cycle: "c43",
    capacityPoints: 8,
    dateInitiated: "2026-10-05",
    dateAccepted: "2026-10-12",
    problems: ["The notification inbox has no way to find older mentions."],
    solutions: ["Filter the inbox by type and by Added Value."],
    deliverables: ["Type and Added Value filters above the inbox.", "Filters kept in the URL."],
    desiredOutcome: "A mention from last month is found in seconds.",
    files: [{ id: "f1", name: "inbox-filters.png", kind: "image", domain: "design" }],
    links: [
      { id: "l1", title: "Figma: inbox filters", url: "https://www.figma.com/", domain: "design" },
      { id: "l2", title: "Pull request", url: "https://github.com/", domain: "development" },
    ],
    history: [
      { actor: "Alice Carter", from: "Pending", to: "Accepted", when: "3 weeks ago" },
      { actor: VIEWER.name, from: "Ready for deploy", to: "Confirmed prod", when: "Yesterday" },
    ],
    comments: [
      {
        id: "c1",
        author: { id: "u-marvin", name: "Marvin Ode" },
        time: "Yesterday",
        createdAt: "2026-11-04T16:40:00Z",
        body: text("Looks good on prod. Can you hand it off today? It's past due."),
      },
    ],
    updatedAt: "2026-11-04T16:00:00Z",
  },
  {
    id: "vcp-1206",
    ref: "VCP-1206",
    title: "Wording for the Gantt chart tooltip",
    domain: "design",
    status: "In Progress",
    step: "design-review",
    urgency: "Normal",
    type: "Type 3",
    project: "VCP",
    category: "Improvement",
    tags: ["Accessibility", "Design"],
    initiator: "Alice Carter",
    assignees: [{ name: VIEWER.name, points: 2 }],
    startDate: "2026-11-02",
    dueDate: "2026-11-13",
    capacityPoints: 2,
    dateInitiated: "2026-10-27",
    dateAccepted: "2026-10-30",
    problems: ["Planners read the tooltip's “Est. Due Date” as the date it was promised."],
    solutions: ["Reword the tooltip's labels and test them with three planners."],
    deliverables: ["New tooltip wording in Figma."],
    desiredOutcome: "Planners read the dates correctly first time.",
    files: [],
    links: [{ id: "l1", title: "Figma: tooltip copy", url: "https://www.figma.com/", domain: "design" }],
    history: [{ actor: VIEWER.name, from: "In design", to: "Design review", when: "Today" }],
    comments: [],
    updatedAt: "2026-11-05T09:00:00Z",
  },
  {
    id: "vcp-1207",
    ref: "VCP-1207",
    title: "Export for the task log trail",
    domain: "development",
    status: "Review",
    urgency: "Normal",
    type: "Type 2",
    project: "VCP",
    category: "Feature",
    tags: ["Performance", "Development"],
    initiator: VIEWER.name,
    assignees: [{ name: "Jack Morgan", points: 5 }],
    startDate: "2026-10-19",
    dueDate: "2026-11-06",
    cycle: "c44",
    capacityPoints: 5,
    dateInitiated: "2026-10-01",
    dateAccepted: "2026-10-08",
    problems: ["Auditors ask for the task log as a file."],
    solutions: ["Export the filtered task log as CSV."],
    deliverables: ["An Export button on the Task Log Trail."],
    desiredOutcome: "Audit requests are answered the same day.",
    files: [{ id: "f1", name: "task-log.csv", kind: "csv", domain: "development" }],
    links: [{ id: "l1", title: "Demo video", url: "https://example.com/demo", domain: "development" }],
    history: [{ actor: "Jack Morgan", from: "Confirmed prod", to: "Review", when: "Yesterday" }],
    comments: [],
    updatedAt: "2026-11-04T12:00:00Z",
    handoff: { date: "04-11-2026", links: ["https://example.com/demo"], attachments: ["task-log.csv"] },
  },
  {
    id: "vcp-1208",
    ref: "VCP-1208",
    title: "Filters for the planning list",
    domain: "development",
    status: "Completed",
    urgency: "Normal",
    type: "Type 2",
    project: "VCP",
    category: "Feature",
    tags: ["UX debt", "Development"],
    initiator: "Alice Carter",
    assignees: [{ name: VIEWER.name, points: 3 }],
    startDate: "2026-10-14",
    dueDate: "2026-10-23",
    cycle: "c43",
    capacityPoints: 3,
    dateInitiated: "2026-10-01",
    dateAccepted: "2026-10-06",
    problems: ["The planning list can't be narrowed to one assignee."],
    solutions: ["Add assignee and status filters."],
    deliverables: ["Assignee and status filters above the planning list."],
    desiredOutcome: "A planner finds one person's work in one step.",
    files: [],
    links: [],
    history: [{ actor: "Alice Carter", from: "Review", to: "Completed", when: "12 days ago" }],
    comments: [],
    updatedAt: "2026-10-24T10:00:00Z",
  },
  {
    id: "vcp-1209",
    ref: "VCP-1209",
    title: "Bulk upload for offers",
    domain: "development",
    status: "Rejected",
    urgency: "Low",
    type: "Type 3",
    project: "VCP",
    category: "Feature",
    tags: ["Performance", "Development"],
    initiator: "Lena Novak",
    assignees: [],
    dateInitiated: "2026-10-15",
    problems: ["Offers are entered one at a time."],
    solutions: ["Upload a spreadsheet of offers."],
    deliverables: ["A spreadsheet upload on the offers page."],
    desiredOutcome: "A price list goes in in minutes.",
    files: [],
    links: [],
    history: [{ actor: "Alice Carter", from: "Pending", to: "Rejected", when: "2 weeks ago" }],
    comments: [],
    updatedAt: "2026-10-22T10:00:00Z",
    rejection: { reason: "duplicate" },
  },
  {
    id: "vcp-1210",
    ref: "VCP-1210",
    title: "Dark mode for the email templates",
    domain: "design",
    status: "Backlog",
    urgency: "Low",
    type: "Type 3",
    project: "VCP",
    category: "Improvement",
    tags: ["Accessibility", "Design"],
    initiator: "Noah Foster",
    assignees: [],
    dateInitiated: "2026-09-30",
    problems: ["Our emails glare in a dark mail client."],
    solutions: ["Dark variants of the four email templates."],
    deliverables: ["Dark email templates in Figma."],
    desiredOutcome: "Emails look right in every mail client.",
    files: [],
    links: [],
    remarks: "Parked until the design domain has capacity next quarter.",
    history: [{ actor: "Alice Carter", from: "Pending", to: "Backlog", when: "A month ago" }],
    comments: [],
    updatedAt: "2026-10-05T10:00:00Z",
  },
];
