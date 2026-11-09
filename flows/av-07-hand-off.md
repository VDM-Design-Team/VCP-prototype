# AV · 07 Hand off

**ID:** `av-07-hand-off` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [AV · 07 Hand off](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=38-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: AV in Accepted `810:192544` · Handoff AV modal `2:2870` / `2:2871` (overdue `2:2857` → `2:2858`; DS `Handoff_AV_Modal` `5342:78539`) · Review AV modal `6100:15103` · Rejecting a handoff `791:84300` (`791:99319` → `791:99377` → `791:99325`) · Archive: Completed `254:75232`
**Scenarios:** [`src/flows/av-07-hand-off.ts`](../src/flows/av-07-hand-off.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Hand finished work over for review, and have it signed off (Completed) or sent back.

## Actor, entry points and starting conditions
- **The assignee** hands off; **the initiator or an admin** reviews. `StatusProgression` decides who sees which button.
- The AV is at its domain's **last step** (Development: Confirmed prod; Design: Design review), after Accept (AV · 06) and the domain's steps.

## Main steps and decision points
1. On the AV, **Move to Handoff** (an admin's reads **Handoff**) opens **"Handoff Added Value"** (`HandoffAVModal`):
   - **Handoff Date** (prefilled with today), **Demo Links** (Add Another Link), **Attachments** (the AV's files, plus a drop zone);
   - **overdue:** a warning banner ("This value is Overdue by 3 days"), a **required Overdue Reason** (six reasons) and optional Additional Notes;
   - **footer by domain:** Design: Cancel · **Handoff**. Development: Cancel · Handoff · **Handoff & Publish**.
2. **Handoff** → the AV moves to **Review**, logged; a toast names who reviews it ("Marvin Ode reviews it next"). The assignee has no more moves.
3. The initiator (or an admin) presses **Accept** or the outline **Reject** in Review. Both open **"Review Task: …"** (`ReviewAVModal`): the original estimate, the completion date, the links and attachments that were handed off, and a domain option (Development: "Require Cypress Test Script").
   - **Accept** → **Completed**; the toast's link opens Archive → Completed.
   - **Reject** → a **Rejection Reason** dialog stacks over the review (Figma `791:99377`; six handoff reasons, Other with text) → the AV goes **back to the domain's last step**, and the toast gives the reason. The assignee fixes it and hands off again.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Overdue, no reason | "Please select a reason before completing the AV" under Overdue Reason; the dialog stays open | Pick a reason |
| Cancel or Escape | Nothing moves; focus returns to the button | — |
| The review is rejected | Back at the last step, with the reason in the toast | Fix it and hand off again |

## Completion or exit
- **Done:** Completed, in Archive → Completed. (Development's `pendingDeploy` gate, an admin's Deploy after Completed, isn't in the prototype yet.)
- **Not in this flow:** handing off several at once (AV · 09), the initiator being told (Activity · 02).

## Unresolved questions
- **The decided handoff form.** On 6 Nov the Handoff Date became a required calendar field, in one form shared by single and bulk handoff, with shared attachments. That's Eve's DS #279/#287; the prototype runs 0.3.0's dialog, where the date isn't required. Should AV · 07 wait for them, or move over when they land?
- **Focus on a blocked handoff.** With no overdue reason, the error appears but focus stays on the dialog, not the field (a DS follow-up for the shared form).
- **Date format:** the dialogs read "05-11-2026"; the 6 Nov decision is dd/mm/yyyy (being fixed in the DS from the main session).
- **Handoff & Publish:** what "publish" does isn't drawn; the prototype only words the toast differently.
- **Where it lands:** the AV stays open after a handoff and after a review (as AV · 06 decided for Accept/Reject).
