# Planning · 01 Gantt

**ID:** `planning-01-gantt` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [Planning · 01 Gantt](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=50-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, page Gantt Chart `1006:25630`: Cycle selected `1006:26299` / `1014:107853` · Month `1006:26275` · Year `1006:26287` · Tooltip · User and Project Filter Interaction `1745:303015`
**Scenarios:** [`src/flows/planning-01-gantt.ts`](../src/flows/planning-01-gantt.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
See who is doing what over time, and when people are free, across a team or a set of projects.

## Actor, entry points and starting conditions
- **An admin** (Planning is in the admin's rail). Planning → **Gantt Chart**. **Admins only**: users get no Gantt (decided 9 Nov 2026).
- **The bars are the prototype's Added Values**: one per assignee of every AV with a start and a due date that is Accepted, In Progress, in Review or Completed. Besides Eve's and Jack's sample AVs, the team's planned work is sample AVs of its own (VCP-1102 … VCP-1124), listed under the sample AVs on Manage and Archive → Completed. A change to an AV (its status, dates or assignees) shows on the chart.
- The prototype's "today" is 05/11/2026, inside Cycle 44 (27/10–09/11/2026), so the default view crosses a month boundary.

## Main steps and decision points
1. The chart opens on **the cycle around today** (DS `GanttChart`): a row per person, each closed row summing up their work ("3 Added Values · 18 pts"), and a hatched column for today.
2. **View** (Cycle, Monthly, Yearly) changes the period; **Previous period / Next period** step through it; the **period picker** jumps to one; **Today** comes back.
3. **Open a person's row**: one bar per task, from its start to its due date, with the project and points on the bar, and the person's figures: **WIP**, **Planned**, **EAD** (earliest available date) and **EAD TD** (days until then).
4. **A bar's tooltip** (hover or keyboard focus): its title, status, initiator and estimated due date. That is enough (decided 9 Nov 2026).
5. **Selecting a bar opens its Added Value** (decided 9 Nov 2026): the bar is a link (DS `GanttTask.href`), so with a modifier it opens in a new tab. **Back** returns to the Gantt.
6. **Projects** (one or more) regroups the rows by project, with the people under each. **Users** keeps only the people picked. The two combine. **Reset Filters** clears both.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Filters leave nothing | An empty chart for the period | Reset Filters |
| Data on its way | Placeholder rows; the filters switch off (`loading`) | — |

## Completion or exit
- **Done:** the admin has read the plan. Nothing changes on this page.
- **Not in this flow:** moving AVs between cycles (Planning · 02).

## Decided (9 Nov 2026)
- A bar opens its Added Value; the Gantt reads the prototype's AVs.
- Admins only, as now.
- The tooltip is enough: title, status, initiator, estimated due date (points and the start date are on the bar).

## Unresolved questions
- None for this flow.
