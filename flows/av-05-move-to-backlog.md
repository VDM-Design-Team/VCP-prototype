# AV · 05 Move to backlog

**ID:** `av-05-move-to-backlog` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #286** (`MoveToBacklogModal`, not released)
**FigJam:** [AV · 05 Move to backlog](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=32-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Move to Backlog flows `1090:27191` (Draft, normal user `1090:27691`; admin `1094:97730`) · More options menus `1101:106850` · `Move_Backlog_Modal` `7771:93171`
**Scenarios:** [`src/flows/av-05-move-to-backlog.ts`](../src/flows/av-05-move-to-backlog.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Park an Added Value that won't be worked on for now, and say why.

## Actor, entry points and starting conditions
- **The initiator**, on their own **Draft**; **an admin**, on a **Draft** or **Pending** AV. `DetailCardMenu` owns who sees Move to Backlog.
- Starts from **Move to Backlog** in the ⋮ menu on the AV's page.

## Main steps and decision points
1. ⋮ → **Move to Backlog**. The **"Move Added Value to Backlog"** dialog opens (DS `MoveToBacklogModal`, #286) with one optional field, **Feedback**.
2. **Move to Backlog**: the AV moves to **Backlog** (logged in Status History). The dialog closes and the AV stays open (Figma), now with a yellow **Remarks** banner holding the feedback. A toast confirms it, with a link to Archive → Backlogs *(the toast is inferred)*.
3. The AV is listed in **Archive → Backlogs**, and leaves Drafts, Manage and Assigned.
4. **Getting it back:** an admin's ⋮ on a Backlog AV has **Move to Pending** and **Move to Draft**. The Remarks go when it leaves the Backlog.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Cancel (or Escape) | Nothing moves; focus returns to the ⋮ button | — |
| No feedback | It moves; no Remarks banner *(inferred)*; the toast says no feedback was given | — |
| Reopening the dialog | The field is empty again: it resets every time it opens | — |

## Completion or exit
- **Done:** the AV is in the Backlog, with Remarks if feedback was given.
- **Out of the Backlog:** an admin's Move to Pending or Move to Draft (this flow).

## Unresolved questions
- **How does the initiator get their AV back?** Figma's sticky says "Edit, then Save as Draft". On 9 Nov 2026 the user decided Save as draft past Draft **only saves the changes**, so in the prototype it stays in the Backlog. Which wins? Or does the initiator's Backlog menu need Move to Draft?
- **Accept and Reject on a Backlog AV.** Figma's admin Backlog page draws Accept and Reject in the header; the DS's `StatusProgression` offers no moves on Backlog, so the prototype shows none. Design system follow-up, or a Figma leftover?
- **No feedback, no banner?** Figma only draws the banner with text.
- **Where it lands:** Figma keeps the AV open; the toast and its archive link are the prototype's.
- **For DS #286 (Eve):**
  - its footer uses plain `sm` Buttons; the 6 Nov decision is `ModalCancel`/`ModalConfirm`, 40 high, everywhere;
  - focus opens on the dialog, not the Feedback field (the one thing to do there).
