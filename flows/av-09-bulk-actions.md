# AV · 09 Bulk actions

**ID:** `av-09-bulk-actions` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #279** (`BulkActionBar`, `BulkActionConfirmModal`, `BulkActionFailedModal`, `Menu` submenus and search, `ConfirmDeleteAVModal` with several titles), not released · **Bulk Handoff on hold** until Eve's shared handoff form lands (decided 9 Nov 2026)
**FigJam:** [AV · 09 Bulk actions](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=43-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: AV Table (General) → Bulk Action in AV Tables `1699:152189` — Action bar `1707:166018` · Change Status `1722:278944` (confirmation popups `1714:248085` … `1714:261788`) · Changing Urgency `1722:280257` · Type `1722:280258` · Cycle `1722:280259` · Deleting `1722:280260` · Success toast `1728:282486` · Some failed `1737:287581`
**Scenarios:** [`src/flows/av-09-bulk-actions.ts`](../src/flows/av-09-bulk-actions.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Change several Added Values at once, instead of opening each one.

## Actor, entry points and starting conditions
- Anyone on an AV list with checkboxes: **Assigned** (a user) and **Manage** (an admin). What each may change differs; the AVs that can't take a change fail, with why.
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

## Who can change what (the prototype's rules; the server's aren't drawn)
| Change | Allowed when | Fails with |
|---|---|---|
| Pending Review › Accept / Reject | An admin, on a Pending (or Backlog) AV | "It's Confirmed prod, not Pending." / "Only an admin can…" |
| Review › Accept / Reject | Its initiator or an admin, on a Review AV | "It's …, not in Review." |
| Backlog | An admin on Draft or Pending; the initiator on their own Draft | "Only a Draft or Pending Added Value can go to the Backlog." |
| In Progress | An Accepted AV | "Only an Accepted one moves to In Progress." |
| A domain step | An In Progress AV whose domain has that step | "Design has no For QA step." |
| Urgency, Type | Always | — |
| Cycle | A Development AV | "Design Added Values have no Cycle." |
| Delete | Its initiator or an admin | "Only its initiator or an admin can delete it." |

## Completion or exit
- **Done:** the AVs that could take it are changed; the failures are named.
- **On hold:** **bulk Handoff** (Figma `Bulk_Action_Handoff_Popup`) waits for the shared single-and-bulk handoff form (decided 9 Nov 2026), so the Status menu leaves it out. Save as Draft and Submit, which Figma's Development list starts with, are left out too: they belong to the edit page.

## Unresolved questions
- **The rules above are the prototype's.** Which moves may each role make in bulk, and what does the server say when one fails?
- **Mixed domains.** The Status menu lists Development's steps and then Design's; a step the AV's domain lacks fails. Should the menu only offer what every selected AV can take?
- **Deleting in bulk** uses the failure summary's one sentence ("failed to update Status to Deleted"). A DS follow-up for a delete wording?
- **References in the summaries** are links that open the AV in a new tab, where the prototype starts from its sample data again.
- **Save as Draft and Submit** in Figma's bulk Status list: do they belong there?
