import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 06 Accept / Reject — the flow doc is `flows/av-06-accept-reject.md`,
 * the FigJam page is "AV · 06 Accept / Reject". An admin decides a Pending AV
 * (or, since DS #330, a Backlog one) from its page: Accept opens
 * `AcceptPendingAVModal`, Reject opens `RejectPendingAVModal`. Their dialogs
 * make the page inert, the walk's card included, so those steps are answered
 * in the dialog and Next is pressed after. Since 13 Nov 2026 (design system
 * 1.2.0) a decision is not the end for an admin: the ⋮ menu reopens a Rejected
 * AV (Move to Pending, Backlog or Draft) and parks or sends back one that is
 * accepted, on a domain step or in Review (Move to Backlog or Draft).
 */

/* Next opens the AV, as its row's title does. */
const onManage = (id: string): ScenarioStep => ({
  text: `Admin view, on Manage: every open Added Value, Pending ones included. Open ${id.toUpperCase()} from its row, or press Next.`,
  target: "step:av-list",
  path: "/manage",
  open: `/added-values/${id}`,
});
const onAV = (id: string, text: string, target = "step:av-menu"): ScenarioStep => ({ text, target, path: `/added-values/${id}` });
/* A step Next does for you: it presses the target (a `step:` target, the button inside it). */
const press = (id: string, text: string, target: string): ScenarioStep => ({ ...onAV(id, text, target), action: true });

const base = { status: "Implemented", testing: "Not tested", role: "admin", setup: undefined } as const;

export const DECIDE_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-06-accept-reject.accept",
    start: "/manage",
    steps: [
      onManage("vcp-1201"),
      press("vcp-1201", "VCP-1201, Pending: Reject and Accept in the header are an admin's. Press Accept, or Next.", "button:Accept"),
      press("vcp-1201", "The dialog asks to confirm; Multipart (AV · 10) stays off. Press Confirm, or Next.", "button:Confirm"),
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
    domain: "Design (BESA)",
    start: "/manage",
    steps: [
      onManage("vcp-1202"),
      press("vcp-1202", "VCP-1202 is Lena's, Pending. Press Reject, or Next.", "button:Reject"),
      {
        ...onAV("vcp-1202", "Reject in the dialog stays faded until a Rejection Reason is picked; each reason shows what it means. Which reason?", "button:Reject"),
        options: [
          { label: "One from the list", goto: "listed" },
          { label: "Other, with your own words", goto: "other" },
        ],
      },
      {
        id: "listed",
        ...press("vcp-1202", "Pick a reason (Duplicate, say) and press Reject, or press Next.", "button:Reject"),
        enter: { "Rejection Reason": "Duplicate" },
        next: "rejected",
      },
      {
        id: "other",
        ...onAV("vcp-1202", "Choose Other, or press Next: it has no explanation, and gives an optional text field instead (Figma 1139:137784)."),
        enter: { "Rejection Reason": "Other" },
      },
      {
        ...press("vcp-1202", "Type a reason and press Reject, or press Next.", "button:Reject"),
        enter: { "Rejection Reason — details": "Already covered by the archive redesign." },
      },
      {
        id: "rejected",
        text: "Rejected: a red banner says why (Figma 1094:95365), with your text for Other. The toast's link opens Archive → Rejected.",
        path: "/added-values/vcp-1202",
      },
      { text: "Open Archive → Rejected in the sidebar, or press Next.", path: "/added-values/vcp-1202", open: "/archive/rejected" },
      { text: "It's listed there, and gone from Manage. An admin can still reopen it from its ⋮ menu (the next scenario).", target: "step:av-list", path: "/archive/rejected" },
    ],
    name: "Reject a Pending AV",
    demonstrates: "Rejecting needs a reason (a listed one, or Other with free text); the AV shows it and moves to Archive → Rejected.",
    conditions: "Eve as Admin of Design (the rail's domain switcher), on Manage. Lena's VCP-1202 is Pending.",
    simulated: "Rejecting always succeeds.",
    expected: "Reject stays disabled until a reason is chosen; Other shows a text field. Then a red \"This Added Value was rejected\" banner with the reason (\"Other: …\" with the text), a toast, and the AV in Archive → Rejected.",
    task: "As an admin, turn down Lena's Added Value, and say why.",
  },
  {
    ...base,
    id: "av-06-accept-reject.reopen-rejected",
    start: "/added-values/vcp-1209",
    steps: [
      onAV(
        "vcp-1209",
        "Admin view. VCP-1209 is Lena's, rejected two weeks ago as a duplicate: the red banner says why. Rejected is no longer final for an admin (decided 13 Nov 2026).",
      ),
      press("vcp-1209", "Open ⋮, or press Next.", "step:av-menu"),
      press("vcp-1209", "Above Edit and Delete are Move to Backlog, Move to Pending and Move to Draft. Choose Move to Pending, or press Next.", "button:Move to Pending"),
      onAV(
        "vcp-1209",
        "Pending again: the banner is gone, Reject and Accept are back in the header, and Status History logs Rejected → Pending. A toast confirms it.",
        "button:Accept",
      ),
      { text: "Open Manage in the sidebar, or press Next.", path: "/added-values/vcp-1209", open: "/manage" },
      { text: "It's back in the admins' queue, to be decided again, and gone from Archive → Rejected.", target: "step:av-list", path: "/manage" },
    ],
    name: "Reopen a rejected AV",
    demonstrates: "An admin puts a Rejected AV back in the queue with Move to Pending; it can then be decided again.",
    conditions: "Eve as Admin, on Lena's VCP-1209, rejected as a duplicate.",
    simulated: "The move always succeeds. The initiator isn't notified in the prototype (Activity · 02).",
    expected: "An admin's ⋮ menu on a Rejected AV has Move to Backlog, Move to Pending and Move to Draft. Move to Pending: the AV is Pending, the rejection banner is gone, Reject and Accept are in the header, and it is listed on Manage again.",
    task: "As an admin: Lena's bulk upload was turned down as a duplicate, but it wasn't one. Put it back in the queue.",
  },
  {
    ...base,
    id: "av-06-accept-reject.park-in-progress",
    start: "/added-values/vcp-1204",
    steps: [
      onAV(
        "vcp-1204",
        "Admin view. VCP-1204 was accepted and is being worked on: it's In QA. On work in progress (Accepted, a domain step, Review) an admin's ⋮ menu has Move to Backlog and Move to Draft (decided 13 Nov 2026).",
      ),
      press("vcp-1204", "Open ⋮, or press Next.", "step:av-menu"),
      press("vcp-1204", "Choose Move to Backlog, or press Next.", "button:Move to Backlog"),
      {
        ...press("vcp-1204", "Feedback is required, as in AV · 05. Type why (\"Paused until the registry sync is fixed\") and press Move to Backlog, or press Next.", "button:Move to Backlog"),
        enter: { Feedback: "Paused until the registry sync is fixed" },
      },
      {
        text: "Backlog, with the feedback as Remarks. Its plan stays on it (assignees, dates, points); Date Accepted goes, and Status History logs In QA → Backlog. The toast's link opens Archive → Backlogs.",
        target: "step:remarks",
        path: "/added-values/vcp-1204",
      },
      onAV("vcp-1204", "It comes back the way any Backlog AV does (AV · 05): Accept or Reject in the header, or ⋮ → Move to Pending / Move to Draft."),
    ],
    name: "Move in-progress work to the Backlog",
    demonstrates: "An admin moves an accepted, in-progress AV to the Backlog, saying why; acceptance is not a one-way door.",
    conditions: "Eve as Admin, on VCP-1204 at In QA (Development).",
    simulated: "The move always succeeds. Nobody is notified in the prototype (Activity · 02).",
    expected: "An admin's ⋮ menu on an in-progress AV has Move to Backlog and Move to Draft. Move to Backlog asks for feedback (required), then the AV is in the Backlog with Remarks and listed in Archive → Backlogs.",
    task: "As an admin: the holiday export has to wait for another fix. Take it out of the work for now, and say why.",
  },
];

export const DECIDE_FLOW: FlowDef = {
  id: "av-06-accept-reject",
  area: "AV",
  number: "06",
  name: "Accept / Reject",
  actor: "Admin",
  goal: "Decide a submitted Added Value: accept it into the work, or turn it down with a reason. And, as an admin, change that decision later.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=35-72",
  doc: "flows/av-06-accept-reject.md",
  status: "Implemented",
  scenarios: DECIDE_SCENARIOS,
};
