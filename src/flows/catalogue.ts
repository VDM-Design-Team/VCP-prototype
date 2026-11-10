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
import { DISCARD_FLOW } from "./av-02-discard";
import type { FlowDef } from "./types";

/* Every VCP flow, in the FigJam Index's order. All are built (10 Nov 2026); a new one that has no scenarios
   yet would be Planned: in the catalogue, marked unavailable, with no Start. */

export const FLOWS: readonly FlowDef[] = [
  SUBMIT_FLOW,
  DISCARD_FLOW,
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
