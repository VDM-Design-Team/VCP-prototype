# AV · 04 Edit an AV

**ID:** `av-04-edit` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [AV · 04 Edit an AV](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=26-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Editing AV in Draft `1026:166675` · Editing AV in Pending `1043:239669` · "Projects" field error `1026:166742` · AV options menus `1101:106850`
**Scenarios:** [`src/flows/av-04-edit.ts`](../src/flows/av-04-edit.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Change an Added Value: finish a saved draft and submit it, or correct one already submitted.

## Actor, entry points and starting conditions
- The AV's initiator. An admin sees Edit in the same menu.
- Starts from **Edit** in the ⋮ menu on the AV's page (`DetailCardMenu`). It opens **Edit VCP-1199** (`/added-values/<id>/edit`): the creation form, filled in from the AV, with its Status History under the description.
- **The same page at every status** *(decided 9 Nov 2026)*. Figma draws it for a Draft and a Pending AV; the prototype reuses it for the rest.

## Main steps and decision points
1. Open the AV, then ⋮ → **Edit**.
2. Change what's needed. The buttons depend on the status:
   - **Draft and Pending:** Discard · Save as draft · Submit (Figma `1026:166675`; Discard is AV · 02, allowed in Draft and Pending by its flow, `1026:168578`, though the Pending frame `1043:239669` draws none).
   - **Any other status:** Save as draft · Submit.
3. **Submit** runs every check AV · 01 runs, plus **Projects** (Figma `1026:166742`):
   - a **Draft** moves to **Pending**: the edit page closes and the **Dashboard** opens with the "VCP-1199 submitted" toast and its Open it (as AV · 01);
   - any other AV keeps its status: the edit page closes and the AV's page opens, with "VCP-1200: changes saved" *(inferred)*.
4. **Save as draft** checks only the Title (as AV · 03):
   - **it only saves the changes**: the AV keeps its status, Draft or not *(decided 9 Nov 2026)*. The AV's page opens, with "changes saved" *(inferred)*.
5. **The back arrow** leaves at once if nothing changed. With unsaved changes it asks first *(decided 9 Nov 2026)*: **"Leave without saving?"** (the DS `Modal`, critical tone): **Keep editing** closes it and keeps the changes, focus back on the arrow; **Leave** drops them and opens the AV's page.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Any Submit check fails (empty field, unpaired problem, tag rule, assignee away) | As AV · 01: one "Missing Input" toast per problem and the field errors; the first error is scrolled to and focused | Fix the field; Submit again |
| No project | "Please select a project tag before submitting" under Projects, and a "Missing Input" toast (Figma `1026:166742`) | Pick a project. *Applies to AV · 01 Submit too* |
| No Title on Save as draft | As AV · 03 | Type a title |
| Discard on a Draft or Pending AV | AV · 02: the confirm, then the AV is gone | Cancel keeps it |

## Completion or exit
- **Done:** the change is saved; a submitted draft is Pending, anything else keeps its status.
- **Leave early:** the back arrow, which asks first if anything changed. The sidebar and the browser's own back don't ask yet. **Discard** (AV · 02) is a separate flow.
- **Not covered yet:** Figma's AV View/Edit pages also draw how the parts of the form behave: assignee chips (`221:38212`), the tag dropdown (`221:38266`), deliverable links (`219:34084`), undo after removing a card (`23:5379`) and the viewers popover (`779:13784`). The prototype uses the design system's pieces as they are; those details get their own pass.

## Unresolved questions
- **Decided 9 Nov 2026:** the same edit page at every status; Save as draft on an AV past Draft only saves the changes; the back arrow asks before dropping unsaved changes.
- **Where an edit lands.** The prototype opens the AV's page after a save, and the Dashboard after a draft is submitted (AV · 01's rule).
- **May an admin edit someone else's AV?** The ⋮ menu gives an admin Edit; the prototype lets them.
- **Past Draft, Save as draft and Submit both save.** Submit runs every check, Save as draft only the Title. Is a second button needed there?
- **The sidebar and the browser's back** don't ask about unsaved changes yet; only the page's back arrow does.
- **"Duplicate to other Domains"** checkboxes sit on Figma's edit pages. That's AV · 08 Initiate to another domain, not built yet.
- **The page title.** Figma strikes through "Added Value Creation" on its edit pages; the prototype says "Edit VCP-1199".
- **Design system:** Figma's Discard is red text: DS `Button` `critical-tertiary` (built for AV · 02; `danger-tertiary` before 1.0.0).
- **Projects is now checked on Submit** for new AVs too (AV · 01), since Figma's error says "before submitting".
- **The tag rule follows the AV's domain:** a Design AV needs a Design tag (placeholders: Design, Visual design, UX research). The sample AVs now carry a global tag, so they pass the rule when edited.
