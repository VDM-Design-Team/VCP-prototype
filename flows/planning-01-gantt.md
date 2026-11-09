# Planning · 01 Gantt

**ID:** `planning-01-gantt` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [Planning · 01 Gantt](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=50-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, page Gantt Chart `1006:25630`: Cycle selected `1006:26299` / `1014:107853` · Month `1006:26275` · Year `1006:26287` · Tooltip · User and Project Filter Interaction `1745:303015`
**Scenarios:** [`src/flows/planning-01-gantt.ts`](../src/flows/planning-01-gantt.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
See who is doing what over time, and when people are free, across a team or a set of projects.

## Actor, entry points and starting conditions
- **An admin** (Planning is in the admin's rail). Planning → **Gantt Chart**.
- The prototype's "today" is 05/11/2026, inside Cycle 44 (27/10–09/11/2026), so the default view crosses a month boundary.

## Main steps and decision points
1. The chart opens on **the cycle around today** (DS `GanttChart`): a row per person, each closed row summing up their work ("3 Added Values · 18 pts"), and a hatched column for today.
2. **View** (Cycle, Monthly, Yearly) changes the period; **Previous period / Next period** step through it; the **period picker** jumps to one; **Today** comes back.
3. **Open a person's row**: one bar per task, from its start to its due date, with the project and points on the bar, and the person's figures: **WIP**, **Planned**, **EAD** (earliest available date) and **EAD TD** (days until then).
4. **A bar's tooltip** (hover or keyboard focus): its title, status, initiator and estimated due date.
5. **Projects** (one or more) regroups the rows by project, with the people under each. **Users** keeps only the people picked. The two combine. **Reset Filters** clears both.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Filters leave nothing | An empty chart for the period | Reset Filters |
| Data on its way | Placeholder rows; the filters switch off (`loading`) | — |

## Completion or exit
- **Done:** the admin has read the plan. Nothing changes on this page.
- **Not in this flow:** opening an AV from its bar (the planning data is separate sample data in the prototype); moving AVs between cycles (Planning · 02).

## Unresolved questions
- **Opening an AV from a bar:** should a bar open its Added Value? The prototype's planning data isn't joined to its AVs yet.
- **Who sees the Gantt:** the admin's rail has it. Do users get a read-only Gantt?
- **The bar's tooltip** leaves out points and the start date (they're on the bar and in its name). Enough?
