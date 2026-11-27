import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 05 Move to backlog — the flow doc is `flows/av-05-move-to-backlog.md`,
 * the FigJam page is "AV · 05 Move to backlog". Figma `1090:27191`: from the
 * ⋮ menu, the Feedback dialog (`MoveToBacklogModal`), then the AV stays open,
 * now Backlog, with the feedback as Remarks. Feedback is required (decided
 * 13 Nov 2026, design system 1.2.0): Move to Backlog stays off until something
 * is typed. The dialog makes the rest of the page inert, the walk's card
 * included, so its steps are answered in the dialog and Next is pressed after.
 */

const menu = (text: string, id: string): ScenarioStep => ({ text, target: "step:av-menu", path: `/added-values/${id}` });
/* A press on the AV's page: the ⋮ menu (a `step:` target presses its button), a menu item, a dialog's button. Next
   presses it; pressing it yourself moves the walk on too. The dialog makes the card inert, so its presses are yours. */
const press = (text: string, target: string, id: string): ScenarioStep => ({ text, target, path: `/added-values/${id}`, action: true });

const base = { status: "Implemented", testing: "Not tested", setup: undefined } as const;

export const BACKLOG_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-05-move-to-backlog.own-draft",
    role: "user",
    start: "/added-values/vcp-1199",
    steps: [
      menu("VCP-1199 is Eve's draft. On a draft, the ⋮ menu has Move to Backlog.", "vcp-1199"),
      press("Open ⋮.", "step:av-menu", "vcp-1199"),
      press("Choose Move to Backlog.", "button:Move to Backlog", "vcp-1199"),
      press(
        "The dialog asks for Feedback, which is required (decided 13 Nov 2026): the cursor is in the field, and with it empty, or with only spaces in it, Move to Backlog stays off and Enter does nothing. Type something, then press Cancel.",
        "button:Cancel",
        "vcp-1199",
      ),
      press("Nothing moved: it's still a Draft. Open ⋮ again.", "step:av-menu", "vcp-1199"),
      press("Choose Move to Backlog.", "button:Move to Backlog", "vcp-1199"),
      {
        ...press(
          "The field is empty: it resets every time. Type why (\"Waiting for the filter bar redesign\"): Move to Backlog turns on. Press it, or Next.",
          "button:Move to Backlog",
          "vcp-1199",
        ),
        enter: { Feedback: "Waiting for the filter bar redesign" },
      },
      {
        text: "It stays open, now Backlog. A yellow banner, \"This Added Value was moved to the backlog\", shows the feedback (Figma 1090:27191); the toast's link opens the archive.",
        target: "step:remarks",
        path: "/added-values/vcp-1199",
      },
      {
        text: "Open Archive → Backlogs in the sidebar, or press Next.",
        path: "/added-values/vcp-1199",
        open: "/archive/backlogs",
      },
      { text: "It's listed in Archive → Backlogs, and gone from Drafts. Open it from the list, or press Next.", target: "step:av-list", path: "/archive/backlogs", open: "/added-values/vcp-1199" },
      { ...menu("To bring it back, Eve opens ⋮ → Edit (her Backlog menu has Edit and Delete), or presses Next.", "vcp-1199"), open: "/added-values/vcp-1199/edit" },
      {
        text: "On the edit page, press Save as draft. On a Backlog AV it moves it back to Draft (decided 9 Nov 2026, Figma's rule).",
        target: "button:Save as draft",
        path: "/added-values/*/edit",
        action: true,
      },
      menu("Back to Draft: the Remarks are gone, and it's on Drafts again.", "vcp-1199"),
    ],
    name: "Move your draft to the backlog, and back",
    demonstrates: "The initiator parks a draft in the Backlog with a reason (Remarks), then brings it back with Edit → Save as draft. Nothing goes to the Backlog without feedback; Cancel moves nothing, and the dialog starts empty each time.",
    conditions: "Eve (User) on her draft VCP-1199.",
    simulated: "The move always succeeds.",
    expected: "The Feedback dialog, with Move to Backlog off until feedback is typed (spaces don't count, and there is no error message). Cancel closes it with nothing changed, and it opens empty again. Then the AV in Backlog with a \"moved to the backlog\" banner, a toast, and the AV listed in Archive → Backlogs. Edit → Save as draft moves it back to Draft.",
    task: "You won't work on your saved-filters draft for a while. Park it, and say why.",
  },
  {
    ...base,
    id: "av-05-move-to-backlog.admin-pending",
    role: "admin",
    start: "/added-values/vcp-1201",
    steps: [
      menu("Admin view. VCP-1201 is Marvin's, Pending. An admin's ⋮ on Pending has Move to Backlog and Move to Draft.", "vcp-1201"),
      press("Open ⋮.", "step:av-menu", "vcp-1201"),
      press("Choose Move to Backlog.", "button:Move to Backlog", "vcp-1201"),
      { ...press("Type a reason, then press Move to Backlog; or press Next.", "button:Move to Backlog", "vcp-1201"), enter: { Feedback: "Needs a supplier list first" } },
      {
        text: "Backlog, with Remarks. An admin can decide it from here: Reject and Accept in the header (Figma 1094:97734; DS #330).",
        target: "step:remarks",
        path: "/added-values/vcp-1201",
      },
      {
        text: "Decide it, or send it back? The ⋮ menu has Move to Pending and Move to Draft; the header has Reject and Accept.",
        target: "step:av-menu",
        path: "/added-values/vcp-1201",
        options: [
          { label: "Accept it", goto: "accept" },
          { label: "Reject it", goto: "reject" },
          { label: "Move to Pending", goto: "pending" },
          { label: "Move to Draft", goto: "draft" },
        ],
      },
      { id: "accept", text: "Press Accept and confirm: Accepted, as from Pending (AV · 06). The Remarks go.", target: "button:Accept", path: "/added-values/vcp-1201", next: "end" },
      { id: "reject", text: "Press Reject, pick a reason and confirm: Rejected, as from Pending (AV · 06). The Remarks go.", target: "button:Reject", path: "/added-values/vcp-1201", next: "end" },
      { id: "pending", text: "Open ⋮ → Move to Pending: back in the admins' queue; the Remarks go.", target: "step:av-menu", path: "/added-values/vcp-1201", next: "end" },
      { id: "draft", text: "Open ⋮ → Move to Draft: back with Marvin, on his Drafts; the Remarks go.", target: "step:av-menu", path: "/added-values/vcp-1201" },
      { id: "end", text: "Status History logs each move." },
    ],
    name: "Admin parks a Pending AV",
    demonstrates: "An admin moves someone's Pending AV to the Backlog, then decides it from there or sends it back.",
    conditions: "Eve as Admin, on Marvin's Pending AV VCP-1201.",
    simulated: "The moves always succeed.",
    expected: "The Feedback dialog (feedback required), the AV in Backlog with Remarks. From there: Accept or Reject in the header, or Move to Pending / Move to Draft from the ⋮ menu.",
    task: "As an admin, park Marvin's supplier scorecard in the backlog, then put it back in the queue.",
  },
];

export const BACKLOG_FLOW: FlowDef = {
  id: "av-05-move-to-backlog",
  area: "AV",
  number: "05",
  name: "Move to backlog",
  actor: "The initiator (own Draft); an admin (any status but Backlog and Completed)",
  goal: "Park an Added Value that won't be worked on for now, saying why.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=32-72",
  doc: "flows/av-05-move-to-backlog.md",
  status: "Implemented",
  scenarios: BACKLOG_SCENARIOS,
};
