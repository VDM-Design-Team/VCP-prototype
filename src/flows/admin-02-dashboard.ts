import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Admin · 02 Admin dashboard — the flow doc is `flows/admin-02-dashboard.md`, the
 * FigJam page is "Admin · 02 Admin dashboard". The Development admin's dashboard,
 * Cycle or Quarter (Figma's Dashboard Page, 947:304368: Cycle 951:370905, Quarter
 * 961:372017, Swapping Views 964:374002, Cycle Summary States 964:375278), built from
 * the DS dashboard pieces (DashboardHeader, DashboardFilters, CycleSummary,
 * ValueCards, TeamCapacity, UserCapacity, SprintMetrics, CycleBurndown,
 * CyclePerformance) with the rules in src/data/dashboard.ts.
 */

const HOME = "/";
const on = (text: string, target: string): ScenarioStep => ({ text, target: `step:${target}`, path: HOME });
const press = (text: string, button: string): ScenarioStep => ({ text, target: `button:${button}`, path: HOME, action: true });

const base = { status: "Implemented", testing: "Not tested", role: "admin", start: HOME, setup: undefined } as const;
const conditions = "Eve as Admin of Development on the Dashboard; today 05/11/2026, in C44 (27 Oct – 9 Nov).";

export const DASHBOARD_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "admin-02-dashboard.cycle-view",
    steps: [
      on("Admin view, Development: the Dashboard opens on Cycle (Figma 951:370905). On the right: the cycle (C44, the one running), the year, the team, Reset Filters and Export Cycle Report.", "dashboard-header"),
      on("Cycle Summary: 41 points committed in C44, none completed yet. Carried Over is 0 while a cycle runs: it counts what's unfinished when the cycle ends. The gauge reads \"Of plan to date\": completed against what the even burn says should be done by today (about 32), so 0%, red. On track is green from the first days (decided 10 Nov 2026). Bands are Figma's: green from 90%, amber from 70%, red below.", "cycle-summary"),
      on("Value Cards: Figma's four, for whose you pick. Figma shows Assigned (Eve's own): 1 overdue, 2 in progress.", "value-cards"),
      on("In Case You Missed it, as in Activity · 03: the domain's AVs that have been waiting.", "icymi"),
      on("Team Capacity: the team's points by where they stand, then what's free: 19 of 60, the Planning List's Total Capacity for C44 (decided 10 Nov 2026: the two pages agree).", "team-capacity"),
      on("User Capacity: a row each, from their working days. Jack has 12 points on 10 days, so nothing is free. Leave from the Holiday Registry shows as its own part.", "user-capacity"),
      on("Sprint Metrics: this cycle and the three before it: capacity, commitment, completed and overdue.", "sprint-metrics"),
      on("Cycle Burndown: the dashed line burns evenly to zero; Completed is what's actually left, up to today. Point at a day (or Tab to the chart) for its figures.", "burndown"),
    ],
    name: "Read the cycle",
    demonstrates: "The Cycle view, top to bottom (Figma 951:370905).",
    conditions,
    simulated: "Every figure is worked out from the sample AVs, cycles and holidays by the prototype's rules (the flow doc).",
    expected: "C44: 41 committed, 0 completed, 0 carried over, 0% of plan to date; 19 of 60 points free.",
    task: "See how this cycle is going for the Development team.",
  },
  {
    ...base,
    id: "admin-02-dashboard.filters",
    steps: [
      on("Open the cycle list (Figma's, with a search): type 43 and pick C43. Then Next.", "dashboard-header"),
      on("C43 is over: 27 points committed, 3 completed, 24 carried over (unfinished when it ended). A finished cycle's gauge is Completion, completed ÷ committed: 11%, red. Every section below follows the cycle.", "cycle-summary"),
      on("Pick Team Finance in the team list: Jack and Noah only, 8 points, all carried over; their share of the Total Capacity is 17. Then Next.", "dashboard-header"),
      on("Reset Filters: back to C44 and All Teams.", "dashboard-header"),
    ],
    name: "Look back at a cycle",
    demonstrates: "The cycle, year and team filters, and Reset Filters (Figma's dropdowns, 964:375279).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "C43: 27 / 3 / 24, 11%. Team Finance: 8 committed. Reset: C44, All Teams.",
    task: "Check how last cycle ended for the finance team.",
  },
  {
    ...base,
    id: "admin-02-dashboard.quarter-view",
    steps: [
      press("Press Quarter (Figma's Swapping between Cycle and Quarter, 964:374002).", "Quarter"),
      on("Quarter: Domain Budget first (Admin · 01), for Q4 2026, with the super admin's note. This view has no filters at the top (Figma).", "budget-card"),
      on("The same Value Cards.", "value-cards"),
      on("Cycle Performance: each cycle of the quarter, its capacity against what was completed and what ran late. It has its own filters: All or a team, the quarter and the year.", "cycle-performance"),
      on("Press Cycle to go back. The dashboard keeps the view you left it on while you move around the app.", "dashboard-header"),
    ],
    name: "Switch to Quarter",
    demonstrates: "The Quarter view (Figma 961:372017) and the switch between the two.",
    conditions,
    simulated: "Development's Consumed and the cycles' figures come from the sample AVs.",
    expected: "Domain Budget 120 / 94 / 26; Cycle Performance for C43–C48.",
    task: "See how the quarter's budget and cycles are going.",
  },
  {
    ...base,
    id: "admin-02-dashboard.whose",
    steps: [
      on("Value Cards count the AVs assigned to Eve (Figma's choice): 1 overdue, 2 in progress. Pick All: the domain's, 4 overdue, 10 in progress, 2 pending, 1 draft.", "value-cards"),
      on("Initiated: the ones Eve raised (1 in progress, 1 pending, 1 draft). Team: her team's, Team Platform (2 overdue, 4 in progress).", "value-cards"),
    ],
    name: "Whose Added Values",
    demonstrates: "The Value Cards' filter: All, Initiated, Assigned, Team (Figma's list).",
    conditions,
    simulated: "Overdue counts open AVs past their due date (Pending, Draft and Backlog aren't).",
    expected: "Assigned 1/2/0/0; All 4/10/2/1; Initiated 0/1/1/1; Team 2/4/0/0.",
    task: "Compare your own Added Values with the domain's.",
  },
  {
    ...base,
    id: "admin-02-dashboard.export",
    steps: [
      on("Press Export Cycle Report: PDF (.pdf) or CSV (.csv), as Figma lists them. Pick PDF.", "dashboard-header"),
      on("A toast: \"Cycle Report exported\": the PDF is the C44 dashboard as shown, with the filters you picked. CSV would be one row per Added Value in the cycle, with its status, points, assignees and dates (decided 10 Nov 2026).", "dashboard-header"),
    ],
    name: "Export the cycle report",
    demonstrates: "Export Cycle Report and its two formats (Figma 964:375279).",
    conditions,
    simulated: "No file is made: the toast stands in for the download.",
    expected: "\"Cycle Report exported\": PDF, the C44 dashboard for All Teams.",
    task: "Send this cycle's report to the team lead.",
  },
  {
    ...base,
    id: "admin-02-dashboard.other-domain",
    steps: [
      { text: "Open the domain switcher at the top of the rail and pick Design (BESA). Then Next.", target: "button:Domain: Development. Change domain", path: HOME },
      on("Design plans no cycles, so there's no Cycle or Quarter: its Domain Budget, its Value Cards and In Case You Missed it.", "budget-card"),
    ],
    name: "Another domain's dashboard",
    demonstrates: "A domain without cycles (the prototype's rule: Figma's Design Admin dashboard page is empty).",
    conditions: "Eve as Admin of Development, Design (BESA) and Content, on the Dashboard.",
    simulated: "Design (BESA)'s Consumed is a sample figure.",
    expected: "Design (BESA): Domain Budget 80 / 64 / 16, Value Cards, one card in the strip.",
    task: "Check the design team's dashboard.",
  },
];

export const DASHBOARD_FLOW: FlowDef = {
  id: "admin-02-dashboard",
  area: "Admin",
  number: "02",
  name: "Admin dashboard",
  actor: "Admin",
  goal: "See how the domain's cycle and quarter are going: points, capacity, budget and what's waiting.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=80-245",
  doc: "flows/admin-02-dashboard.md",
  status: "Implemented",
  scenarios: DASHBOARD_SCENARIOS,
};
