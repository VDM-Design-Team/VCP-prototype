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
/* The admin's card is on the Dashboard's Quarter view (Admin · 02, Figma 961:372017). */
const admin = { status: "Implemented", testing: "Not tested", role: "admin", start: HOME, setup: undefined, dashboardView: "quarter" } as const;
const conditions = "Eve as Super Admin on Domain Budget; Q4 2026 is the current quarter (today 05/11/2026).";

export const BUDGET_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...admin,
    id: "admin-01-budgets.admin-view",
    steps: [
      card("Admin view, on the Dashboard's Quarter view (Admin · 02): Domain Budget, for Development, the admin's domain (Figma 696:55584). Allocated, Consumed and Remaining, the quarter's days left, and Budget Usage."),
      card("Point at an ⓘ: what each figure is (\"for the selected quarter\": a budget is per quarter, never per cycle). The bar is Figma's: blue, amber from 75%, red at 100%. Under it, the super admin's note for the domain (decided 10 Nov 2026)."),
      card("Pick Q3: a past quarter, with its dates and \"Go to Current Quarter\". Pick 2027, then Q1: an upcoming one, with no budget set yet (0 pts). \"Go to Current Quarter\" brings Q4 2026 back."),
      { text: "Eve looks after several domains (decided 10 Nov 2026). The switcher at the top of the rail says which: Development. Open it and pick Design (BESA). Then Next.", target: "button:Domain: Development. Change domain", path: HOME },
      card("The card is Design (BESA)'s budget now: 80 pts, 80% used, no note. In Case You Missed It and Manage show that domain's Added Values too."),
    ],
    name: "An admin reads their budget",
    demonstrates: "The Dashboard card: current, past and upcoming quarters, the usage bar (Figma 696:54964), and the rail's domain switcher picking whose budget it is.",
    conditions: "Eve as Admin of Development, Design (BESA) and Content, on the Dashboard.",
    simulated: "Development's Consumed is the points of its AVs that start in the quarter; Design (BESA)'s and Content's are sample figures. Nothing is saved.",
    expected: "Q4 2026 current; Q3 past; Q1 2027 upcoming and unset; Design (BESA): 80 allocated, 64 consumed, 16 remaining.",
    task: "Check how much of this quarter's budget is left, here and in Design (BESA).",
  },
  {
    ...superAdmin,
    id: "admin-01-budgets.edit",
    steps: [
      on("Super Admin view: Domain Budget, in the rail (DS #347). Every domain's points for the quarter: Q1–Q4 and the year top right, then Allocated, Consumed (with its bar), Remaining and a note. Governance is over budget: -40 pts, in red."),
      on("Raise Development's allocation (120 pts) with its arrows (Figma: stepper input): Remaining and the bar follow at once. Or type a number: they follow after a brief pause (Figma: keyboard input). Whole points only; zero is fine, and so is less than already consumed: the domain shows over budget (decided 10 Nov 2026)."),
      on("Add a note to a domain: the field grows while you write, and folds to one line after."),
      { text: "Press Save Changes: it spins while saving, then \"Changes saved\" (Figma 701:67752).", target: "button:Save Changes", path: EDIT, action: true },
      on("Next quarter: pick 2027, then Q1. No budgets yet (any quarter can be edited, past ones too: decided 10 Nov 2026). Each Allocated field says \"Set Budget\"; Remaining counts it as 0."),
      on("Type Development's points (110, say). Now pick Q4 before saving: \"Leave without saving?\" asks first, as on the AV edit page (decided 10 Nov 2026). Keep editing stays, with the edit; Leave drops it and goes. Closing the tab, the browser asks."),
      on("Keep editing, then Save Changes: Q1 2027 has its budget. Save saves the quarter you're on. Then Next."),
      on("Switch View as to Admin, then open the Dashboard from the rail and press Quarter. Then Next."),
      card("Development's Domain Budget card shows Q4's new allocation, and Remaining and Budget Usage with it: the admin reads what the super admin saved."),
    ],
    name: "Set a quarter's budgets",
    demonstrates: "Editing allocations and notes inline, saving (Figma's Allocated Points Input flows, 705:82511), a quarter with no budget yet (\"Set Budget\"), and the admin's card reading the same budgets.",
    conditions,
    simulated: "Saving takes a moment and always works. Nothing is saved beyond the prototype.",
    expected: "The new allocation, Remaining and bar; \"Changes saved\"; Q1 2027's budget; the admin's card shows Q4's saved allocation.",
    task: "Give Development more points this quarter, set next quarter's, then check it as Development's admin.",
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
