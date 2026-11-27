import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 07 Hand off — the flow doc is `flows/av-07-hand-off.md`, the FigJam
 * page is "AV · 07 Hand off". The assignee hands the finished work on from the
 * domain's last step (`HandoffAVModal`); the AV waits in Review until its
 * initiator (or an admin) accepts it (`ReviewAVModal`): Completed, or sent back
 * to the last step. A handoff needs something to review: at least one demo
 * link or one attachment (decided 13 Nov 2026, design system 1.2.0); a file
 * already on the AV counts. The dialogs make the page inert, the walk's card
 * included, so those steps are answered in the dialog and Next is pressed after.
 */

const on = (id: string, text: string, target = "step:av-menu"): ScenarioStep => ({ text, target, path: `/added-values/${id}` });
/* A step Next does for you: it presses the target. */
const press = (id: string, text: string, target: string): ScenarioStep => ({ ...on(id, text, target), action: true });

const base = { status: "Implemented", testing: "Not tested", role: "user", setup: undefined } as const;

export const HANDOFF_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-07-hand-off.on-time",
    start: "/added-values/vcp-1206",
    steps: [
      press("vcp-1206", "VCP-1206 is a Design AV at its last step, Design review, and on time. It has no files attached. Press Move to Handoff, or Next.", "button:Move to Handoff"),
      press(
        "vcp-1206",
        "No banner and no reason: the date (today), links and files. Under Demo Links: \"A handoff needs at least one demo link or one attachment.\" Press Handoff with only the date, or Next.",
        "button:Handoff",
      ),
      on("vcp-1206", "Refused: \"Add a demo link or attach a file.\" under Demo Links, and the cursor is in the first link box.", "button:Handoff"),
      {
        ...press(
          "vcp-1206",
          "Give it something to review: type a link (it must start with https://) or attach a file, and the message goes. Design's footer is Cancel · Handoff. Press Handoff, or Next.",
          "button:Handoff",
        ),
        enter: { "Demo link 1": "https://www.figma.com/file/tooltips" },
      },
      on("vcp-1206", "In Review, with the link for Alice, the initiator, to open. She decides it next."),
    ],
    name: "Hand off on time (Design)",
    demonstrates: "An on-time handoff asks for a date and something to review, nothing more: with neither a demo link nor an attachment it's refused (decided 13 Nov 2026). Design's dialog has one Handoff button.",
    conditions: "Eve (User), assignee of the Design AV VCP-1206 at Design review, due 13/11/2026. It has no files attached.",
    simulated: "Handing off is refused while there is no link and no file; with either, it succeeds. Files and links aren't uploaded anywhere.",
    expected: "No overdue banner or reason. Handoff with only a date: \"Add a demo link or attach a file.\" under Demo Links, focus in the first link box, and the dialog stays open. With a link, Handoff moves it to Review.",
    task: "Your tooltip copy is done. Hand it over for review.",
  },
  {
    ...base,
    id: "av-07-hand-off.overdue",
    start: "/added-values/vcp-1205",
    steps: [
      press("vcp-1205", "VCP-1205: Eve is the assignee, it's at Development's last step, Confirmed prod, and 3 days overdue. Press Move to Handoff, or Next.", "button:Move to Handoff"),
      press("vcp-1205", "The dialog names the delay and asks why. Press Handoff without a reason, or Next.", "button:Handoff"),
      on("vcp-1205", "Refused: \"Please select a reason before completing the AV\" under Overdue Reason, with the cursor on it.", "button:Handoff"),
      {
        ...press(
          "vcp-1205",
          "Pick a reason. The AV already has a file (inbox-filters.png), so there is something to review; a demo link is extra. Press Handoff (or Handoff & Publish), or Next.",
          "button:Handoff",
        ),
        enter: { "Overdue Reason": "Dependencies" },
      },
      on("vcp-1205", "In Review now: Marvin, the initiator, decides it next (the toast says so). Eve has no more moves."),
    ],
    name: "Hand off late work",
    demonstrates: "A late handoff has to say why: the overdue reason is required.",
    conditions: "Eve (User), assignee of VCP-1205 at Confirmed prod, due 02/11/2026: 3 days overdue.",
    simulated: "Handing off always succeeds. Files and links aren't uploaded anywhere.",
    expected: "The overdue banner and a required reason; without one, an error under it and nothing moves. With one, and the AV's own file as the thing to review, the AV moves to Review and a toast names who reviews it.",
    task: "Your work on the CSV export is live but late. Hand it over for review.",
  },
  {
    ...base,
    id: "av-07-hand-off.review-accept",
    start: "/added-values/vcp-1207",
    steps: [
      on(
        "vcp-1207",
        "VCP-1207 is Eve's, and Jack handed it off: it's in Review. This is the initiator checking finished work, not AV · 06's decision on a proposal.",
        "button:Accept",
      ),
      {
        ...on("vcp-1207", "The initiator decides: Accept signs the work off, Reject sends it back to be fixed. Which?", "button:Accept"),
        options: [
          { label: "Accept: it's done", goto: "accept" },
          { label: "Reject: send it back", goto: "reject" },
        ],
      },
      { id: "accept", ...press("vcp-1207", "Press Accept, or Next.", "button:Accept") },
      press("vcp-1207", "The review shows what was handed off: the estimate, the completion date, links and files. Press Accept in it, or Next.", "button:Accept"),
      { ...on("vcp-1207", "Completed: the toast's link opens Archive → Completed."), next: "end" },
      { id: "reject", ...press("vcp-1207", "Press Reject, or Next.", "button:Reject") },
      press("vcp-1207", "The same review opens. Press Reject in it, or Next.", "button:Reject"),
      {
        ...press("vcp-1207", "A reason dialog opens over the review (Figma 791:99377). Pick a handoff rejection reason and press Reject, or press Next.", "button:Reject"),
        enter: { "Rejection Reason": "Functionality" },
      },
      on(
        "vcp-1207",
        "Sent back to Confirmed prod, Development's last step: Jack fixes it and hands it off again. Unlike AV · 06's Reject, the AV isn't turned down: it goes on. The toast gives the reason.",
      ),
      { id: "end", text: "Either way, Status History logs the review." },
    ],
    name: "Review the handoff",
    demonstrates: "The initiator reviews handed-off work: Accept moves it Review → Completed; Reject (with a reason) sends it back to the domain's last step.",
    conditions: "Eve (User), initiator of VCP-1207, which Jack handed off.",
    simulated: "Accepting and rejecting always succeed.",
    expected: "The review dialog with the handoff's details. Accept: Completed, listed in Archive → Completed. Reject: the reason dialog over the review, then the AV back at Confirmed prod with a toast.",
    task: "Jack finished your Task Log export. Check it, then sign it off or send it back.",
  },
  {
    ...base,
    id: "av-07-hand-off.admin",
    role: "admin",
    start: "/added-values/vcp-1205",
    steps: [
      press("vcp-1205", "Admin view: at the last step an admin's button reads \"Move to Handoff\", the same as the assignee's (DS 2.0.0, decided 17 Nov 2026). Press it, or Next.", "button:Move to Handoff"),
      {
        ...press("vcp-1205", "Give the overdue reason and hand it off: the AV's own file is what there is to review. Press Handoff, or Next.", "button:Handoff"),
        enter: { "Overdue Reason": "Dependencies" },
      },
      on("vcp-1205", "In Review, an admin can decide it too: Reject or Accept, like the initiator.", "button:Accept"),
    ],
    name: "An admin hands off and reviews",
    demonstrates: "An admin can hand off at the last step and decide the review.",
    conditions: "Eve as Admin, on VCP-1205 at Confirmed prod (overdue).",
    simulated: "Handing off and reviewing always succeed.",
    expected: "The same dialogs; the admin's button reads \"Move to Handoff\" too, and the review's Reject and Accept are theirs too.",
    task: "As an admin, hand off the late CSV export, then sign it off.",
  },
];

export const HANDOFF_FLOW: FlowDef = {
  id: "av-07-hand-off",
  area: "AV",
  number: "07",
  name: "Hand off",
  actor: "The assignee hands off; the initiator or an admin reviews",
  goal: "Hand finished work over for review, and have it signed off or sent back.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=38-72",
  doc: "flows/av-07-hand-off.md",
  status: "Implemented",
  scenarios: HANDOFF_SCENARIOS,
};
