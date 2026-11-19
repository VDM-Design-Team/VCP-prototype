# AV · 07 Hand off

**ID:** `av-07-hand-off` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Runs on **design system 1.2.0** (a handoff needs a demo link or an attachment, decided 13 Nov 2026)
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
   - **Handoff Date** (required, chosen from the calendar; prefilled with today, and **Handoff** stays disabled while it is empty), **Demo Links** (Add Another Link), **Attachments** (the AV's files as cards that can be removed, plus a drop zone);
   - **something to review is required** *(decided 13 Nov 2026)*: **at least one demo link or one attachment**. The rule is written under Demo Links ("A handoff needs at least one demo link or one attachment."). A file already on the AV counts while it isn't removed in the dialog; a link that is typed must be a valid `https://` address. A file counts as well as a link, so work without a URL can be handed off;
   - **overdue:** a warning banner ("This value is Overdue by 3 days"), a **required Overdue Reason** (six reasons) and optional Additional Notes;
   - **footer by domain:** Design: Cancel · **Handoff**. Development: Cancel · Handoff · **Handoff & Publish**.
2. **Handoff** → the AV moves to **Review**, logged; a toast names who reviews it ("Marvin Ode reviews it next"). The assignee has no more moves.
3. The initiator (or an admin) presses **Accept** or the outline **Reject** in Review. Both open **"Review Task: …"** (`ReviewAVModal`): the original estimate, the completion date, the links and attachments that were handed off, and a domain option (Development: "Require Cypress Test Script").
   - **Accept** → **Completed**; the toast's link opens Archive → Completed.
   - **Reject** → a **Rejection Reason** dialog stacks over the review (Figma `791:99377`; six handoff reasons, Other with text) → the AV goes **back to the domain's last step**, and the toast gives the reason. The assignee fixes it and hands off again.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Overdue, no reason | "Please select a reason before completing the AV" under Overdue Reason; the dialog stays open and focus goes to the field | Pick a reason |
| No demo link and no attachment | **"Add a demo link or attach a file."** under Demo Links; the dialog stays open and focus goes to the first link box. The message goes as soon as there is a link or a file | Type a link or attach a file |
| Cancel or Escape | Nothing moves; focus returns to the button | — |
| The review is rejected | Back at the last step, with the reason in the toast | Fix it and hand off again |

## Completion or exit
- **Done:** Completed, in Archive → Completed. (Development's `pendingDeploy` gate, an admin's Deploy after Completed, isn't in the prototype yet.)
- **Not in this flow:** handing off several at once (AV · 09), the initiator being told (Activity · 02).

## Unresolved questions
- **The decided handoff form: done.** On 6 Nov the Handoff Date became a required calendar field, in one form shared by single and bulk handoff, with shared attachments. The prototype moved to it with design system 1.0.0 (12 Nov): the date is passed as ISO and a file removed in the dialog is left out of the handoff.
- **Decided 13 Nov 2026:** a handoff needs at least one demo link or one attachment. The scenarios that handed off with only a date now add a link, or use an AV that already has a file; "Nothing to review" walks the refusal.
- **Focus on a blocked handoff: done.** A refused handoff puts focus on the first field that is wrong: the date, the overdue reason, or the first link box.
- **Date format:** the handoff dialog's date reads dd/mm/yyyy since 1.0.0; the review dialog still reads "05-11-2026" (its dates are text the prototype passes); the 6 Nov decision is dd/mm/yyyy.
- **Handoff & Publish:** what "publish" does isn't drawn; the prototype only words the toast differently.
- **Where it lands:** the AV stays open after a handoff and after a review (as AV · 06 decided for Accept/Reject).
