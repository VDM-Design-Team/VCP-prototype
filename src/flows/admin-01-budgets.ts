import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Admin · 01 Domain budgets — the flow doc is `flows/admin-01-budgets.md`, the
 * FigJam page is "Admin · 01 Domain budgets". A super admin sets each domain's
 * development points for a quarter (DS `BudgetTable`, the Domain Budget page from
 * the rail, DS #347); an admin reads their own domain's on the Dashboard (DS
 * `DomainBudgetSummary`). Figma: Domain Budget Edit 696:54963, Dashboard View 696:54964.
 */

const EDIT = "/domain-budget";
const HOME = "/";
const on = (text: string, target = "step:budgets", path = EDIT): ScenarioStep => ({ text, target, path });
const card = (text: string): ScenarioStep => ({ text, target: "step:budget-card", path: HOME });

const superAdmin = { status: "Implemented", testing: "Not tested", role: "super-admin", start: EDIT, setup: undefined } as const;
const admin = { status: "Implemented", testing: "Not tested", role: "admin", start: HOME, setup: undefined } as const;
const conditions = "Eve as Super Admin on Domain Budget; Q4 2026 is the current quarter (today 05/11/2026).";

export const BUDGET_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...admin,
    id: "admin-01-budgets.admin-view",
    steps: [
      card("Admin view, on the Dashboard: Domain Budget, for Development, the admin's domain (Figma 696:55584). Allocated, Consumed and Remaining, the quarter's days left, and Budget Usage."),
      card("Point at an ⓘ: what each figure is (\"for the selected quarter\": a budget is per quarter, never per cycle). The bar is Figma's: blue, amber from 75%, red at 100%. Under it, the super admin's note for the domain (decided 10 Nov 2026)."),
      card("Pick Q3: a past quarter, with its dates and \"Go to Current Quarter\". Pick 2027, then Q1: an upcoming one, with no budget set yet (0 pts)."),
      card("\"Go to Current Quarter\" brings Q4 2026 back."),
    ],
    name: "An admin reads their budget",
    demonstrates: "The Dashboard card: current, past and upcoming quarters, and the usage bar (Figma 696:54964).",
    conditions: "Eve as Admin (Development) on the Dashboard.",
    simulated: "Development's Consumed is the points of its AVs that start in the quarter; nothing is saved.",
    expected: "Q4 2026 current; Q3 past; Q1 2027 upcoming and unset.",
    task: "Check how much of this quarter's budget is left.",
  },
  {
    ...admin,
    id: "admin-01-budgets.switch-domain",
    steps: [
      { text: "An admin can look after several domains (decided 10 Nov 2026). The switcher at the top of the rail says which: Development.", target: "button:Domain: Development. Change domain", path: HOME },
      { text: "Open it and pick Design (BESA). Then Next.", target: "button:Domain: Development. Change domain", path: HOME },
      card("The card is Design (BESA)'s budget now: 80 pts, 80% used, no note. In Case You Missed It shows that domain's AVs too."),
      { text: "Open Manage from the rail: only Design (BESA)'s Added Values. Content has none in the prototype, so its list is empty.", path: "/manage" },
    ],
    name: "Switch domain",
    demonstrates: "The rail's domain switcher (Figma's admin menu) picks the budget, the strip and the lists.",
    conditions: "Eve as Admin of Development, Design (BESA) and Content, on the Dashboard.",
    simulated: "Design (BESA)'s and Content's Consumed are sample figures.",
    expected: "Design (BESA): 80 allocated, 64 consumed, 16 remaining; 2 AVs on Manage.",
    task: "Check Design (BESA)'s budget.",
  },
  {
    ...superAdmin,
    id: "admin-01-budgets.edit",
    steps: [
      on("Super Admin view: Domain Budget, in the rail (DS #347). Every domain's points for the quarter: Q1–Q4 and the year top right, then Allocated, Consumed (with its bar), Remaining and a note. Governance is over budget: -40 pts, in red."),
      on("Raise Development's allocation with its arrows (Figma: stepper input): Remaining and the bar follow at once. Or type a number: they follow after a brief pause (Figma: keyboard input). Whole points only; zero is fine, and so is less than already consumed: the domain shows over budget (decided 10 Nov 2026)."),
      on("Add a note to a domain: the field grows while you write, and folds to one line after."),
      { text: "Press Save Changes: it spins while saving, then \"Changes Saved\" (Figma 701:67752).", target: "button:Save Changes", path: EDIT, action: true },
      on("Saved. Now change an allocation again, and pick Q3 (or a page in the rail) before saving: \"Leave without saving?\" asks first, as on the AV edit page (decided 10 Nov 2026)."),
      on("Keep editing stays, with the edit. Leave drops it and goes. Closing the tab, the browser asks."),
    ],
    name: "Set a quarter's budgets",
    demonstrates: "Editing allocations and notes inline, and saving (Figma's Allocated Points Input flows, 705:82511).",
    conditions,
    simulated: "Saving takes a moment and always works.",
    expected: "The new allocation, Remaining and bar; \"Changes Saved\".",
    task: "Give Development more points this quarter.",
  },
  {
    ...superAdmin,
    id: "admin-01-budgets.new-quarter",
    steps: [
      on("Pick 2027, then Q1: no budgets yet (any quarter can be edited, past ones too: decided 10 Nov 2026). Each Allocated field says \"Set Budget\"; Remaining counts it as 0."),
      on("Type each domain's points (Development 110, say). Then Save Changes and Next."),
      on("Q1 2027 has its budgets. Save saves the quarter you're on; switching with edits not saved asks first."),
    ],
    name: "Budget a new quarter",
    demonstrates: "A quarter with no budget yet (Figma's \"Set Budget\").",
    conditions,
    simulated: "Nothing is saved beyond the prototype.",
    expected: "Q1 2027's allocations, saved.",
    task: "Set next quarter's budgets.",
  },
  {
    ...superAdmin,
    id: "admin-01-budgets.admin-sees-it",
    steps: [
      on("Development has 120 pts this quarter. Raise it (to 150, say), and press Save Changes. Then Next."),
      on("Switch View as to Admin, then open the Dashboard from the rail. Then Next."),
      card("The Domain Budget card shows the new allocation, and Remaining and Budget Usage with it: the admin reads what the super admin saved."),
    ],
    name: "What the admin sees",
    demonstrates: "The super admin's table and the admin's card are the same budgets.",
    conditions,
    simulated: "Nothing is saved beyond the prototype.",
    expected: "The admin's card shows the saved allocation.",
    task: "Raise Development's budget, then check it as Development's admin.",
  },
];

export const BUDGETS_FLOW: FlowDef = {
  id: "admin-01-budgets",
  area: "Admin",
  number: "01",
  name: "Domain budgets",
  actor: "Super Admin edits, Admin views",
  goal: "Give each domain a budget of development points per quarter, and let its admin see how much is left.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=74-186",
  doc: "flows/admin-01-budgets.md",
  status: "Implemented",
  scenarios: BUDGET_SCENARIOS,
};
