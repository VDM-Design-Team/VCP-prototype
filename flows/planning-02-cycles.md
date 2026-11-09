# Planning · 02 Plan AVs into cycles

**ID:** `planning-02-cycles` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [Planning · 02 Plan AVs into cycles](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=56-172) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Planning Page `147:9972`: Planning List `1155:77272` · Flows `1155:77275`: dragging from Backlog `1155:77276` (has dates `1155:77333`, no dates `1155:77293`, another cycle `1155:77350`), inline editing, estimated dates · Assignee Availability `103:890`: Add Required Details `142:4943`, `142:4912`
**Scenarios:** [`src/flows/planning-02-cycles.ts`](../src/flows/planning-02-cycles.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Plan Backlog Added Values into cycles, each with dates, an assignee and points, and keep each cycle within its capacity.

## Actor, entry points and starting conditions
- **An admin of Development** (Planning is in the admin's rail; only Development has cycles). Planning → **Planning List**.
- The page (DS `PlanningFilters` + `PlanningTable`): the filters (search, status, priority, Reset), then **a section per cycle**, each with **Total Capacity** and **Capacity Remaining**, then the **Backlog**.
- Which cycles show: the one running and the next always; a later cycle once it has work in it; an earlier cycle while it still has unfinished work (so late AVs stay in view). The prototype's today is 05/11/2026, in Cycle 44.
- The Backlog is Development's AVs with the status **Backlog**: accepted once, then parked (AV · 05).

## Main steps and decision points
1. **Drag a Backlog row onto a cycle.** The cycle takes a blue outline while the row is over it (Figma `1155:77318`).
2. **What the drop does** depends on what the AV already has:
   - **An assignee, points and its own dates** → it joins **the cycle its Start Date is in** (`1155:77333`). If that cycle isn't on the page, **it appears** (`1155:77350`).
   - **An assignee and points, no dates** → it joins the cycle it was dropped on with **estimated dates**: Start Date = the cycle's first working day (today's, in the running cycle), Due Date = a working day per point plus one day's buffer. Both read "(est.)" and play the highlight (`1155:77293`).
   - **No assignee or no points** → **Add Required Details** (DS `MoveAVToCycleModal`, `142:4943`): an estimated Start Date and the cycle are filled in; the assignee (role, points), dates and Capacity Points are asked. Picking an assignee estimates the Due Date; a date set by hand is never overwritten.
3. In every case the AV becomes **Accepted** (logged in Status History), and the cycle's **Capacity Remaining** drops by its points. A toast names the cycle, and says why when it isn't the one dropped on.
4. **Assignee availability** in the dialog: **Busy** (other scheduled work in those dates): "This assignee is busy during the selected dates, but can still be assigned." **Unavailable** (on leave): "This assignee is not available during the selected dates and cannot be assigned.", listed under Unavailable with the day they're free.
5. **Edit in place** (any row): **Points** re-estimates the Due Date; a new **Start Date** is a real date, re-estimates the Due Date and moves the AV to that date's cycle; a new **Due Date** works the Start Date back. The recalculated date reads "(est.)" and plays the highlight.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| An unavailable assignee, Confirm | The error under their field, focus there, and the toast "Unavailable Assignee: A selected assignee is unavailable during the chosen dates. Please change the dates or remove this assignee before submitting." | Pick someone else, or change the dates |
| Details missing, Confirm | Each missing field says so | Fill them in |
| Cancel | The AV stays in the Backlog; focus on its title | — |
| Filters leave a section empty | "No Added Values here." in that section | Reset |

## Completion or exit
- **Done:** the AV is in a cycle, Accepted, with an assignee, points and dates; the cycle's capacity shows it.
- **Focus:** the dialog opens from a drag, so on Confirm or Cancel focus goes to the AV's title wherever it now is. An edit that moves a row to another cycle keeps focus on the same control in its new place.
- **Not in this flow:** moving AVs between cycles or back to the Backlog (Figma draws neither); the Gantt (Planning · 01) shows the result.

## The prototype's own rules (Figma doesn't give the numbers)
- **Capacity:** 10 points per person per cycle, for all seven people: 70 points. Capacity Remaining = 70 − the points of every AV in the cycle.
- **Estimate:** a point is a working day; plus one working day's buffer (the `PlanningTable` hint: "Due Date = Approx. Start Date + Approx. Working Days + Buffer").
- **Availability:** busy = another open, scheduled AV in those dates; unavailable = leave. Leave is one sample entry (Noah Foster, 16–20/11/2026) until the Holiday Registry (Planning · 03) owns it.
- **A drop opens the dialog** when the AV lacks an assignee or points (Figma never says what triggers it).
- **Dates in a cycle that has ended** count as no dates: the AV gets the dropped-on cycle's estimate.
- **A toast after a drop**: Figma shows none; without it, a screen-reader user hears nothing when the row moves.

## Unresolved questions
- **A keyboard way to plan an AV.** Dragging is pointer-only, which fails WCAG 2.5.7 and anyone on a keyboard. `PlanningTable`'s doc already names the fix, a "Move to cycle…" row action that opens the same dialog, but Figma doesn't draw it. Build it in the DS?
- **Over capacity:** Figma shows no warning. Should a drop that takes Capacity Remaining below 0 warn, block, or just show the negative number (as now)?
- **Capacity numbers:** where does Total Capacity come from (per person, per domain budget)? And does Capacity Remaining count Completed work?
- **Moving between cycles, or back to the Backlog:** not drawn. Needed?
- **View Cycle** (on Figma's filter row): nothing says what it opens, so the prototype leaves it out.
- **Which earlier cycles show:** the prototype keeps one while it has unfinished work. Right?
