import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Planning · 02 Plan AVs into cycles — the flow doc is
 * `flows/planning-02-cycles.md`, the FigJam page is "Planning · 02 Plan AVs
 * into cycles". A Development admin drags a Backlog AV onto a cycle on the
 * Planning List (Figma Planning Page 147:9972, Assignee Availability 142:4943):
 * it is Accepted, with its own dates or the cycle's estimated ones, or Add
 * Required Details asks for what it lacks. Dates and points edit in place.
 */

const PATH = "/planning/planning-list";
const on = (text: string, target = "step:planning"): ScenarioStep => ({ text, target, path: PATH });
/* A step inside the dialog: no outline (the dialog is the whole screen). */
const say = (text: string): ScenarioStep => ({ text, path: PATH });
const drop = (text: string, row: string, cycle: string): ScenarioStep => ({ ...on(text), drop: { row, on: cycle } });

const base = { status: "Implemented", testing: "Not tested", role: "admin", start: PATH, setup: undefined } as const;
const conditions = "Eve as Admin on the Planning List; Development's sample AVs, today 05/11/2026 (Cycle 44).";

export const CYCLES_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "planning-02-cycles.own-dates",
    steps: [
      on("Admin view: Planning → Planning List. Development's cycles, each with Total Capacity and Capacity Remaining, then the Backlog. Cycle 43 is still here because it has unfinished work."),
      on("VCP-1125 in the Backlog already has its dates (16–19/11/2026), in Cycle 45. Note Cycle 45's Capacity Remaining."),
      drop("Drag VCP-1125 onto Cycle 45 (Next does it for you). The cycle lights up while the row is over it.", "VCP-1125", "Cycle 45"),
      on("It's in Cycle 45 with its own dates, now Accepted, and Capacity Remaining is 3 points lower. The toast says where it went."),
    ],
    name: "A Backlog AV with its own dates",
    demonstrates: "A drop that just adds the AV to its cycle (Figma 1155:77333).",
    conditions,
    simulated: "Each cycle's Total Capacity is a set number (Cycle 45: 50 points), standing in for an admin's; nothing is saved.",
    expected: "VCP-1125 moves to Cycle 45, Accepted, with its dates unchanged.",
    task: "As an admin, plan the keyboard-shortcuts AV into the next cycle.",
  },
  {
    ...base,
    id: "planning-02-cycles.estimated-dates",
    steps: [
      on("VCP-1126 has an assignee (Alice) and points (2), but no dates."),
      drop("Drag VCP-1126 onto Cycle 44.", "VCP-1126", "Cycle 44"),
      on("It's in Cycle 44 with estimated dates, \"(est.)\": the Start Date is the cycle's next working day, the Due Date a working day per point plus a day's buffer. Both cells play the highlight three times, or until you point at them."),
    ],
    name: "Estimated dates for a cycle",
    demonstrates: "A drop with no dates: the cycle's estimated ones, highlighted (Figma 1155:77293).",
    conditions,
    simulated: "The estimate is the prototype's rule: a point is a working day, plus one day's buffer.",
    expected: "VCP-1126 in Cycle 44, Accepted, both dates estimated and highlighted.",
    task: "As an admin, put the copy-link AV into this cycle and see when it should be done.",
  },
  {
    ...base,
    id: "planning-02-cycles.new-cycle",
    steps: [
      on("VCP-1127's dates (08–15/12/2026) are in Cycle 47, which isn't on the page: no work is planned there yet."),
      drop("Drag VCP-1127 onto Cycle 45.", "VCP-1127", "Cycle 45"),
      on("Cycle 47 appears with VCP-1127 in it: an AV goes to the cycle its Start Date is in. The toast says why it went there and not to Cycle 45."),
    ],
    name: "A cycle that isn't shown yet",
    demonstrates: "A drop whose dates belong to another cycle: that cycle appears (Figma 1155:77350).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "Cycle 47 appears between Cycle 45 and Cycle 49 with VCP-1127 in it.",
    task: "As an admin, plan the archive-search AV.",
  },
  {
    ...base,
    id: "planning-02-cycles.required-details",
    steps: [
      on("VCP-1128 has no assignee, no points and no dates."),
      drop("Drag VCP-1128 onto Cycle 45: it needs details first.", "VCP-1128", "Cycle 45"),
      say("Add Required Details (Figma 142:4943): an estimated Start Date for Cycle 45 and the Cycle; the rest is blank. Pick Maya Bennett with 5 points: she's busy then (the field says so) but can be assigned, and the Due Date is estimated. Set Capacity Points to 5, press Confirm, then Next."),
      on("VCP-1128 is in Cycle 45, Accepted, with Maya and the estimated dates, and focus is on its title. (Cancel would have left it in the Backlog, focus on its title there.)"),
    ],
    name: "Add Required Details",
    demonstrates: "A drop that lacks an assignee or points opens Add Required Details; a busy assignee can still be picked.",
    conditions,
    simulated: "Availability: busy = other scheduled work in those dates; unavailable = leave (Noah Foster, 16–20/11/2026).",
    expected: "The dialog asks; once complete, Confirm plans VCP-1128 into Cycle 45.",
    task: "As an admin, plan the comment-export AV into the next cycle, with whoever can take it.",
  },
  {
    ...base,
    id: "planning-02-cycles.unavailable-assignee",
    steps: [
      drop("Drag VCP-1128 onto Cycle 45.", "VCP-1128", "Cycle 45"),
      say("Pick Noah Foster with 8 points, and Capacity Points 8. The Due Date estimates to 20/11/2026, and Noah is on leave 16–20/11: his field says he can't be assigned (in the list he's under Unavailable, free from Nov 21). Press Confirm: it doesn't go through. The toast \"Unavailable Assignee\" (Figma's copy) and focus on Noah's field. Pick someone else and Confirm, or Cancel, then Next."),
      on("Whichever you chose: confirmed, VCP-1128 is in Cycle 45; cancelled, it's still in the Backlog. Either way, focus is on its title."),
    ],
    name: "An unavailable assignee",
    demonstrates: "Confirm is refused while an assignee is unavailable for the dates (Figma 142:4943).",
    conditions,
    simulated: "Noah Foster's leave, 16–20/11/2026, stands in for the Holiday Registry (Planning · 03).",
    expected: "The error under the field, the toast, and no move until it's fixed.",
    task: "As an admin, try to give the comment-export AV to Noah.",
  },
  {
    ...base,
    id: "planning-02-cycles.between-cycles",
    steps: [
      on("VCP-1110 (Dock scheduling, 13 points) is in Cycle 45. Note Cycle 45's and Cycle 49's Capacity Remaining."),
      drop("Drag VCP-1110 onto Cycle 49 (decided 9 Nov 2026: rows move between cycles too).", "VCP-1110", "Cycle 49"),
      on("It's in Cycle 49 with that cycle's estimated dates, highlighted, and still Accepted. Cycle 45 has 13 points back; Cycle 49 has 13 fewer, and may go below 0 (no warning, as Figma)."),
    ],
    name: "From one cycle to another",
    demonstrates: "A planned AV dragged to another cycle: new estimated dates, both capacities updated.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "VCP-1110 in Cycle 49, dates estimated for it, capacities moved.",
    task: "As an admin, push the dock-scheduling AV to January.",
  },
  {
    ...base,
    id: "planning-02-cycles.back-to-backlog",
    steps: [
      on("Without dragging (decided 9 Nov 2026; DS #335): every row that can move has a Move button (⇅) in the last column. Completed rows have none; a cycle that has ended takes no rows."),
      { ...on("Press VCP-1203's Move button (Tab to it and Enter works too).", "button:Move VCP-1203 to…"), action: true },
      say("A menu of where it can go: the other cycles, with their dates, and the Backlog. Choose Backlog (arrow keys and Enter, or a click), then Next."),
      on("VCP-1203 is in the Backlog, Backlog in its Status History, and focus is on its Move button there. Cycle 45 has its 5 points back. It keeps its assignee and points for when it's planned again."),
    ],
    name: "Back to the Backlog, by keyboard",
    demonstrates: "The row's Move menu, the way to move without dragging, here back to the Backlog.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "VCP-1203 moves to the Backlog; focus follows it.",
    task: "As an admin, take the collapsible-sidebar AV out of this plan, using only the keyboard.",
  },
  {
    ...base,
    id: "planning-02-cycles.edit-in-place",
    steps: [
      on("In Cycle 45, VCP-1112 (Price break rules): 3 points, 10–19/11/2026. Hover the Start Date, Points and Due Date headers: each is editable and changes the others (ƒ)."),
      on("Points → 8 (the pen in the Points cell, then Save). The Due Date is re-estimated, \"(est.)\", and highlighted; Capacity Remaining drops by 5."),
      on("Change the Start Date: it becomes a real date, the Due Date follows, and if the new date is in another cycle the AV moves there."),
      on("Change the Due Date instead: the Start Date is worked back from it, estimated."),
    ],
    name: "Edit dates and points in place",
    demonstrates: "The editable columns, and how each recalculates the other date (Figma's inline-editing flow).",
    conditions,
    simulated: "The same estimate as a drop; nothing is saved.",
    expected: "Each edit updates the row, the other date (estimated, highlighted) and the cycle's capacity.",
    task: "As an admin, VCP-1112 turned out to be bigger: make it 8 points and see when it'll be done.",
  },
];

export const CYCLES_FLOW: FlowDef = {
  id: "planning-02-cycles",
  area: "Planning",
  number: "02",
  name: "Plan AVs into cycles",
  actor: "Dev Admin",
  goal: "Plan Backlog Added Values into cycles, with dates, an assignee and points, and keep the cycles within capacity.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=56-172",
  doc: "flows/planning-02-cycles.md",
  status: "Implemented",
  scenarios: CYCLES_SCENARIOS,
};
