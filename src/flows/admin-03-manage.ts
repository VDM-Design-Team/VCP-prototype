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
      { ...on("Pick Priority › High, or press Next: only VCP-1201 (Supplier scorecard on the planning page). Every filter change goes back to page 1."), enter: { Priority: "High" } },
      {
        ...on("Press Reset Filters (all 18 again), then pick Date › Last month (October); or press Next. The Added Values that were live then, initiated by 31/10 and not closed before 01/10: 13 of the 18 (decided 10 Nov 2026: a period is when they were live, not their due date)."),
        target: "button:Last month",
        action: true,
        first: ["button:Reset Filters", "button:Date"],
      },
      {
        ...on("Reset Filters again, open Assignee (Figma's Filter by Assignee and Clear, 940:171256): Unassigned first, then the people, with a search. Pick Jack Morgan, or press Next: his 4 Added Values. The field says \"Jack Morgan\", and a ✕ has appeared before the caret (DS #361)."),
        first: ["button:Reset Filters"],
        enter: { Assignee: "Jack Morgan" },
      },
      on("Who's on each (Figma's Member Tooltip, 2007:182514): point at a face on VCP-1204: \"Alice Carter (Development) — Initiator\". The initiator comes first, then the assignees (DS #359); someone who is both says \"Initiator, Assignee\", and with four or more people the +N lists the rest. A screen reader hears the same from the stack's name."),
      { ...on("Press the Assignee ✕, or Next: the field is empty again, focus is back on it, and the list is all 18."), target: "button:Clear Assignee", action: true },
      { ...on("Under the table: First, the pages, Last; Items; \"1-10 of 18\" (DS #360). Press 2, or Next: \"11-18 of 18\". Every list pages like this now (decided 10 Nov 2026)."), target: "button:Page 2", action: true },
      { ...on("Pick Items › 25, or press Next: one page, and back to page 1."), enter: { Items: "25" } },
      on("Filters hides the fields (and shows them again); the search stays."),
    ],
    name: "Find an Added Value",
    demonstrates: "Manage's card: search, the filter fields, Reset Filters and Filters (Figma 940:167946); filtering by assignee and clearing it (940:171256); the members' tooltip (2007:182514); and the pagination.",
    conditions,
    simulated: "An AV's life runs from initiated to completed or rejected; open ones are still live (the flow doc). Home domains are the prototype's: the planning team is Development's, anyone else Design's. Ten a page in the prototype; real data starts at 50 (decided).",
    expected: "High: 1 (VCP-1201). Last month: 13. Jack Morgan: 4 (VCP-1207, VCP-1204, VCP-1109, VCP-1110). Cleared: 18. Page 2: 11-18 of 18.",
    task: "Find the high-priority Added Values in Development, then what Jack is working on and who else is on it.",
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
