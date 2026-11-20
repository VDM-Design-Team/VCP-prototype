import type { TaskLogRow } from "@vdm-design-team/vcp-design-system";

/**
 * The Task Log Trail (DS `TaskLogPage`, Figma `Task_Log_Trail`): one row per change to an Added Value, newest
 * first. Sample data, from the prototype's own Added Values and people; it doesn't follow the moves made in a
 * scenario. Every change is from VCP, so there is no Source filter.
 */
export const TASK_LOG: readonly TaskLogRow[] = [
  { id: "l1", ref: "VCP-1206", task: "Wording for the Gantt chart tooltip", change: { from: { custom: "In design" }, to: { custom: "Design review" }, field: "Workflow" }, source: "VCP", changedAt: "2026-11-05T10:42:00", changedBy: "Eve Kestrel" },
  { id: "l2", ref: "VCP-1207", task: "Export for the task log trail", change: { from: { event: "Handoff" }, to: { status: "Review" }, field: "Status" }, source: "VCP", changedAt: "2026-11-05T09:15:00", changedBy: "Jack Morgan" },
  { id: "l3", ref: "VCP-1199", task: "Saved filters on the AV table", change: { from: { event: "Initial Creation" }, to: { status: "Draft" }, field: "Status" }, source: "VCP", changedAt: "2026-11-04T16:20:00", changedBy: "Eve Kestrel" },
  { id: "l4", ref: "VCP-1205", task: "Filters for the notification inbox", change: { from: { date: "2026-11-12" }, to: { date: "2026-11-02" }, field: "Due Date" }, source: "VCP", changedAt: "2026-11-04T11:05:00", changedBy: "Lena Novak" },
  { id: "l5", ref: "VCP-1204", task: "Holiday registry export", change: { from: { person: "Noah Foster" }, to: { person: "Jack Morgan" }, field: "Assignee" }, source: "VCP", changedAt: "2026-11-03T14:30:00", changedBy: "Lena Novak" },
  { id: "l6", ref: "VCP-1200", task: "Undo for deleted description cards", change: { from: { status: "Draft" }, to: { status: "Pending" }, field: "Status" }, source: "VCP", changedAt: "2026-11-03T09:48:00", changedBy: "Eve Kestrel" },
  { id: "l7", ref: "VCP-1209", task: "Bulk upload for offers", change: { from: { status: "Pending" }, to: { status: "Rejected" }, field: "Status" }, source: "VCP", changedAt: "2026-11-02T17:10:00", changedBy: "Alice Carter" },
  { id: "l8", ref: "VCP-1201", task: "Supplier scorecard on the planning page", change: { from: { status: "Draft" }, to: { status: "Pending" }, field: "Status" }, source: "VCP", changedAt: "2026-11-02T10:00:00", changedBy: "Marvin Ode" },
  { id: "l9", ref: "VCP-1208", task: "Filters for the planning list", change: { from: { custom: "Confirmed prod" }, to: { status: "Completed" }, field: "Status" }, source: "VCP", changedAt: "2026-10-31T15:25:00", changedBy: "John Mason Smith" },
  { id: "l10", ref: "VCP-1205", task: "Filters for the notification inbox", change: { from: { date: "2026-10-27" }, to: { date: "2026-10-29" }, field: "Start Date" }, source: "VCP", changedAt: "2026-10-30T12:40:00", changedBy: "Lena Novak" },
  { id: "l11", ref: "VCP-1210", task: "Dark mode for the email templates", change: { from: { status: "Pending" }, to: { status: "Backlog" }, field: "Status" }, source: "VCP", changedAt: "2026-10-30T09:05:00", changedBy: "Alice Carter" },
  { id: "l12", ref: "VCP-1208", task: "Filters for the planning list", change: { from: { custom: "Ready for deploy" }, to: { custom: "Confirmed prod" }, field: "Workflow" }, source: "VCP", changedAt: "2026-10-29T16:55:00", changedBy: "Maya Bennett" },
  { id: "l13", ref: "VCP-1203", task: "Collapsible sidebar for improved table workspace", change: { from: { status: "Pending" }, to: { status: "Accepted" }, field: "Status" }, source: "VCP", changedAt: "2026-10-29T11:20:00", changedBy: "Lena Novak" },
  { id: "l14", ref: "VCP-1204", task: "Holiday registry export", change: { from: { status: "Accepted" }, to: { status: "In Progress" }, field: "Status" }, source: "VCP", changedAt: "2026-10-28T10:10:00", changedBy: "Noah Foster" },
  { id: "l15", ref: "VCP-1208", task: "Filters for the planning list", change: { from: { custom: "In QA" }, to: { custom: "Ready for deploy" }, field: "Workflow" }, source: "VCP", changedAt: "2026-10-27T14:00:00", changedBy: "Maya Bennett" },
  { id: "l16", ref: "VCP-1202", task: "Empty states for the archive pages", change: { from: { status: "Draft" }, to: { status: "Pending" }, field: "Status" }, source: "VCP", changedAt: "2026-10-27T09:30:00", changedBy: "Eve Kestrel" },
];
