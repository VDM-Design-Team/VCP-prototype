# Activity · 03 In case you missed it

**ID:** `activity-03-icymi` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [Activity · 03 In case you missed it](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=71-219) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: In Case You Missed It Section `1552:13937`: ICYMI Dashboard `1552:13939`, ICYMI Flows `1552:13952` (Tooltip `1552:13953`, Arrow Button Scroll `1552:13961`, Go to AV `1552:13983`, Remove/Dismiss Card `1552:14007`) · Dashboard Page `947:304368`, admin Cycle overview `951:370905`
**Scenarios:** [`src/flows/activity-03-icymi.ts`](../src/flows/activity-03-icymi.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Bring back the Added Values that have been waiting too long, before they slip further.

## Actor, entry points and starting conditions
- **Anyone**, on the **Dashboard**, under the Value Cards (where Figma places it on the admin dashboard's Cycle view, `951:370905`).
- Today is 05/11/2026; the cards come from the AVs as they are now, so a change elsewhere (an AV completed, moved to Review) shows here.

## Main steps and decision points
1. **The strip** (DS `InCaseYouMissedIt`): "In Case You Missed it", an ⓘ ("Added Values that have been waiting for a while and may need your attention."), and a row of cards (DS `InCaseYouMissedItCard`): who raised it and when, the title, and why it's here, **Overdue** ("since 3 days ago"), **Due Soon** ("in 7 days"), **Awaiting Review** or **Pending** ("since …").
2. **Scrolling**: an arrow at the row's edge moves one card (Figma's Arrow Button Scroll); Tab, Shift + wheel, a swipe or dragging the row scroll it too.
3. **Open a card**: it goes to its AV (Figma's Go to AV).
4. **Dismiss a card** (its ✕, "Dismiss <title>"): it's gone, the rest close up, and focus moves to the next card (Figma's Remove/Dismiss Card). A toast says "Dismissed" with **Undo**, which brings it back with focus on it (decided 9 Nov 2026). **It stays away until its AV's status or due date changes**, then comes back (decided).
5. **The last one dismissed**: the strip stays, with "You’re all caught up.". A strip with nothing in it on arrival isn't drawn at all.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Nothing waiting | No strip | — |
| Everything dismissed | "You’re all caught up." | — |

## Completion or exit
- **Done:** the AVs that have waited are opened or knowingly set aside.

## The prototype's own rules (Figma doesn't say)
- **Order**: overdue, due soon, awaiting review, pending (Figma's); the longest wait first within each.
- **The card's person** is who raised the AV, and its time is when it was raised.

## Decided (9 Nov 2026)
- **Users see it too**, with their own AVs (raised or assigned); an admin sees everyone's.
- **Due Soon is within a week**, and there's **no maximum**. **Pending** is an admin's only (they accept); **Awaiting Review** shows a user the AVs they raised.
- **A dismissal lasts until the AV's status or due date changes.** Dismissing shows a toast with Undo.
- **Opening a card doesn't take it off the strip.**

## Unresolved questions
- None for this flow.
