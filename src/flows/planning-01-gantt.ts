import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Planning · 01 Gantt — the flow doc is `flows/planning-01-gantt.md`, the
 * FigJam page is "Planning · 01 Gantt". An admin reads who is doing what over
 * time on the DS GanttChart (Figma page Gantt Chart, 1006:25630): the cycle,
 * month and year views, a person's row, a bar's tooltip, and the project and
 * user filters. The sample data's "today" is 5 November 2026, in Cycle 44.
 */

const PATH = "/planning/gantt-chart";
const on = (text: string, target = "step:gantt"): ScenarioStep => ({ text, target, path: PATH });

const base = { status: "Implemented", testing: "Not tested", role: "admin", start: PATH, setup: undefined } as const;

export const GANTT_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "planning-01-gantt.views",
    steps: [
      on("Admin view: Planning → Gantt Chart opens on the cycle around today, Cycle 44 (27/10–09/11/2026), which crosses into November. The hatched column is today."),
      on("Set View to Monthly: a month at a time."),
      on("Now Yearly: the whole year, finished work from January on. The period picker beside the arrows jumps straight to a cycle, month or year."),
      on("The arrows (Previous period, Next period) step a period at a time; Today brings the chart back to today.", "button:Today"),
    ],
    name: "Cycle, month and year",
    demonstrates: "The three views and the navigator (Figma's Cycle, Month and Year selected in Filter).",
    conditions: "Eve as Admin on the Gantt Chart; sample planning data, today 05/11/2026.",
    simulated: "The data is fixed sample planning data.",
    expected: "The cycle view by default; Monthly and Yearly from View; the arrows and the period picker move; Today returns.",
    task: "As an admin, see what the team has on this month, then over the whole year.",
  },
  {
    ...base,
    id: "planning-01-gantt.a-persons-row",
    steps: [
      on("Each closed row sums up a person's work. Open John Mason Smith's row.", "button:John Mason Smith"),
      on("Open, it shows each of his tasks as a bar, from start to due date, and his figures: WIP, Planned, EAD (earliest available date) and EAD TD."),
      on("Hover (or tab to) a bar: its tooltip gives the title, status, initiator and estimated due date (Figma's Tooltip); the bar itself shows the project and points."),
    ],
    name: "A person's row and a bar's tooltip",
    demonstrates: "Opening a person's row, and what a bar's tooltip says.",
    conditions: "Eve as Admin on the Gantt Chart.",
    simulated: "The data is fixed sample planning data.",
    expected: "The row opens to one bar per task; the tooltip opens on hover and on keyboard focus.",
    task: "As an admin, find when John's invoice export was due, and whether it's late.",
  },
  {
    ...base,
    id: "planning-01-gantt.by-project",
    steps: [
      on("Open Projects and pick VCP and NT.", "button:Projects"),
      on("The rows regroup by project: each project, then the people working on it (Figma's User and Project Filter Interaction)."),
      on("Reset Filters puts every project and person back.", "button:Reset Filters"),
    ],
    name: "Group by project",
    demonstrates: "Picking projects regroups the rows by project.",
    conditions: "Eve as Admin on the Gantt Chart.",
    simulated: "The data is fixed sample planning data.",
    expected: "Rows under VCP and NT only, people under each; Reset Filters restores everything.",
    task: "As an admin, see who is working on VCP and NT.",
  },
  {
    ...base,
    id: "planning-01-gantt.by-person",
    steps: [
      on("Open Users and pick Alice Carter and Jack Morgan.", "button:Users"),
      on("Only their rows stay. Add a project too (Projects → WHU): both filters apply together."),
      on("Reset Filters clears both.", "button:Reset Filters"),
    ],
    name: "Filter by person",
    demonstrates: "The user filter, alone and with the project filter.",
    conditions: "Eve as Admin on the Gantt Chart.",
    simulated: "The data is fixed sample planning data.",
    expected: "Only the chosen people; with a project, only their work on it; Reset Filters clears both.",
    task: "As an admin, check what Alice and Jack have on the WHU project.",
  },
];

export const GANTT_FLOW: FlowDef = {
  id: "planning-01-gantt",
  area: "Planning",
  number: "01",
  name: "Gantt",
  actor: "Admin",
  goal: "See who is doing what over time, and when people are free, across a team or a set of projects.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=50-72",
  doc: "flows/planning-01-gantt.md",
  status: "Implemented",
  scenarios: GANTT_SCENARIOS,
};
