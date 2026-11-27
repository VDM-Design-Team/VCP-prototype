import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Activity · 03 In case you missed it — the flow doc is `flows/activity-03-icymi.md`,
 * the FigJam page is "Activity · 03 In case you missed it". The Dashboard's strip
 * of Added Values that have been waiting (DS `InCaseYouMissedIt`): overdue, due
 * soon, awaiting review, pending. Open one, or dismiss it. Figma: In Case You
 * Missed It Section 1552:13937, on the admin dashboard 951:370905.
 */

const HOME = "/";
const on = (text: string, target = "step:icymi", path = HOME): ScenarioStep => ({ text, target, path });
const press = (text: string, button: string): ScenarioStep => ({ text, target: `button:${button}`, path: HOME, action: true });

const base = { status: "Implemented", testing: "Not tested", role: "admin", start: HOME, setup: undefined } as const;
const conditions = "Eve as Admin of Development on the Dashboard: the domain's AVs, today 05/11/2026.";

export const ICYMI_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "activity-03-icymi.open",
    steps: [
      on("Under the Value Cards: \"In Case You Missed it\" (Figma 1552:13939). Each card is an AV that has been waiting: who raised it and when, its title, and why it's here, Overdue, Due Soon, Awaiting Review or Pending, and for how long. The order is Figma's: overdue first, then due soon, awaiting review and pending; the longest wait first within each."),
      on("Point at the ⓘ (or Tab to it): \"Added Values that have been waiting for a while and may need your attention.\" (Figma's tooltip). More cards than fit: point at the row's edge for the arrow, which moves one card (Figma: Arrow Button Scroll); Tab, Shift + wheel, a swipe or dragging the row scroll it too."),
      on("Press the first card, Filters for the notification inbox (Overdue): it opens the AV (Figma: Card Interaction, Go to AV). Then Next."),
      { text: "The AV it's about. Opening it doesn't take it off the strip: it's still overdue.", target: "step:details", path: "/added-values/*" },
    ],
    name: "Open a card",
    demonstrates: "What the strip shows, its ⓘ and scrolling (Figma's Tooltip and Arrow Button Scroll flows), and a card going to its AV (Figma 1552:13983).",
    conditions,
    simulated: "The cards come from the sample AVs by the prototype's rules (the flow doc). Nothing is saved.",
    expected: "10 cards, Development's (Admin · 01: the rail's domain picks the strip): 4 overdue, 3 due soon, 1 awaiting review, 2 pending. The first opens VCP-1205.",
    task: "See what's been waiting too long across the team, and look into the first overdue AV.",
  },
  {
    ...base,
    role: "user",
    id: "activity-03-icymi.dismiss",
    steps: [
      on("User view: only Eve's own AVs, the ones she raised or is assigned to: her overdue one, one due soon, and one awaiting her review (she raised it). No Pending cards: accepting is an admin's, and an admin sees the domain's."),
      on("Point at a card: its ✕ appears (Figma: Remove/Dismiss Card). Tab reaches it too: \"Dismiss <title>\"."),
      press("Dismiss Holiday registry export (Due Soon).", "Dismiss Holiday registry export"),
      on("It's gone and the rest close up; focus is on the card that took its place. A toast: \"Card dismissed\", with Undo (decided 9 Nov 2026). Undo brings it back, with focus on it."),
      on("Dismiss the other two: the strip stays, with its heading and \"You’re all caught up.\" (an empty strip on arrival isn't drawn at all). They stay away while nothing changes, even across pages. Open Assigned → Holiday registry export (VCP-1204), then Next."),
      { ...press("On its page, move it on: Move to Ready for deploy.", "Move to Ready for deploy"), path: "/added-values/vcp-1204" },
      { text: "Its status changed. Back to the Dashboard (the rail), then Next.", path: "/added-values/vcp-1204" },
      on("It's back on the strip: a dismissal lasts until the AV's status or due date changes (decided 9 Nov 2026)."),
    ],
    name: "Dismiss a card, and it comes back",
    demonstrates: "Taking a card off the strip (Figma 1552:14007), Undo, the empty strip, and a dismissal lasting until the AV changes.",
    conditions: "Eve as a User on the Dashboard.",
    simulated: "Nothing is saved.",
    expected: "3 cards; \"You’re all caught up.\" after the last; the export returns after VCP-1204 moves to Ready for deploy.",
    task: "Clear the strip of what you've dealt with, and set the export aside until something happens to it.",
  },
];

export const ICYMI_FLOW: FlowDef = {
  id: "activity-03-icymi",
  area: "Activity",
  number: "03",
  name: "In case you missed it",
  actor: "All users",
  goal: "Bring back the Added Values that have been waiting too long, before they slip further.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=71-219",
  doc: "flows/activity-03-icymi.md",
  status: "Implemented",
  scenarios: ICYMI_SCENARIOS,
};
