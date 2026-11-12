import { SUBMIT_FLOW } from "./av-01-submit";
import { DRAFT_FLOW } from "./av-03-save-as-draft";
import { EDIT_FLOW } from "./av-04-edit";
import { BACKLOG_FLOW } from "./av-05-move-to-backlog";
import { DECIDE_FLOW } from "./av-06-accept-reject";
import { HANDOFF_FLOW } from "./av-07-hand-off";
import { INITIATE_FLOW } from "./av-08-initiate";
import { BULK_FLOW } from "./av-09-bulk-actions";
import { MULTIPART_FLOW } from "./av-10-multipart";
import { GANTT_FLOW } from "./planning-01-gantt";
import { CYCLES_FLOW } from "./planning-02-cycles";
import { HOLIDAYS_FLOW } from "./planning-03-holidays";
import { REACTIONS_FLOW } from "./activity-01-reactions";
import { NOTIFICATIONS_FLOW } from "./activity-02-notifications";
import { ICYMI_FLOW } from "./activity-03-icymi";
import { BUDGETS_FLOW } from "./admin-01-budgets";
import { DASHBOARD_FLOW } from "./admin-02-dashboard";
import { MANAGE_FLOW } from "./admin-03-manage";
import { SETTINGS_FLOW } from "./admin-04-settings";
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
  HANDOFF_FLOW,
  INITIATE_FLOW,
  BULK_FLOW,
  MULTIPART_FLOW,
  GANTT_FLOW,
  CYCLES_FLOW,
  HOLIDAYS_FLOW,
  REACTIONS_FLOW,
  NOTIFICATIONS_FLOW,
  ICYMI_FLOW,
  BUDGETS_FLOW,
  DASHBOARD_FLOW,
  MANAGE_FLOW,
  SETTINGS_FLOW,
];

export const AREAS = ["AV", "Planning", "Activity", "Admin"] as const;

/** Every runnable scenario, for its static start page. */
export const SCENARIOS = FLOWS.flatMap((f) => f.scenarios.map((s) => ({ flow: f, scenario: s })));

export function findScenario(flowId: string, scenarioKey: string) {
  return SCENARIOS.find((x) => x.flow.id === flowId && x.scenario.id === `${flowId}.${scenarioKey}`);
}
