# Planning · 02 Plan AVs into cycles

**ID:** `planning-02-cycles` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #335** (`PlanningTable` moves anywhere and its Move menu), not released
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
5. **Move a planned AV** (decided 9 Nov 2026): drag it **to another cycle** (it keeps its status and gets that cycle's estimated dates) or **back to the Backlog** (status Backlog, logged; it keeps its assignee and points). Completed AVs don't move; **a cycle that has ended takes no rows** (its own late AVs can still leave).
6. **Without dragging** (decided; DS #335): every row that can move has a **Move button** (⇅, "Move VCP-1203 to…") in the last column: a menu of the sections it can go to, with their dates. It does exactly what a drag does (the same dialog when details are missing), and **focus follows the row** to its new section.
7. **Edit in place** (any row): **Points** re-estimates the Due Date; a new **Start Date** is a real date, re-estimates the Due Date and moves the AV to that date's cycle; a new **Due Date** works the Start Date back. The recalculated date reads "(est.)" and plays the highlight.

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
- **Not in this flow:** the Gantt (Planning · 01) shows the result; a Backlog AV leaves it.

## The prototype's own rules (Figma doesn't give the numbers)
- **Capacity numbers:** Cycle 45 has 50 points, Cycle 46 40, every other 60 (decided: a fixed number per cycle; these stand in for what an admin sets).
- **Estimate:** a point is a working day; plus one working day's buffer (the `PlanningTable` hint: "Due Date = Approx. Start Date + Approx. Working Days + Buffer").
- **Availability:** busy = another open, scheduled AV in those dates; unavailable = leave. Leave is one sample entry (Noah Foster, 16–20/11/2026) until the Holiday Registry (Planning · 03) owns it.
- **A drop opens the dialog** when the AV lacks an assignee or points (Figma never says what triggers it).
- **Dates in a cycle that has ended** count as no dates: the AV gets the dropped-on cycle's estimate.
- **A toast after a drop**: Figma shows none; without it, a screen-reader user hears nothing when the row moves.

## Decided (9 Nov 2026)
- **Moving without dragging:** a "Move … to…" button per row, built into the DS `PlanningTable` (#335). It opens the same dialog.
- **Over capacity:** as Figma. No warning, no block; Capacity Remaining just goes below 0.
- **Total Capacity:** a fixed number per cycle (an admin's figure).
- **Completed work counts** against its cycle's capacity.
- **Moves:** both, to another cycle and back to the Backlog, by drag and by the Move menu.
- **Earlier cycles:** shown while they have unfinished work.

## Unresolved questions
- **View Cycle** (on Figma's filter row): left out for now (decided); what it opens is still open.
