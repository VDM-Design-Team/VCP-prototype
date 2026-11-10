# AV · 09 Bulk actions

**ID:** `av-09-bulk-actions` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #279** (`BulkActionBar`, `BulkActionConfirmModal`, `BulkActionFailedModal`, `Menu` submenus and search, `ConfirmDeleteAVModal` with several titles), not released · **Bulk Handoff on hold** until Eve's shared handoff form lands (decided 9 Nov 2026)
**FigJam:** [AV · 09 Bulk actions](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=43-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: AV Table (General) → Bulk Action in AV Tables `1699:152189` — Action bar `1707:166018` · Change Status `1722:278944` (confirmation popups `1714:248085` … `1714:261788`) · Changing Urgency `1722:280257` · Type `1722:280258` · Cycle `1722:280259` · Deleting `1722:280260` · Success toast `1728:282486` · Some failed `1737:287581`
**Scenarios:** [`src/flows/av-09-bulk-actions.ts`](../src/flows/av-09-bulk-actions.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Change several Added Values at once, instead of opening each one.

## Actor, entry points and starting conditions
- Anyone on an AV list with checkboxes: **Assigned** (a user) and **Manage** (an admin). The bar is the same for both (Figma).
- An admin's **Manage** lists one domain at a time, the one picked in the rail's switcher (Admin · 01, decided 10 Nov 2026). So a selection across domains happens on **Assigned**, which lists a person's AVs from every domain; the scenarios for it start there.
- Tick rows in the table (`AVTable` `selectable`).

## Main steps and decision points
1. Tick one or more rows. **The bar** appears under the table, centred: "2 Selected ✕" (clears), **Status**, **Urgency**, **Type**, **Cycle**, and a red **Delete** (DS `BulkActionBar`). Its menus open upward.
2. Choose:
   - **Status** ("Move to Status"): Pending Review › Accept / Reject, In Progress, the domains' steps, Review › Accept / Reject, Backlog;
   - **Urgency**, **Type**;
   - **Cycle**, a searchable list;
   - **Delete**.
3. Every choice **only asks**: a confirmation (`BulkActionConfirmModal`) titled for the change ("Change Urgency for 2 Added Values"), with the value and a collapsible **List of Added Values**. Some collect something, for all and per AV unless overridden:
   - Accept Pending: the Multipart Value choice (Development only);
   - Accept (Review): Require Cypress Test Script (Development) or Copy to Dev (Design);
   - Reject: a **required Rejection Reason** ("Select a rejection reason, or one for each Added Value.");
   - Backlog: optional Feedback.

   Delete opens `ConfirmDeleteAVModal` with every title.
4. **Confirm** changes every selected AV that can take it, clears the selection and shows **"Added Values Updated"**, e.g. "Urgency changed to High for 2 Added Values." (Figma `1728:282486`).
5. If some can't: **"Added Values Failed to Update"** (`BulkActionFailedModal`): "1 of 3 added values failed to update Status to Accepted", each with its reference, title and why (Figma `1737:287581`). **Got it** closes it.

## What Figma defines (the action bar, `1707:166018`)
- **The bar is the same for everyone**: "n Selected ✕", **Status**, **Urgency**, **Type**, **Cycle**, **Delete**. Figma draws it on Assigned, a user's list, with nothing restricted by role, so the prototype has no role rules (decided 9 Nov 2026).
- **Status** ("Move to Status", `Bulk_Actions_Dropdowns` `1707:169333`): Save as Draft, Submit, Pending Review › Accept / Reject, In Progress, Handoff, For Review, In QA, For QA, Ready for Deploy, Confirmed Prod, Review › Accept / Reject, Backlog.
  - **Only the steps every selected AV can take** (decided 9 Nov 2026): a domain's own steps appear only when every selected AV is in that domain.
  - **Left out:** Save as Draft and Submit (decided: they're the edit page's), and Handoff (on hold for the shared handoff form).
- **Urgency**: Low, Normal, High, Urgent. **Type**: Type 1–3. **Cycle**: the cycles, searchable.
- **Failures** are named with why in "Added Values Failed to Update" (`1737:287581`); Figma doesn't say what fails.

## Kept where Figma is silent
| Change | Fails when | Why it's kept |
|---|---|---|
| Pending Review › Accept / Reject | The AV isn't Pending: "It's Confirmed prod, not Pending." | The choice and its dialog ("Accept 3 Pending Added Values") are about Pending AVs |
| Review › Accept / Reject | The AV isn't in Review | The same, for a review |
| Cycle | The AV is Design's: "Design Added Values have no Cycle." | `DetailCard` gives Design no Cycle |

Everything else (In Progress, a step, Backlog, Urgency, Type, Delete) applies to every selected AV.

## Completion or exit
- **Done:** the AVs that could take it are changed; the failures are named.
- **On hold:** **bulk Handoff** (Figma `Bulk_Action_Handoff_Popup`) waits for the shared single-and-bulk handoff form (decided 9 Nov 2026), so the Status menu leaves it out. Save as Draft and Submit, which Figma's Development list starts with, are left out too: they belong to the edit page.

## Unresolved questions
- **Decided 9 Nov 2026:** the bar and its choices are Figma's, with no role rules; mixed domains get only their common steps; Save as Draft and Submit stay out; the failure dialog gets delete wording in the design system.
- **Delete wording in the DS:** `BulkActionFailedModal` is only in Eve's #279, not on main yet. Branch from #279, or wait for it to merge?
- **References in the summaries** are links that open the AV in a new tab, where the prototype starts from its sample data again.
