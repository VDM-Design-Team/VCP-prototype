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
      on("Eve's draft VCP-1199 (Saved filters on the AV table), on its edit page. Under the cards: Discard, in red text, then Save as draft and Submit (Figma 1026:166776).", "step:actions", EDIT("vcp-1199")),
      press("Press Discard.", "Discard", EDIT("vcp-1199")),
      { text: "\"Are you sure you want to discard this Added Value?\" with its reference and title, so nobody discards the wrong one. \"This action cannot be undone.\" Press Confirm, then Next.", path: EDIT("vcp-1199") },
      on("Gone for good. The Dashboard, and \"Deleted!\": \"Added Value “VCP-1199” has been discarded successfully.\" (Figma lands on My Values, which isn't built yet.) Drafts no longer lists it.", "step:icymi", "/"),
    ],
    name: "Discard a draft",
    demonstrates: "Discard, its confirm, and the AV removed (Figma 1026:166776).",
    conditions: "Eve as a User, on the edit page of her draft VCP-1199.",
    simulated: "Removed from the prototype only; a scenario's start brings it back.",
    expected: "VCP-1199 gone; the toast names it.",
    task: "Throw away the draft you won't finish.",
  },
  {
    ...base,
    id: "av-02-discard.cancel",
    start: EDIT("vcp-1199"),
    steps: [
      press("Press Discard.", "Discard", EDIT("vcp-1199")),
      { text: "The confirm. Press Cancel this time, then Next.", path: EDIT("vcp-1199") },
      on("Nothing happened (Figma: \"Popup disappears and nothing happens\"): the draft is as it was, and focus is back on Discard.", "step:actions", EDIT("vcp-1199")),
    ],
    name: "Change your mind",
    demonstrates: "Cancel leaves the AV alone.",
    conditions: "Eve as a User, on the edit page of her draft VCP-1199.",
    simulated: "Nothing is saved.",
    expected: "VCP-1199 still there; focus on Discard.",
    task: "Start to discard a draft, then keep it.",
  },
  {
    ...base,
    id: "av-02-discard.new",
    start: "/added-values/new",
    steps: [
      on("Create Added Value: a new one, not saved yet. Discard is here too (Figma's \"Does the AV already have an ID? No\"). Type a title if you like.", "step:actions", "/added-values/new"),
      press("Press Discard.", "Discard", "/added-values/new"),
      { text: "The same confirm. Press Confirm, then Next.", path: "/added-values/new" },
      on("\"Deleted!\": \"Added Value has been discarded successfully.\" It never had a reference, so the toast names none.", "step:icymi", "/"),
    ],
    name: "Discard a new one",
    demonstrates: "Discarding an AV that was never saved (Figma's \"No ID\" branch).",
    conditions: "Eve as a User, on Create Added Value.",
    simulated: "Nothing was saved, so nothing is removed.",
    expected: "\"Added Value has been discarded successfully.\"",
    task: "Start a new Added Value, then drop it.",
  },
  {
    ...base,
    id: "av-02-discard.pending",
    start: EDIT("vcp-1200"),
    steps: [
      on("VCP-1200 is Pending (Eve raised it; no admin has accepted it yet). Discard is here too: Figma allows it in Draft and Pending.", "step:actions", EDIT("vcp-1200")),
      on("Once an admin accepts it, it can't be discarded: open VCP-1203 (Accepted) from Assigned, then Edit: no Discard, only Save as draft and Submit.", "step:actions", EDIT("vcp-1200")),
    ],
    name: "When you can discard",
    demonstrates: "Discard only while Draft or Pending (Figma 1026:168578).",
    conditions: "Eve as a User, on the edit page of her Pending VCP-1200.",
    simulated: "Nothing is saved.",
    expected: "Discard on VCP-1200; none on VCP-1203.",
    task: "Withdraw an Added Value nobody has accepted yet.",
  },
];

export const DISCARD_FLOW: FlowDef = {
  id: "av-02-discard",
  area: "AV",
  number: "02",
  name: "Discard",
  actor: "All users",
  goal: "Throw away an Added Value that isn't wanted, before anyone has accepted it.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=87-257",
  doc: "flows/av-02-discard.md",
  status: "Implemented",
  scenarios: DISCARD_SCENARIOS,
};
