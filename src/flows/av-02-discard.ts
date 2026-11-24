import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 02 Discard — the flow doc is `flows/av-02-discard.md`, the FigJam page is
 * "AV · 02 Discard". Throwing away a draft, a saved one or a new one not yet saved
 * (proposed 24 Nov 2026: never once it's submitted): Discard (red text) on the edit
 * page, the confirm, then it's gone for good. Figma: AV Page: Editing AVs, Flows › Discard Button (Draft) 1026:166776.
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
      on("Eve's draft VCP-1199 (Saved filters on the AV table), on its edit page. Under the cards: Discard, in red text, then Save as draft and Submit (Figma 1026:166776). Discard is here only while an AV is a draft.", "step:actions", EDIT("vcp-1199")),
      press("Press Discard.", "Discard", EDIT("vcp-1199")),
      press("A plain question: \"Are you sure you want to discard this Added Value?\" and \"This action cannot be undone. The item will be permanently removed.\" (DS 2.0.0's ConfirmModal, Figma's copy). Press Cancel first.", "Cancel", EDIT("vcp-1199")),
      press("Nothing happened (Figma: \"Popup disappears and nothing happens\"): the draft is as it was, and focus is back on Discard. Press Discard again.", "Discard", EDIT("vcp-1199")),
      press("The same confirm. This time press Confirm.", "Confirm", EDIT("vcp-1199")),
      on("Gone for good. The Dashboard, and \"Draft discarded\": \"Added Value VCP-1199 was discarded.\" (Figma lands on My Values, which isn't built yet.) Drafts no longer lists it.", "step:icymi", "/"),
      { ...on("A new one is a draft too: Create Added Value has Discard, and its toast names no reference, as it never had one. Open it from the top bar, or press Next.", "step:icymi", "/"), open: "/added-values/new" },
      on("Discard, then Save as draft and Submit: the same buttons as a saved draft.", "step:actions", "/added-values/new"),
      { ...on("Once it's submitted, Discard goes. Open Eve's Pending VCP-1200, then Edit, or press Next.", "step:actions", "/added-values/new"), open: EDIT("vcp-1200") },
      on("No Discard: only Save as draft and Submit. To get rid of a submitted one, an admin rejects it or moves it to the Backlog.", "step:actions", EDIT("vcp-1200")),
    ],
    name: "Discard a draft",
    demonstrates: "Discard, its confirm (Cancel and Confirm), and the AV removed (Figma 1026:166776). Discard is only for a draft: a saved one or a new one, never one that's been submitted.",
    conditions: "Eve as a User, on the edit page of her draft VCP-1199.",
    simulated: "Removed from the prototype only; a scenario's start brings it back.",
    expected: "Cancel leaves VCP-1199 as it was, focus on Discard. Confirm removes it; the toast names it. Create Added Value has Discard too; Eve's Pending VCP-1200 has none.",
    task: "Throw away the draft you won't finish.",
  },
];

export const DISCARD_FLOW: FlowDef = {
  id: "av-02-discard",
  area: "AV",
  number: "02",
  name: "Discard",
  actor: "Whoever raised it, and the domain's admins",
  goal: "Throw away a draft that isn't wanted, before it's submitted.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=87-257",
  doc: "flows/av-02-discard.md",
  status: "Implemented",
  scenarios: DISCARD_SCENARIOS,
};
