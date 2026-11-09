# AV · 04 Edit an AV

**ID:** `av-04-edit` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [AV · 04 Edit an AV](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=26-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Editing AV in Draft `1026:166675` · Editing AV in Pending `1043:239669` · "Projects" field error `1026:166742` · AV options menus `1101:106850`
**Scenarios:** [`src/flows/av-04-edit.ts`](../src/flows/av-04-edit.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Change an Added Value before it's accepted: finish a saved draft and submit it, or correct one that's waiting for review.

## Actor, entry points and starting conditions
- The AV's initiator. An admin sees Edit in the same menu.
- Starts from **Edit** in the ⋮ menu on the AV's page (`DetailCardMenu`). It opens **Edit VCP-1199** (`/added-values/<id>/edit`): the creation form, filled in from the AV, with its Status History under the description.
- Only a **Draft** or **Pending** AV opens there; Figma draws no other edit page.

## Main steps and decision points
1. Open the AV, then ⋮ → **Edit**.
2. Change what's needed. The buttons depend on the status:
   - **Draft:** Discard · Save as draft · Submit (Figma `1026:166675`).
   - **Pending:** Save as draft · Submit (Figma `1043:239669`).
3. **Submit** runs every check AV · 01 runs, plus **Projects** (Figma `1026:166742`):
   - a **Draft** moves to **Pending**: the edit page closes and the **Dashboard** opens with the "VCP-1199 submitted" toast and its Open it (as AV · 01);
   - a **Pending** AV stays Pending: the edit page closes and the AV's page opens, with "VCP-1200: changes saved" *(inferred)*.
4. **Save as draft** checks only the Title (as AV · 03):
   - a **Draft** stays a Draft: back to its page, "VCP-1199: changes saved" *(inferred)*;
   - a **Pending** AV moves **back to Draft** (Status History logs Pending → Draft): it leaves Manage and waits on Drafts *(inferred: Figma shows the button, not what it does)*.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Any Submit check fails (empty field, unpaired problem, tag rule, assignee away) | As AV · 01: one "Missing Input" toast per problem and the field errors; the first error is scrolled to and focused | Fix the field; Submit again |
| No project | "Please select a project tag before submitting" under Projects, and a "Missing Input" toast (Figma `1026:166742`) | Pick a project. *Applies to AV · 01 Submit too* |
| No Title on Save as draft | As AV · 03 | Type a title |
| Edit on an AV past Pending | An info toast: editing past Pending isn't designed yet | — |
| Discard on a draft | An info toast: AV · 02 Discard isn't in the prototype yet | — |

## Completion or exit
- **Done:** the change is saved; the AV is Pending (submitted), still Draft, still Pending, or back in Draft.
- **Leave early:** the back arrow returns to the AV's page without saving. **Discard** (AV · 02) is a separate flow.
- **Not covered yet:** Figma's AV View/Edit pages also draw how the parts of the form behave: assignee chips (`221:38212`), the tag dropdown (`221:38266`), deliverable links (`219:34084`), undo after removing a card (`23:5379`) and the viewers popover (`779:13784`). The prototype uses the design system's pieces as they are; those details get their own pass.

## Unresolved questions
- **Editing past Pending.** The ⋮ menu offers Edit at every status (`DetailCardMenu`), but Figma draws the edit page for Draft and Pending only. Is Edit hidden after Pending, or does an accepted AV edit some other way (e.g. the details card in place)?
- **Save as draft on a Pending AV:** does it take the AV back to Draft (the prototype's reading), or only save the changes? And may an admin do this to someone else's AV?
- **Where an edit lands.** The prototype opens the AV's page after a save, and the Dashboard after a draft is submitted (AV · 01's rule).
- **Leaving with unsaved changes.** The back arrow drops them silently. Should it ask?
- **"Duplicate to other Domains"** checkboxes sit on Figma's edit pages. That's AV · 08 Initiate to another domain, not built yet.
- **The page title.** Figma strikes through "Added Value Creation" on its edit pages; the prototype says "Edit VCP-1199".
- **Design system:** Figma's Discard is red text; `Button` has no such variant, so the prototype uses `tertiary`. Build one in the DS when AV · 02 is approved.
- **Projects is now checked on Submit** for new AVs too (AV · 01), since Figma's error says "before submitting".
