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
/* Steps Next does for you: tick rows, press a button (the bar's, a menu's or the dialog's), enter a dialog's fields. */
const tick = (path: string, text: string, ...refs: string[]): ScenarioStep => ({
  ...list(path, text),
  enter: Object.fromEntries(refs.map((ref) => [`Select ${ref}`, true])),
});
const press = (path: string, text: string, button: string): ScenarioStep => ({ text, target: `button:${button}`, path, action: true });

const base = { status: "Implemented", testing: "Not tested", setup: undefined } as const;

export const BULK_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-09-bulk-actions.urgency",
    role: "user",
    start: "/assigned",
    steps: [
      tick("/assigned", "Eve's Assigned list. Tick VCP-1204 and VCP-1205, or press Next.", "VCP-1204", "VCP-1205"),
      press("/assigned", "The bar appears under the table: 2 Selected (✕ clears), Status, Urgency, Type, Cycle, Delete. Open Urgency, or press Next.", "Urgency"),
      press("/assigned", "Choose High, or press Next.", "High"),
      press("/assigned", "\"Change Urgency for 2 Added Values\" shows the new value and the list. Press Confirm, or Next.", "Confirm"),
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
      tick(
        "/manage",
        "Admin view, on Manage (Development, the admin's domain). Tick VCP-1200 and VCP-1201 (Pending) and VCP-1205 (Confirmed prod), or press Next.",
        "VCP-1200",
        "VCP-1201",
        "VCP-1205",
      ),
      press("/manage", "Open Status, or press Next.", "Status"),
      press("/manage", "Pending Review opens a submenu (Figma's). Open it, or press Next.", "Pending Review"),
      press("/manage", "Choose Accept, or press Next.", "Accept"),
      press("/manage", "\"Accept 3 Pending Added Values\". All Development, so the dialog offers Multipart Value; leave it off. Press Confirm, or Next.", "Confirm"),
      list(
        "/manage",
        "Two are Accepted (the toast). VCP-1205 isn't Pending, so \"Added Values Failed to Update\" names it and why (Figma 1737:287581). Got it closes it.",
      ),
    ],
    name: "Accept several, some can't be",
    demonstrates: "A bulk change applies to the AVs that can take it and names the rest, with why.",
    conditions: "Eve as Admin on Manage, for Development; two Pending AVs and one at Confirmed prod.",
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
      tick("/manage", "Admin view, Development. Tick VCP-1200 and VCP-1201, both Pending, or press Next.", "VCP-1200", "VCP-1201"),
      press("/manage", "Open Status, or press Next.", "Status"),
      press("/manage", "Open Pending Review, or press Next.", "Pending Review"),
      press("/manage", "Choose Reject, or press Next.", "Reject"),
      press("/manage", "A Rejection Reason is required. Press Confirm with none, or Next.", "Confirm"),
      {
        ...bar("/manage", "Refused: \"Select a rejection reason, or one for each Added Value.\" Pick one for all (Duplicate), or press Next."),
        enter: { "Rejection Reason": "Duplicate" },
      },
      press("/manage", "Open List of Added Values to give one AV its own reason, or press Next.", "List of Added Values"),
      {
        ...press("/manage", "Give VCP-1201 its own (Out of Scope) and press Confirm, or press Next.", "Confirm"),
        enter: { "Rejection reason for VCP-1201": "Out of Scope" },
      },
      list("/manage", "Both are Rejected, each with its reason, and gone from Manage (Archive → Rejected)."),
    ],
    name: "Reject several, one with its own reason",
    demonstrates: "One reason for all, overridden per AV where needed.",
    conditions: "Eve as Admin on Manage, for Development; two Pending AVs.",
    simulated: "Rejecting always succeeds for Pending AVs.",
    expected: "Each AV is Rejected with the bulk reason or its own; the toast confirms; they leave Manage.",
    task: "As an admin, reject both pending Added Values; one of them for a different reason.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.backlog-needs-feedback",
    role: "admin",
    start: "/manage",
    steps: [
      tick("/manage", "Admin view, Development. Tick VCP-1200 and VCP-1201, both Pending, or press Next.", "VCP-1200", "VCP-1201"),
      press("/manage", "Open Status, or press Next.", "Status"),
      press("/manage", "Choose Backlog, or press Next.", "Backlog"),
      press(
        "/manage",
        "\"Move 2 Added Values to Backlog\" asks for Feedback, which is required (decided 13 Nov 2026). Press Confirm with it empty, or Next.",
        "Confirm",
      ),
      {
        ...press(
          "/manage",
          "Refused: \"Enter feedback, or some for each Added Value.\" under the field, and the cursor goes to it. Type feedback for all (\"Parked until next quarter's budget is set\") and press Confirm, or press Next. List of Added Values can give one AV its own; the bulk feedback covers every AV without one.",
          "Confirm",
        ),
        enter: { Feedback: "Parked until next quarter's budget is set" },
      },
      list("/manage", "Both are in the Backlog, each with its feedback as Remarks, and gone from Manage (Archive → Backlogs). The toast says \"Status changed to Backlog for 2 Added Values.\""),
    ],
    name: "Move several to the Backlog",
    demonstrates: "Bulk Backlog needs feedback too: one for all, or one for each Added Value.",
    conditions: "Eve as Admin on Manage, for Development; two Pending AVs.",
    simulated: "The move succeeds for every selected AV once each has feedback.",
    expected: "Confirm with no feedback is refused with \"Enter feedback, or some for each Added Value.\" and nothing moves. With feedback, each AV is in the Backlog with the bulk feedback or its own as Remarks; the toast confirms; they leave Manage.",
    task: "As an admin, park both pending Added Values in the backlog.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.common-steps",
    role: "user",
    start: "/assigned",
    steps: [
      tick(
        "/assigned",
        "Eve's Assigned list, across her domains (an admin's Manage shows one domain at a time, decided 10 Nov 2026). Tick VCP-1204 and VCP-1205, both Development, or press Next.",
        "VCP-1204",
        "VCP-1205",
      ),
      press("/assigned", "Open Status, or press Next.", "Status"),
      bar("/assigned", "Development's steps are there (For review … Confirmed prod), from Figma's list. Close it (Escape), then Next."),
      tick("/assigned", "Now also tick VCP-1206, a Design AV, or press Next.", "VCP-1206"),
      press("/assigned", "Open Status again, or press Next.", "Status"),
      bar("/assigned", "Only what all three share is left (Pending Review, In Progress, Review, Backlog); no domain's own steps (decided 9 Nov 2026). Close it, then Next."),
      press("/assigned", "A change one domain doesn't have: open Cycle, a searchable list, or press Next.", "Cycle"),
      press("/assigned", "Pick a cycle (C45), or press Next.", "C45 (10/11/2026 - 23/11/2026)"),
      press("/assigned", "Press Confirm, or Next.", "Confirm"),
      list("/assigned", "The Development AVs move to that cycle; VCP-1206 fails, named in \"Added Values Failed to Update\": \"Design Added Values have no Cycle.\""),
    ],
    name: "Mixed domains",
    demonstrates: "With AVs from two domains selected, the Status menu offers only the steps every one can take, and a change one domain doesn't have (Cycle, for Design) fails for that domain's AVs.",
    conditions: "Eve as a User on Assigned; two Development AVs and one Design AV.",
    simulated: "Design has no Cycle field (DetailCard leaves it out for Design).",
    expected: "Development's steps with two Development AVs; none of either domain's steps once a Design AV is in the selection. A cycle: a toast for the Development AVs, and the failure summary for the Design one.",
    task: "Move several Added Values to their next step together, then put them in the same cycle.",
  },
  {
    ...base,
    id: "av-09-bulk-actions.delete",
    role: "user",
    start: "/assigned",
    steps: [
      tick("/assigned", "Eve's Assigned list. Tick VCP-1204 and VCP-1206, or press Next.", "VCP-1204", "VCP-1206"),
      press("/assigned", "Press Delete (red, at the end of the bar), or Next.", "Delete"),
      press("/assigned", "The delete confirmation lists every selected AV, one line each. Press Delete, or Next.", "Delete"),
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
