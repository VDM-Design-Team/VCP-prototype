import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Admin · 03 Manage added values — the flow doc is `flows/admin-03-manage.md`, the
 * FigJam page is "Admin · 03 Manage added values". An admin finds the domain's
 * Added Values on Manage: search, Figma's filters (Priority, Tags, Status, Date,
 * Assignee, Initiator), the members' tooltip and the pages. Figma: Manage Added Values
 * page 940:164973 (page 940:167946, Filter by Assignee and Clear 940:171256, Member
 * Tooltip 2007:182514).
 */

const MANAGE = "/manage";
const on = (text: string): ScenarioStep => ({ text, target: "step:av-list", path: MANAGE });

const base = { status: "Implemented", testing: "Not tested", role: "admin", start: MANAGE, setup: undefined } as const;
const conditions = "Eve as Admin of Development, on Manage: the domain's 18 open Added Values.";

export const MANAGE_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "admin-03-manage.filters",
    steps: [
      on("Admin view: Manage, for Development (the rail's domain). One card, as Figma draws it (940:167946): Search by title or ID at the left, Reset Filters and Filters at the right, then the fields, each labelled: Priority, Tags, Status, Date, Assignee, Initiator (DS #363). 18 open Added Values, 10 a page (real data: 50)."),
      on("Pick Priority › High: only VCP-1201 (Supplier scorecard on the planning page). Every filter change goes back to page 1."),
      on("Reset Filters: all 18 again. Then Date › Last month (October): the Added Values that were live then, initiated by 31/10 and not closed before 01/10: 13 of the 18 (decided 10 Nov 2026: a period is when they were live, not their due date)."),
      on("Reset Filters again. Filters hides the fields (and shows them again); the search stays."),
    ],
    name: "Filter the list",
    demonstrates: "Manage's card: search, the filter fields, Reset Filters and Filters (Figma 940:167946).",
    conditions,
    simulated: "An AV's life runs from initiated to completed or rejected; open ones are still live (the flow doc).",
    expected: "High: 1 (VCP-1201). Reset: 18. Last month: 13 (the five initiated in November or later drop out).",
    task: "Find the high-priority Added Values in Development.",
  },
  {
    ...base,
    id: "admin-03-manage.assignee",
    steps: [
      on("Open Assignee (Figma's Filter by Assignee and Clear, 940:171256): Unassigned first, then the people, with a search."),
      on("Pick Jack Morgan: his 4 Added Values. The field under the Assignee label says \"Jack Morgan\", and a ✕ has appeared before the caret (DS #361). Then Next."),
      on("Press the ✕: the field is empty again, focus is back on it, and the list is all 18."),
    ],
    name: "Filter by assignee and clear",
    demonstrates: "Figma's drawn flow: pick an assignee, then clear the field (940:171256).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "Jack Morgan: 4 (VCP-1207, VCP-1204, VCP-1109, VCP-1110). Cleared: 18.",
    task: "See what Jack is working on, then go back to everything.",
  },
  {
    ...base,
    id: "admin-03-manage.members",
    steps: [
      on("Members (Figma's Member Tooltip, 2007:182514): point at a face for who it is, their domain and what they are: \"Alice Carter (Development) — Initiator\" on VCP-1204. The initiator comes first, then the assignees (DS #359)."),
      on("Someone who raised it and works on it says \"Initiator, Assignee\". With four or more people the +N lists the rest, one to a line. A screen reader hears the same from the stack's name."),
    ],
    name: "Who's on it",
    demonstrates: "The members' tooltip with domains and roles (Figma 2007:182514).",
    conditions,
    simulated: "Home domains are the prototype's: the planning team is Development's, anyone else Design's.",
    expected: "VCP-1204: Alice Carter (Development) — Initiator; Eve Kestrel and Jack Morgan (Development) — Assignee.",
    task: "Check who's involved in the holiday registry export.",
  },
  {
    ...base,
    id: "admin-03-manage.pages",
    steps: [
      on("Under the table: First, the pages, Last; Items; \"1-10 of 18\" (DS #360). Press 2: the other 8, \"11-18 of 18\". Every list pages like this now (decided 10 Nov 2026)."),
      on("Pick Items › 25: one page, \"1-18 of 18\". Changing Items goes back to page 1."),
    ],
    name: "Page through",
    demonstrates: "Figma's pagination with Items and the range (940:167946).",
    conditions,
    simulated: "Ten a page in the prototype, so the sample's 18 show two pages; real data starts at 50 (decided).",
    expected: "Page 2: 11-18 of 18. Items 25: 1-18 of 18.",
    task: "Look at the rest of the list.",
  },
];

export const MANAGE_FLOW: FlowDef = {
  id: "admin-03-manage",
  area: "Admin",
  number: "03",
  name: "Manage added values",
  actor: "Admin",
  goal: "Find the Added Values that need an admin's attention, by who, what and when, and see who is on each.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=83-257",
  doc: "flows/admin-03-manage.md",
  status: "Implemented",
  scenarios: MANAGE_SCENARIOS,
};
