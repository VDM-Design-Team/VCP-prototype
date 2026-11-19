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

const base = { status: "Implemented", testing: "Not tested", role: "user", setup: undefined } as const;

export const HANDOFF_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-07-hand-off.overdue",
    start: "/added-values/vcp-1205",
    steps: [
      on("vcp-1205", "VCP-1205: Eve is the assignee, it's at Development's last step, Confirmed prod, and 3 days overdue.", "button:Move to Handoff"),
      on(
        "vcp-1205",
        "Press Move to Handoff. The dialog names the delay and asks why. Press Handoff without a reason: refused, \"Please select a reason before completing the AV\" under Overdue Reason, with the cursor on it. Press Cancel, then Next.",
        "button:Move to Handoff",
      ),
      on(
        "vcp-1205",
        "Nothing moved. Open it again and pick a reason. The AV already has a file (inbox-filters.png), so there is something to review; a demo link is extra. Press Handoff & Publish (or Handoff), then Next.",
        "button:Move to Handoff",
      ),
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
    id: "av-07-hand-off.on-time",
    start: "/added-values/vcp-1206",
    steps: [
      on("vcp-1206", "VCP-1206 is a Design AV at its last step, Design review, and on time.", "button:Move to Handoff"),
      on(
        "vcp-1206",
        "Press Move to Handoff. No banner and no reason: the date (today), links and files. A handoff needs a demo link or an attachment, and this AV has no file yet, so type a link (https://www.figma.com/file/tooltips). Design's footer is Cancel · Handoff. Press Handoff, then Next.",
        "button:Move to Handoff",
      ),
      on("vcp-1206", "In Review: Alice, the initiator, decides it next."),
    ],
    name: "Hand off on time (Design)",
    demonstrates: "An on-time handoff asks for a date and something to review, nothing more; Design's dialog has one Handoff button.",
    conditions: "Eve (User), assignee of the Design AV VCP-1206 at Design review, due 13/11/2026. It has no files attached.",
    simulated: "Handing off succeeds once there is a link or a file. Files and links aren't uploaded anywhere.",
    expected: "No overdue banner or reason. With a demo link, Handoff moves it to Review.",
    task: "Your tooltip copy is done. Hand it over for review.",
  },
  {
    ...base,
    id: "av-07-hand-off.nothing-to-review",
    start: "/added-values/vcp-1206",
    steps: [
      on("vcp-1206", "VCP-1206 is at its last step, on time, and has no files attached.", "button:Move to Handoff"),
      on(
        "vcp-1206",
        "Press Move to Handoff. Under Demo Links: \"A handoff needs at least one demo link or one attachment.\" Press Handoff with only the date: refused, \"Add a demo link or attach a file.\" under Demo Links, and the cursor is in the first link box. Press Cancel, then Next.",
        "button:Move to Handoff",
      ),
      on(
        "vcp-1206",
        "Nothing moved: still Design review. Open it again and give it something to review: type a link (it must start with https://) or attach a file. Press Handoff, then Next.",
        "button:Move to Handoff",
      ),
      on("vcp-1206", "In Review, with the link for Alice to open."),
    ],
    name: "Nothing to review",
    demonstrates: "A handoff with neither a demo link nor an attachment is refused (decided 13 Nov 2026).",
    conditions: "Eve (User), assignee of the Design AV VCP-1206 at Design review. It has no files attached.",
    simulated: "Handing off is refused while there is no link and no file; with either, it succeeds.",
    expected: "Handoff with only a date: \"Add a demo link or attach a file.\" under Demo Links, focus in the first link box, and the dialog stays open. The message goes once a link is typed or a file attached, and Handoff then moves the AV to Review.",
    task: "Your tooltip copy is done. Hand it over for review; you have nothing to show for it yet.",
  },
  {
    ...base,
    id: "av-07-hand-off.review-accept",
    start: "/added-values/vcp-1207",
    steps: [
      on("vcp-1207", "VCP-1207 is Eve's, and Jack handed it off: it's in Review. The initiator decides: Reject or Accept.", "button:Accept"),
      on(
        "vcp-1207",
        "Press Accept. The review shows what was handed off: the estimate, the completion date, links and files. Press Accept in it, then Next.",
        "button:Accept",
      ),
      on("vcp-1207", "Completed: the toast's link opens Archive → Completed."),
    ],
    name: "Accept the handed-off work",
    demonstrates: "The initiator reviews the handoff and accepts it: Review → Completed.",
    conditions: "Eve (User), initiator of VCP-1207, which Jack handed off.",
    simulated: "Accepting always succeeds.",
    expected: "The review dialog with the handoff's details; Accept moves it to Completed, listed in Archive → Completed.",
    task: "Jack finished your Task Log export. Check it and sign it off.",
  },
  {
    ...base,
    id: "av-07-hand-off.review-reject",
    start: "/added-values/vcp-1207",
    steps: [
      on("vcp-1207", "In Review, the initiator can also send it back.", "button:Reject"),
      on(
        "vcp-1207",
        "Press Reject. A reason dialog opens over the review (Figma 791:99377); pick a handoff rejection reason and press Reject. Then Next.",
        "button:Reject",
      ),
      on("vcp-1207", "Sent back to Confirmed prod, Development's last step: Jack fixes it and hands it off again. The toast gives the reason."),
    ],
    name: "Send the work back",
    demonstrates: "The initiator rejects a handoff with a reason: it returns to the domain's last step.",
    conditions: "Eve (User), initiator of VCP-1207 in Review.",
    simulated: "Rejecting always succeeds.",
    expected: "The reason dialog over the review; the AV goes back to Confirmed prod with a toast.",
    task: "Jack's Task Log export isn't right. Send it back and say why.",
  },
  {
    ...base,
    id: "av-07-hand-off.admin",
    role: "admin",
    start: "/added-values/vcp-1205",
    steps: [
      on("vcp-1205", "Admin view: at the last step an admin's button reads just \"Handoff\" (the assignee's reads \"Move to Handoff\").", "button:Handoff"),
      on("vcp-1205", "Press Handoff, give the overdue reason, and hand it off: the AV's own file is what there is to review. Then Next.", "button:Handoff"),
      on("vcp-1205", "In Review, an admin can decide it too: Reject or Accept, like the initiator.", "button:Accept"),
    ],
    name: "An admin hands off and reviews",
    demonstrates: "An admin can hand off at the last step and decide the review.",
    conditions: "Eve as Admin, on VCP-1205 at Confirmed prod (overdue).",
    simulated: "Handing off and reviewing always succeed.",
    expected: "The same dialogs; the admin's button reads \"Handoff\", and the review's Reject and Accept are theirs too.",
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
