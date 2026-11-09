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
const conditions = "Eve as Admin on the Dashboard: the team's AVs, today 05/11/2026.";

export const ICYMI_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "activity-03-icymi.the-strip",
    steps: [
      on("Under the Value Cards: \"In Case You Missed it\" (Figma 1552:13939). Each card is an AV that has been waiting: who raised it and when, its title, and why it's here, Overdue, Due Soon, Awaiting Review or Pending, and for how long."),
      on("Point at the ⓘ (or Tab to it): \"Added Values that have been waiting for a while and may need your attention.\" (Figma's tooltip)."),
      on("More cards than fit: point at the row's edge for the arrow, which moves one card (Figma: Arrow Button Scroll). Tab, Shift + wheel, a swipe or dragging the row scroll it too."),
      on("The order is Figma's: overdue first, then due soon, awaiting review and pending; the longest wait first within each."),
    ],
    name: "The strip",
    demonstrates: "What the strip shows, its ⓘ, and scrolling it (Figma's Tooltip and Arrow Button Scroll flows).",
    conditions,
    simulated: "The cards come from the sample AVs by the prototype's rules (the flow doc).",
    expected: "11 cards: 4 overdue, 3 due soon, 1 awaiting review, 3 pending.",
    task: "See what's been waiting too long across the team.",
  },
  {
    ...base,
    id: "activity-03-icymi.open",
    steps: [
      on("Press the first card, Filters for the notification inbox (Overdue): it opens the AV (Figma: Card Interaction, Go to AV). Then Next."),
      { text: "The AV it's about. Opening it doesn't take it off the strip: it's still overdue.", target: "step:details", path: "/added-values/*" },
    ],
    name: "Open a card",
    demonstrates: "A card goes to its AV (Figma 1552:13983).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "VCP-1205 opens.",
    task: "Look into the first overdue AV.",
  },
  {
    ...base,
    id: "activity-03-icymi.dismiss",
    steps: [
      on("Point at a card: its ✕ appears (Figma: Remove/Dismiss Card). Tab reaches it too: \"Dismiss <title>\"."),
      press("Dismiss the first card.", "Dismiss Filters for the notification inbox"),
      on("It's gone and the rest close up; focus is on the card that took its place. It stays dismissed until the prototype starts again (Figma doesn't say how long)."),
      on("Dismiss every card: the strip stays, with its heading and \"You’re all caught up.\" (an empty strip on arrival isn't drawn at all)."),
    ],
    name: "Dismiss a card",
    demonstrates: "Taking a card off the strip (Figma 1552:14007), and the strip once it's empty.",
    conditions,
    simulated: "Dismissed cards stay dismissed for the session only.",
    expected: "10 cards after the first dismissal; \"You’re all caught up.\" after the last.",
    task: "Clear the strip of what you've already dealt with.",
  },
  {
    ...base,
    role: "user",
    id: "activity-03-icymi.as-a-user",
    steps: [
      on("User view: only Eve's own AVs, the ones she raised or is assigned to: her overdue one, one due soon, and one awaiting her review (she raised it). No Pending cards: accepting is an admin's."),
      on("Switch to Admin in the View as bar: the team's, with the Pending ones (Figma draws the strip on the admin dashboard)."),
    ],
    name: "As a user",
    demonstrates: "Whose AVs the strip shows, by role.",
    conditions: "Eve as a User on the Dashboard.",
    simulated: "The prototype's rules; Figma only draws the admin's.",
    expected: "3 cards as a user, 11 as an admin.",
    task: "See what's waiting on you.",
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
