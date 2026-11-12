# AV · 05 Move to backlog

**ID:** `av-05-move-to-backlog` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #286** (`MoveToBacklogModal`) **and DS #330** (Accept/Reject on Backlog), neither released
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
4. **Getting it back:**
   - **the initiator:** ⋮ → **Edit**, then **Save as draft** moves it back to **Draft** *(decided 9 Nov 2026, Figma's rule; on any other status Save as draft only saves)*;
   - **an admin:** **Accept** or **Reject** in the header, as on Pending *(decided 9 Nov 2026; DS #330)*, or ⋮ → **Move to Pending** / **Move to Draft**.
   The Remarks go when it leaves the Backlog.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Cancel (or Escape) | Nothing moves; focus returns to the ⋮ button | — |
| No feedback | It moves; no Remarks banner *(inferred)*; the toast says no feedback was given | — |
| Reopening the dialog | The field is empty again: it resets every time it opens | — |

## Completion or exit
- **Done:** the AV is in the Backlog, with Remarks if feedback was given.
- **Out of the Backlog:** the initiator's Edit → Save as draft; an admin's Accept, Reject, Move to Pending or Move to Draft (this flow). Accept and Reject continue as AV · 06.

## Unresolved questions
- **Decided 9 Nov 2026:** the initiator brings a Backlog AV back with Edit → Save as draft (only on Backlog); an admin can Accept or Reject from the Backlog (added to the DS in #330).
- **No feedback, no banner?** Figma only draws the banner with text.
- **Where it lands:** Figma keeps the AV open; the toast and its archive link are the prototype's.
- **For DS #286 (Eve):**
  - its footer uses plain `sm` Buttons; the 6 Nov decision is `ModalCancel`/`ModalConfirm`, 40 high, everywhere;
  - focus opens on the dialog, not the Feedback field (posted on #286 by the design lead).
