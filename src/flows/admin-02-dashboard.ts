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
      on("Value Cards: Figma's four, counting the AVs assigned to Eve (Figma's choice): 1 overdue, 2 in progress.", "value-cards"),
      { ...on("Pick All, or press Next: the domain's, 4 overdue, 10 in progress, 2 pending, 1 draft.", "value-cards"), enter: { "Whose Added Values": "All" } },
      {
        ...on("Initiated is the ones Eve raised (1 in progress, 1 pending, 1 draft). Pick Team, or press Next: her team's, Team Platform (2 overdue, 4 in progress).", "value-cards"),
        enter: { "Whose Added Values": "Team" },
      },
      on("In Case You Missed it, as in Activity · 03: the domain's AVs that have been waiting.", "icymi"),
      on("Team Capacity: the team's points by where they stand, then what's free: 19 of 60, the Planning List's Total Capacity for C44 (decided 10 Nov 2026: the two pages agree).", "team-capacity"),
      on("User Capacity: a row each, from their working days. Jack has 12 points on 10 days, so nothing is free. Leave from the Holiday Registry shows as its own part.", "user-capacity"),
      on("Sprint Metrics: this cycle and the three before it: capacity, commitment, completed and overdue.", "sprint-metrics"),
      on("Cycle Burndown: the dashed line burns evenly to zero; Completed is what's actually left, up to today. Point at a day (or Tab to the chart) for its figures.", "burndown"),
    ],
    name: "Read the cycle",
    demonstrates: "The Cycle view, top to bottom (Figma 951:370905), and the Value Cards' filter: All, Initiated, Assigned, Team (Figma's list).",
    conditions,
    simulated: "Every figure is worked out from the sample AVs, cycles and holidays by the prototype's rules (the flow doc). Overdue counts open AVs past their due date (Pending, Draft and Backlog aren't).",
    expected: "C44: 41 committed, 0 completed, 0 carried over, 0% of plan to date; 19 of 60 points free. Value Cards: Assigned 1/2/0/0; All 4/10/2/1; Initiated 0/1/1/1; Team 2/4/0/0.",
    task: "See how this cycle is going for the Development team, and how your own Added Values compare.",
  },
  {
    ...base,
    id: "admin-02-dashboard.filters",
    steps: [
      { ...on("Open the cycle list (Figma's, with a search): type 43 and pick C43, or press Next.", "dashboard-header"), enter: { Cycle: "C43" } },
      on("C43 is over: 27 points committed, 3 completed, 24 carried over (unfinished when it ended). A finished cycle's gauge is Completion, completed ÷ committed: 11%, red. Every section below follows the cycle.", "cycle-summary"),
      {
        ...on("Pick Team Finance in the team list, or press Next: Jack and Noah only, 8 points, all carried over; their share of the Total Capacity is 17.", "dashboard-header"),
        enter: { Team: "Team Finance" },
      },
      {
        ...on("Press Export Cycle Report: PDF (.pdf) or CSV (.csv), as Figma lists them. Pick PDF, or press Next.", "dashboard-header"),
        target: "button:PDF*",
        action: true,
        first: ["button:Export Cycle Report"],
      },
      on("A toast: \"Cycle Report exported\": the PDF is the dashboard as shown, C43 for Team Finance. CSV would be one row per Added Value in the cycle, with its status, points, assignees and dates (decided 10 Nov 2026).", "dashboard-header"),
      { ...on("Press Reset Filters, or Next.", "dashboard-header"), target: "button:Reset Filters", action: true },
      on("Back to C44 and All Teams.", "dashboard-header"),
    ],
    name: "Look back at a cycle, and export it",
    demonstrates: "The cycle, year and team filters, Reset Filters, and Export Cycle Report with its two formats (Figma's dropdowns, 964:375279).",
    conditions,
    simulated: "Nothing is saved. No file is made: the toast stands in for the download.",
    expected: "C43: 27 / 3 / 24, 11%. Team Finance: 8 committed. \"Cycle Report exported\". Reset: C44, All Teams.",
    task: "Check how last cycle ended for the finance team, and send its report to the team lead.",
  },
  {
    ...base,
    id: "admin-02-dashboard.quarter-view",
    steps: [
      press("Press Quarter (Figma's Swapping between Cycle and Quarter, 964:374002), or Next.", "Quarter"),
      on("Quarter: Domain Budget first (Admin · 01), for Q4 2026, with the super admin's note. This view has no filters at the top (Figma).", "budget-card"),
      on("The same Value Cards.", "value-cards"),
      on("Cycle Performance: each cycle of the quarter, its capacity against what was completed and what ran late. It has its own filters: All or a team, the quarter and the year.", "cycle-performance"),
      press("Press Cycle to go back, or Next. The dashboard keeps the view you left it on while you move around the app.", "Cycle"),
      {
        text: "A domain that plans no cycles: open the domain switcher at the top of the rail and pick Design (BESA), or press Next.",
        target: "button:Design (BESA)",
        path: HOME,
        action: true,
        first: ["button:Domain: Development. Change domain"],
      },
      on("No Cycle or Quarter: its Domain Budget, its Value Cards and In Case You Missed it.", "budget-card"),
    ],
    name: "Switch to Quarter",
    demonstrates: "The Quarter view (Figma 961:372017), the switch between the two, and a domain without cycles (the prototype's rule: Figma's Design Admin dashboard page is empty).",
    conditions: "Eve as Admin of Development, Design (BESA) and Content, on the Dashboard; today 05/11/2026, in C44 (27 Oct – 9 Nov).",
    simulated: "Development's Consumed and the cycles' figures come from the sample AVs; Design (BESA)'s Consumed is a sample figure.",
    expected: "Domain Budget 120 / 94 / 26; Cycle Performance for C43–C48. Design (BESA): Domain Budget 80 / 64 / 16, Value Cards, one card in the strip.",
    task: "See how the quarter's budget and cycles are going, here and in Design.",
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
