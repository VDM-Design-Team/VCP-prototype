# Admin · 03 Manage added values

**ID:** `admin-03-manage` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #359** (a person's domain in the members' tooltip) and **#360** (the Items select and range on `AVTable`'s pagination), not merged
**FigJam:** [Admin · 03 Manage added values](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=83-257) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, Manage Added Values page `940:164973`: the page `940:167946`, Filter by Assignee and Clear `940:171256`, Member Tooltip `2007:182514`
**Scenarios:** [`src/flows/admin-03-manage.ts`](../src/flows/admin-03-manage.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Find the Added Values that need an admin's attention in their domain, by who, what and when, and see who is on each.

## Actor, entry points and starting conditions
- **An admin**, from **Manage** in the rail. The list is the domain picked in the rail's switcher (Admin · 01): every open Added Value there, Pending ones included. Drafts and the archive (Completed, Rejected, Backlog) aren't on it.
- Deciding (AV · 06) and changing several at once (AV · 09) start here; this flow is finding them.

## Main steps and decision points
1. **The card** (DS `AVTable` with `FilterBar` in its card, Figma `940:167946`): "Search by title or ID", **Reset Filters** and **Filters** (shows or hides the fields), then the fields: **Priority**, **Tags**, **Status**, **Date** (a period), **Assignee** and **Initiator**.
2. **The table**: Task Title (with its project, attachments and comments), Due Date, Urgency, Type, Status, Members, Last Updated; Task Title, Due Date and Last Updated sort.
3. **Filter by assignee** (Figma `940:171256`): the Assignee list starts with Unassigned, then the people, with a search. Pick one: the table narrows, and the field shows them with a clear ✕. Press it: the field is empty and the list is whole again.
4. **Members** (Figma `2007:182514`): hover a face for "Name (Domain) — Role"; the `+N` lists the rest, one to a line. The initiator is a member too; someone who is both says "Initiator, Assignee".
5. **Pages**: First, Previous, the page numbers, Next, Last; **Items** per page; "1-10 of 18".

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Nothing matches the filters | "No Added Values match these filters" | Change a filter, or Reset Filters |
| A domain with no open Added Values | "No open Added Values" | Pick another domain in the rail |
| A filter changed on page 2 | Back to page 1 | — |

## Completion or exit
- **Done:** the admin has the Added Values they were after, and opens one (its reference) or acts on several (AV · 09).

## The prototype's own rules (Figma doesn't say)
- **Date** filters by **due date**: an Added Value is in if its due date falls in the period (Figma says only "Select period").
- **Priority** is the Added Value's urgency (Urgent, High, Normal, Low; "All priorities" clears it).
- **Tags**: an Added Value is in if it has any of the tags picked.
- **Members' domains**: the planning team (the Gantt's people) is Development's; anyone else is Design's (Figma writes "Design"). Order: the initiator, then the assignees.
- **Ten a page** by default, so the prototype's few Added Values still show pages (Figma's default is 50); Items offers 10, 25, 50 and 100.
- **The members' tooltip** is the same on every list (they share the table); the filters in the card and the pages are Manage's.
- **Filters** starts open (Figma draws the fields shown).

## What Figma shows, and what the prototype uses
| Where | Figma | Prototype (DS) |
|---|---|---|
| Filter fields | labelled (Priority, Tags, Status, Date, Assignee, Initiator), in that order, six to a row under the search | DS `FilterBar`: no labels, in its own order (Period, Status, Priority, Tags, Assignee, Initiator), wrapping |
| Members | "Jack (Development) — Assignee"; the `+2` lists the rest one to a line | same (DS #359) |
| Pagination | First, Previous, pages, Next, Last; Items 50; "1-50 of 1,250" | same (DS #360), 10 a page |
| Members header | an ⓘ glyph with no copy | no glyph (the DS draws it only with copy) |

## Unresolved questions
- **The filter row**: should `FilterBar` follow Manage's Figma (labelled fields, Priority first), and does that hold for every list?
- **Date**: which date does "Select period" filter by: due, initiated, or last updated?
- **Members**: who counts: initiator and assignees (as built), or reviewers too? In what order?
- **Default page size**: 50 (Figma) for real data?
- **The other lists** (My Values, Assigned, Archive): do they get the same filters in the card and pages?
