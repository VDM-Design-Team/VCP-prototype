# Admin · 03 Manage added values

**ID:** `admin-03-manage` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #359** (a person's domain in the members' tooltip), **#360** (the Items select and range on `AVTable`'s pagination), **#361** (a ✕ to clear a one-person filter) and **#363** (`FilterBar`'s labelled fields in Figma's order), not merged
**FigJam:** [Admin · 03 Manage added values](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=83-257) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, Manage Added Values page `940:164973`: the page `940:167946`, Filter by Assignee and Clear `940:171256`, Member Tooltip `2007:182514`
**Scenarios:** [`src/flows/admin-03-manage.ts`](../src/flows/admin-03-manage.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Find the Added Values that need an admin's attention in their domain, by who, what and when, and see who is on each.

## Actor, entry points and starting conditions
- **An admin**, from **Manage** in the rail. The list is the domain picked in the rail's switcher (Admin · 01): every open Added Value there, Pending ones included. Drafts and the archive (Completed, Rejected, Backlog) aren't on it.
- Deciding (AV · 06) and changing several at once (AV · 09) start here; this flow is finding them.

## Main steps and decision points
1. **The card** (DS `AVTable` with `FilterBar` in its card, Figma `940:167946`): "Search by title or ID" at the left, **Reset Filters** and **Filters** (shows or hides the fields) at the right, then the fields under them, each labelled: **Priority**, **Tags**, **Status**, **Date** (a period), **Assignee** and **Initiator** (DS #363).
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
- **Date** (decided 10 Nov 2026: the Added Values live during the period, not by due or start date). The rule as built: an Added Value's life runs **from the day it was initiated to the day it was completed or rejected** (its history's date for that change, else its due date, else its last update); **an open one is still live**. It is in when its life **overlaps** the period: initiated on or before the period's last day, and not closed before its first day.
- **Priority** is the Added Value's urgency (Urgent, High, Normal, Low; "All priorities" clears it).
- **Tags**: an Added Value is in if it has any of the tags picked.
- **Members' domains**: the planning team (the Gantt's people) is Development's; anyone else is Design's (Figma writes "Design"). Order: the initiator, then the assignees.
- **Page size**: real data starts at **50** (Figma; decided 10 Nov 2026). The prototype starts at **10** so its few Added Values still show pages; Items offers 10, 25, 50 and 100.
- **Every list** (decided 10 Nov 2026) has Manage's filter row in the table's card and pages, less what makes no sense: Assigned has no Assignee, Drafts no Status or Initiator, the archive pages (Completed, Rejected, Backlogs) no Status. The members' tooltip is the same everywhere. (My Values isn't built in the prototype.)
- **Filters** starts open (Figma draws the fields shown).

## What Figma shows, and what the prototype uses
| Where | Figma | Prototype (DS) |
|---|---|---|
| Filter fields | labelled (Priority, Tags, Status, Date, Assignee, Initiator), in that order, six to a row under the search; Filters filled | same (DS #363) |
| Members | "Jack (Development) — Assignee"; the `+2` lists the rest one to a line | same (DS #359) |
| Pagination | First, Previous, pages, Next, Last; Items 50; "1-50 of 1,250" | same (DS #360); 10 a page in the prototype only |
| Due Date | "October 1, 2025" | dd/mm/yyyy, as every date (DS `formatDate`) |
| Members header | an ⓘ glyph with no copy | no glyph (the DS draws it only with copy) |

## Decided (10 Nov 2026)
- **The filter row follows Manage's Figma on every list**: labelled fields, Priority first (DS #363).
- **Date shows the Added Values live during the period** (rule above), not by due or start date.
- **Members: the initiator and the assignees**, initiator first (as built).
- **50 a page** for real data; the prototype keeps 10.
- **Every list** gets the filter row and pages, less the filters that make no sense there.
- **Dates read dd/mm/yyyy** everywhere, through the DS's `formatDate` (the Due Date tag and the prototype's other hand-made dates).

## Unresolved questions
- None open from this flow.
