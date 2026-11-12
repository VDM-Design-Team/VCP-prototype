import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 06 Accept / Reject — the flow doc is `flows/av-06-accept-reject.md`,
 * the FigJam page is "AV · 06 Accept / Reject". An admin decides a Pending AV
 * (or, since DS #330, a Backlog one) from its page: Accept opens
 * `AcceptPendingAVModal`, Reject opens `RejectPendingAVModal`. Their dialogs
 * make the page inert, the walk's card included, so those steps are answered
 * in the dialog and Next is pressed after.
 */

const onManage: ScenarioStep = {
  text: "Admin view, on Manage: every open Added Value, Pending ones included. Open the AV from its row.",
  target: "step:av-list",
  path: "/manage",
};
const onAV = (id: string, text: string, target = "step:av-menu"): ScenarioStep => ({ text, target, path: `/added-values/${id}` });

const base = { status: "Implemented", testing: "Not tested", role: "admin", setup: undefined } as const;

export const DECIDE_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-06-accept-reject.accept",
    start: "/manage",
    steps: [
      onManage,
      onAV("vcp-1201", "VCP-1201, Pending: Reject and Accept in the header are an admin's.", "button:Accept"),
      onAV("vcp-1201", "Press Accept. The dialog asks to confirm; Multipart (AV · 10) stays off. Press Confirm, then Next.", "button:Accept"),
      onAV("vcp-1201", "Accepted: Date Accepted is set, Status History logs it, and the header's next move is Move to In Progress. A toast confirms it."),
    ],
    name: "Accept a Pending AV",
    demonstrates: "An admin accepts a Pending AV from Manage: Pending → Accepted.",
    conditions: "Eve as Admin, on Manage. Marvin's VCP-1201 is Pending.",
    simulated: "Accepting always succeeds. The initiator isn't notified in the prototype (Activity · 02).",
    expected: "The Accept dialog, then the AV Accepted with Date Accepted set and a toast.",
    task: "As an admin, accept Marvin's supplier scorecard.",
  },
  {
    ...base,
    id: "av-06-accept-reject.reject",
    start: "/manage",
    steps: [
      onManage,
      onAV("vcp-1202", "VCP-1202 is Lena's, Pending.", "button:Reject"),
      onAV(
        "vcp-1202",
        "Press Reject. Reject in the dialog stays faded until a Rejection Reason is picked; each reason shows what it means. Pick one, press Reject, then Next.",
        "button:Reject",
      ),
      {
        text: "Rejected: a red banner says why (Figma 1094:95365). The toast's link opens Archive → Rejected.",
        path: "/added-values/vcp-1202",
      },
      { text: "Open Archive → Rejected in the sidebar.", path: "/added-values/vcp-1202" },
      { text: "It's listed there, and gone from Manage.", target: "step:av-list", path: "/archive/rejected" },
    ],
    name: "Reject a Pending AV",
    demonstrates: "Rejecting needs a reason; the AV shows it and moves to Archive → Rejected.",
    conditions: "Eve as Admin, on Manage. Lena's VCP-1202 is Pending.",
    simulated: "Rejecting always succeeds.",
    expected: "Reject stays disabled until a reason is chosen. Then a red \"This Task was rejected\" banner with the reason, a toast, and the AV in Archive → Rejected.",
    task: "As an admin, turn down Lena's Added Value, and say why.",
  },
  {
    ...base,
    id: "av-06-accept-reject.reject-other",
    start: "/added-values/vcp-1202",
    steps: [
      onAV("vcp-1202", "Press Reject, then choose Other as the reason.", "button:Reject"),
      onAV(
        "vcp-1202",
        "Other has no explanation; it gives an optional text field instead (Figma 1139:137784). Type a reason, press Reject, then Next.",
        "button:Reject",
      ),
      { text: "The banner shows Other with what you typed.", path: "/added-values/vcp-1202" },
    ],
    name: "Reject with Other",
    demonstrates: "The Other reason takes free text, which the Rejected banner shows.",
    conditions: "Eve as Admin, on Lena's Pending VCP-1202.",
    simulated: "Rejecting always succeeds.",
    expected: "Choosing Other shows a text field; the banner reads \"Other: …\" with the text.",
    task: "As an admin, reject Lena's Added Value for a reason that isn't in the list.",
  },
  {
    ...base,
    id: "av-06-accept-reject.cancel",
    start: "/added-values/vcp-1201",
    steps: [
      onAV("vcp-1201", "Press Reject, pick a reason, then Cancel (or Escape). Nothing changes, and focus returns to Reject. Then Next.", "button:Reject"),
      onAV("vcp-1201", "Press Reject again: the dialog has forgotten the reason. Cancel, then Next.", "button:Reject"),
      onAV("vcp-1201", "Same for Accept: Cancel leaves it Pending.", "button:Accept"),
    ],
    name: "Change your mind",
    demonstrates: "Cancel moves nothing, and each dialog starts fresh.",
    conditions: "Eve as Admin, on Marvin's Pending VCP-1201.",
    simulated: "Nothing is sent.",
    expected: "The AV stays Pending; the reject dialog clears itself when it closes.",
    task: "As an admin, start to reject Marvin's Added Value, then change your mind.",
  },
  {
    ...base,
    id: "av-06-accept-reject.not-an-admin",
    role: "user",
    start: "/added-values/vcp-1200",
    steps: [
      onAV("vcp-1200", "Eve as a User, on her own Pending AV: no Accept or Reject. Only an admin decides."),
      onAV("vcp-1200", "Switch View as to Admin (bottom bar): Reject and Accept appear.", "button:Accept"),
    ],
    name: "Not an admin",
    demonstrates: "Only an admin sees Accept and Reject; the initiator waits.",
    conditions: "Eve as User, on her Pending VCP-1200.",
    simulated: "Roles come from the View as switch.",
    expected: "No decision buttons as a User; they appear as an Admin.",
    task: "Your Added Value about undo is waiting for review. Can you approve it yourself?",
  },
];

export const DECIDE_FLOW: FlowDef = {
  id: "av-06-accept-reject",
  area: "AV",
  number: "06",
  name: "Accept / Reject",
  actor: "Admin",
  goal: "Decide a submitted Added Value: accept it into the work, or turn it down with a reason.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=35-72",
  doc: "flows/av-06-accept-reject.md",
  status: "Implemented",
  scenarios: DECIDE_SCENARIOS,
};
