import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 02 Discard — the flow doc is `flows/av-02-discard.md`, the FigJam page is
 * "AV · 02 Discard". Throwing away an Added Value that is a Draft or Pending, or a
 * new one not yet saved: Discard (red text) on the edit page, the confirm, then it's
 * gone for good. Figma: AV Page: Editing AVs, Flows › Discard Button (Draft) 1026:166776.
 */

const EDIT = (id: string) => `/added-values/${id}/edit`;
const press = (text: string, button: string, path: string): ScenarioStep => ({ text, target: `button:${button}`, path, action: true });
const on = (text: string, target: string, path: string): ScenarioStep => ({ text, target, path });

const base = { status: "Implemented", testing: "Not tested", role: "user", setup: undefined } as const;

export const DISCARD_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-02-discard.draft",
    start: EDIT("vcp-1199"),
    steps: [
      on("Eve's draft VCP-1199 (Saved filters on the AV table), on its edit page. Under the cards: Discard, in red text, then Save as draft and Submit (Figma 1026:166776). Discard is here while an AV is a Draft or Pending (Figma 1026:168578).", "step:actions", EDIT("vcp-1199")),
      press("Press Discard.", "Discard", EDIT("vcp-1199")),
      press("A plain question: \"Are you sure you want to discard this Added Value?\" and \"This action cannot be undone. The item will be permanently removed.\" (DS 2.0.0's ConfirmModal, Figma's copy). Press Cancel first.", "Cancel", EDIT("vcp-1199")),
      press("Nothing happened (Figma: \"Popup disappears and nothing happens\"): the draft is as it was, and focus is back on Discard. Press Discard again.", "Discard", EDIT("vcp-1199")),
      press("The same confirm. This time press Confirm.", "Confirm", EDIT("vcp-1199")),
      on("Gone for good. The Dashboard, and \"Draft discarded\": \"Added Value VCP-1199 was discarded.\" (Figma lands on My Values, which isn't built yet.) Drafts no longer lists it.", "step:icymi", "/"),
      { ...on("Discard isn't always there. Once an admin accepts an AV, it can't be discarded: open VCP-1203 (Accepted) from Assigned, then Edit, or press Next.", "step:icymi", "/"), open: EDIT("vcp-1203") },
      on("No Discard: only Save as draft and Submit.", "step:actions", EDIT("vcp-1203")),
      {
        ...on("Nor can a user who didn't raise it (decided 10 Nov 2026: whoever raised it and the domain's admins). Open the bell, then Marvin Ode's comment on Supplier scorecard (VCP-1201, his Pending one), then Edit from its menu, or press Next.", "step:actions", EDIT("vcp-1203")),
        open: EDIT("vcp-1201"),
      },
      on("No Discard for Eve as a User, though it's Pending: it isn't hers.", "step:actions", EDIT("vcp-1201")),
    ],
    name: "Discard a draft",
    demonstrates: "Discard, its confirm (Cancel and Confirm), and the AV removed (Figma 1026:166776). Then when Discard isn't offered: past Pending, or not yours (Figma 1026:168578, decided 10 Nov 2026).",
    conditions: "Eve as a User, on the edit page of her draft VCP-1199.",
    simulated: "Removed from the prototype only; a scenario's start brings it back.",
    expected: "Cancel leaves VCP-1199 as it was, focus on Discard. Confirm removes it; the toast names it. No Discard on VCP-1203 (Accepted) or, as a User, on Marvin's VCP-1201.",
    task: "Throw away the draft you won't finish.",
  },
  {
    ...base,
    role: "admin",
    id: "av-02-discard.admin",
    start: EDIT("vcp-1202"),
    steps: [
      on("As an Admin: VCP-1202, Lena Novak's Pending Added Value in Design. The domain's admins can discard it too (decided 10 Nov 2026).", "step:actions", EDIT("vcp-1202")),
      press("Press Discard.", "Discard", EDIT("vcp-1202")),
      press("The same confirm. Press Confirm.", "Confirm", EDIT("vcp-1202")),
      on("\"Draft discarded\" on the Dashboard. Open the bell: the admin's \"Lena Novak submitted…\" now reads \"You discarded Empty states for the archive pages\", on top and unread, and opens nothing: the Added Value has no page any more. Further down, Marvin Ode's \"discarded Bulk export for the archive\" is how it reads when the initiator discards one (decided 10 Nov 2026).", "step:bell", "/"),
    ],
    name: "An admin discards, and the notification",
    demonstrates: "An admin discarding someone else's Pending AV; the admin's notification turns into \"discarded\" and no longer opens it (DS #366).",
    conditions: "Eve as an Admin (Design is one of her domains), on the edit page of Lena's Pending VCP-1202.",
    simulated: "Removed from the prototype only; a scenario's start brings it back.",
    expected: "VCP-1202 gone; its notification reads \"You discarded …\" and doesn't open.",
    task: "Throw away a Pending Added Value somebody raised by mistake.",
  },
];

export const DISCARD_FLOW: FlowDef = {
  id: "av-02-discard",
  area: "AV",
  number: "02",
  name: "Discard",
  actor: "Whoever raised it, and the domain's admins",
  goal: "Throw away an Added Value that isn't wanted, before anyone has accepted it.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=87-257",
  doc: "flows/av-02-discard.md",
  status: "Implemented",
  scenarios: DISCARD_SCENARIOS,
};
