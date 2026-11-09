import { SUBMIT_FLOW } from "./av-01-submit";
import { DRAFT_FLOW } from "./av-03-save-as-draft";
import { EDIT_FLOW } from "./av-04-edit";
import { BACKLOG_FLOW } from "./av-05-move-to-backlog";
import { DECIDE_FLOW } from "./av-06-accept-reject";
import type { FlowDef } from "./types";

/* Every VCP flow, in the FigJam Index's order. A flow with no scenarios yet is
   Planned: it stays in the catalogue, marked unavailable, with no Start. */
const planned = (area: FlowDef["area"], number: string, name: string, actor: string): FlowDef => ({
  id: `${area.toLowerCase()}-${number}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`,
  area,
  number,
  name,
  actor,
  goal: "",
  status: "Planned",
  scenarios: [],
});

export const FLOWS: readonly FlowDef[] = [
  SUBMIT_FLOW,
  planned("AV", "02", "Discard", "All users"),
  DRAFT_FLOW,
  EDIT_FLOW,
  BACKLOG_FLOW,
  DECIDE_FLOW,
  planned("AV", "07", "Hand off", "All users"),
  planned("AV", "08", "Initiate to another domain", "All users"),
  planned("AV", "09", "Bulk actions", "All users"),
  planned("AV", "10", "Multipart", "Dev Admin"),
  planned("Planning", "01", "Gantt", "Admin"),
  planned("Planning", "02", "Plan AVs into cycles", "Dev Admin"),
  planned("Planning", "03", "Holiday registry", "Admin edits, User views"),
  planned("Activity", "01", "Comment reactions", "All users"),
  planned("Activity", "02", "Notifications", "All users"),
  planned("Activity", "03", "In case you missed it", "All users"),
  planned("Admin", "01", "Domain budgets", "Super Admin edits, Admin views"),
  planned("Admin", "02", "Admin dashboard", "Admin"),
  planned("Admin", "03", "Manage added values", "Admin"),
  planned("Admin", "04", "Users, tags and domains", "Admin, Super Admin"),
];

export const AREAS = ["AV", "Planning", "Activity", "Admin"] as const;

/** Every runnable scenario, for its static start page. */
export const SCENARIOS = FLOWS.flatMap((f) => f.scenarios.map((s) => ({ flow: f, scenario: s })));

export function findScenario(flowId: string, scenarioKey: string) {
  return SCENARIOS.find((x) => x.flow.id === flowId && x.scenario.id === `${flowId}.${scenarioKey}`);
}
