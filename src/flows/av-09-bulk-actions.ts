import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 09 Bulk actions — the flow doc is `flows/av-09-bulk-actions.md`, the
 * FigJam page is "AV · 09 Bulk actions". Select rows on an AV list; the bar
 * (DS #279) offers Status, Urgency, Type, Cycle and Delete; each choice opens a
 * confirmation, and Confirm changes every AV that can take it. The ones that
 * can't are named, with why, in "Added Values Failed to Update". The dialogs
 * make the page inert, the walk's card included, so those steps are answered in
 * the dialog and Next is pressed after. Bulk Handoff waits for the shared
 * handoff form (decided 9 Nov 2026).
 */

const list = (path: string, text: string, target = "step:av-list"): ScenarioStep => ({ text, target, path });
const bar = (path: string, text: string): ScenarioStep => ({ text, target: "step:bulk-bar", path });

const base = { status: "Implemented", testing: "Not tested", setup: undefined } as const;

export const BULK_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-09-bulk-actions.urgency",
    role: "user",
    start: "/assigned",
    steps: [
      list("/assigned", "Eve's Assigned list. Tick VCP-1204 and VCP-1205."),
      bar("/assigned", "The bar appears under the table: 2 Selected (✕ clears), Status, Urgency, Type, Cycle, Delete. Choose Urgency → High."),
      bar("/assigned", "\"Change Urgency for 2 Added Values\" shows the new value and the list. Press Confirm, then Next."),
      list("/assigned", "Both read High; the toast says \"Urgency changed to High for 2 Added Values\". The selection clears."),
    ],
    name: "Change the urgency of several",
    demonstrates: "The basic bulk change: select, choose, confirm, toast.",
    conditions: "Eve (User) on Assigned, with three AVs.",
    simulated: "Urgency and Type always change.",
    expected: "The confirmation, then every selected AV at the new urgency and a toast; the bar goes.",
    task: "Two of your assigned Added Values just became more pressing. Mark both as High.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.accept-some-fail",
    role: "admin",
    start: "/manage",
    steps: [
      list("/manage", "Admin view, on Manage. Tick VCP-1201 and VCP-1202 (Pending) and VCP-1205 (Confirmed prod)."),
      bar("/manage", "Status → Pending Review › Accept (a submenu, Figma's)."),
      bar("/manage", "\"Accept 3 Pending Added Values\". Mixed domains, so no Multipart choice. Press Confirm, then Next."),
      list(
        "/manage",
        "Two are Accepted (the toast). VCP-1205 isn't Pending, so \"Added Values Failed to Update\" names it and why (Figma 1737:287581). Got it closes it.",
      ),
    ],
    name: "Accept several, some can't be",
    demonstrates: "A bulk change applies to the AVs that can take it and names the rest, with why.",
    conditions: "Eve as Admin on Manage; two Pending AVs and one at Confirmed prod.",
    simulated: "Pending Review's Accept fails for an AV that isn't Pending (kept: the choice says so; Figma draws no other rule).",
    expected: "A toast for the two accepted, and the failure summary for VCP-1205: \"It's Confirmed prod, not Pending.\"",
    task: "As an admin, accept the Added Values waiting for review in one go.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.reject-with-overrides",
    role: "admin",
    start: "/manage",
    steps: [
      list("/manage", "Admin view. Tick VCP-1201 and VCP-1202, both Pending."),
      bar("/manage", "Status → Pending Review › Reject."),
      bar(
        "/manage",
        "A Rejection Reason is required: Confirm with none says \"Select a rejection reason, or one for each Added Value.\" Pick one for all, open List of Added Values to give one AV its own, Confirm, then Next.",
      ),
      list("/manage", "Both are Rejected, each with its reason, and gone from Manage (Archive → Rejected)."),
    ],
    name: "Reject several, one with its own reason",
    demonstrates: "One reason for all, overridden per AV where needed.",
    conditions: "Eve as Admin on Manage; two Pending AVs.",
    simulated: "Rejecting always succeeds for Pending AVs.",
    expected: "Each AV is Rejected with the bulk reason or its own; the toast confirms; they leave Manage.",
    task: "As an admin, reject both pending Added Values; one of them for a different reason.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.cycle-design",
    role: "admin",
    start: "/manage",
    steps: [
      list("/manage", "Admin view. Tick VCP-1204 (Development) and VCP-1206 (Design)."),
      bar("/manage", "Cycle: a searchable list. Pick any cycle."),
      bar("/manage", "Confirm, then Next."),
      list("/manage", "VCP-1204 moves to that cycle; VCP-1206 fails: \"Design Added Values have no Cycle.\""),
    ],
    name: "Set a cycle across domains",
    demonstrates: "A change one domain doesn't have fails for that domain's AVs.",
    conditions: "Eve as Admin on Manage; a Development AV and a Design AV.",
    simulated: "Design has no Cycle field (DetailCard leaves it out for Design).",
    expected: "A toast for the Development AV, and the failure summary for the Design one.",
    task: "As an admin, put the holiday export and the Gantt tooltip wording into the same cycle.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.common-steps",
    role: "admin",
    start: "/manage",
    steps: [
      list("/manage", "Admin view. Tick VCP-1204 and VCP-1205, both Development."),
      bar("/manage", "Open Status: Development's steps are there (For review … Confirmed prod), from Figma's list. Close it (Escape)."),
      list("/manage", "Now also tick VCP-1206, a Design AV."),
      bar("/manage", "Open Status again: only what all three share is left (Pending Review, In Progress, Review, Backlog); no domain's own steps (decided 9 Nov 2026)."),
    ],
    name: "Only the steps they share",
    demonstrates: "With mixed domains, the Status menu offers only steps every selected AV can take.",
    conditions: "Eve as Admin on Manage; two Development AVs and one Design AV.",
    simulated: "Nothing changes until a choice is confirmed.",
    expected: "Development's steps with two Development AVs; none of either domain's steps once a Design AV is in the selection.",
    task: "As an admin, move several Added Values to their next step together.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.delete",
    role: "user",
    start: "/assigned",
    steps: [
      list("/assigned", "Eve's Assigned list. Tick VCP-1204 and VCP-1206."),
      bar("/assigned", "Press Delete (red, at the end of the bar)."),
      bar("/assigned", "The delete confirmation lists every selected AV, one line each. Press Delete, then Next."),
      list("/assigned", "Both are gone; the toast says \"2 Added Values deleted.\" Figma's bar offers Delete to everyone, so there's no rule against it here."),
    ],
    name: "Delete several",
    demonstrates: "Bulk delete: one confirmation listing every title.",
    conditions: "Eve (User) on Assigned.",
    simulated: "Deleting always succeeds (Figma draws no rule for who may).",
    expected: "The delete confirmation with both titles, then both gone and a toast.",
    task: "Clear two of your assigned Added Values off the list.",
  },
];

export const BULK_FLOW: FlowDef = {
  id: "av-09-bulk-actions",
  area: "AV",
  number: "09",
  name: "Bulk actions",
  actor: "All users (the same bar for everyone)",
  goal: "Change several Added Values at once: status, urgency, type, cycle, or delete them.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=43-72",
  doc: "flows/av-09-bulk-actions.md",
  status: "Implemented",
  scenarios: BULK_SCENARIOS,
};
