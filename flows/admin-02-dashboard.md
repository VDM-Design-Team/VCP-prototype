# Admin · 02 Admin dashboard

**ID:** `admin-02-dashboard` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #354** (`ValueCards` exported from the package), not released. The prototype now runs a local DS build on current `main` (which has the dashboard pieces), with the open PRs it uses merged in.
**FigJam:** [Admin · 02 Admin dashboard](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=80-245) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, Dashboard Page `947:304368`: Cycle view `951:370905`, Quarter view `961:372017`, tooltips and dropdowns `964:375279`, Swapping Views `964:374002`, Cycle Summary States `964:375278`. Design Admin's Dashboard page `996:14932` is empty.
**Scenarios:** [`src/flows/admin-02-dashboard.ts`](../src/flows/admin-02-dashboard.ts), runnable from the Flows & Scenarios catalogue (`/flows`); the rules are in [`src/data/dashboard.ts`](../src/data/dashboard.ts)

## User goal
See how the domain's cycle and quarter are going: points, capacity, budget and what's waiting.

## Actor, entry points and starting conditions
- **An admin**, on the **Dashboard** (first in the rail). The prototype's admin looks after Development, Design (BESA) and Content (Admin · 01), and the rail's switcher picks which.
- **Development** plans in fortnightly cycles (Planning · 02), so its dashboard has two views, **Cycle** and **Quarter** (Figma). Today is 05/11/2026, in C44 (27 Oct – 9 Nov).
- A user's dashboard is unchanged (Activity · 03); the super admin's is not part of this flow.

## Main steps and decision points
1. **The header** (DS `DashboardHeader`): "Dashboard", the **Cycle | Quarter** switch, and on Cycle the filters (DS `DashboardFilters`): the **cycle** (a searchable list, "C44 (Oct 27, 2026 - Nov 09, 2026)"), the **year**, the **team**, **Reset Filters** and **Export Cycle Report** (PDF or CSV).
2. **Cycle view** (Figma `951:370905`), top to bottom:
   - **Cycle Summary** (DS `CycleSummary`): Points Committed, Points Completed, Carried Over, and the **Completion** gauge, green from 90%, amber 70–89%, red below 70% (Figma's Cycle Summary States).
   - **Value Cards** (DS `ValueCards`): Overdue, In Progress, Pending, Draft, for **whose** is picked: All, Initiated, Assigned (Figma's default) or Team.
   - **In Case You Missed it** (Activity · 03), the domain's.
   - **Team Capacity** (DS `TeamCapacity`): the team's points as Completed, Committed, Overdue, then Available, and "N points of capacity remaining this cycle."
   - **User Capacity** (DS `UserCapacity`): a row per person, with their Leave.
   - **Sprint Metrics** (DS `SprintMetrics`): the cycle and the three before it.
   - **Cycle Burndown** (DS `CycleBurndown`): what's left each working day, against an even burn; Completed, Remaining, Off-track under it.
3. **Quarter view** (Figma `961:372017`): **Domain Budget** (Admin · 01), **Value Cards**, and **Cycle Performance** (DS `CyclePerformance`), each cycle of the quarter as Available, Overdue and Completed, with its own filters (All or a team, quarter, year). No header filters.
4. **The view is kept** while the admin moves around the app, and a guided scenario can start on either.
5. **Another domain** (Design (BESA), Content) plans no cycles: no switch, and its dashboard is its Domain Budget, its Value Cards and In Case You Missed it.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| A cycle with nothing completed | Completion 0%, red | — (it fills as work completes) |
| A team over its capacity | No Available part; Remaining negative in the line | Move work (Planning · 02) |
| A cycle that's over | Its figures as they stood on its last day; what was unfinished is Carried Over | — |
| A domain without cycles | No Cycle view | Pick Development in the rail |

## Completion or exit
- **Done:** the admin knows how the cycle and the quarter stand, and what to chase.
- **Not in this flow:** the user's dashboard (Activity · 03), the super admin's (`SuperAdminMetrics`), editing the budget (Admin · 01), moving work between cycles (Planning · 02).

## The prototype's own rules (Figma doesn't say)
- **Work in a cycle** is Development's AVs accepted onwards with that cycle (Planning · 02's rule), each counted at its points (a person's own points, or an even share).
- **On a given day**, an AV is **Completed** once it was completed (its history), **Overdue** if past its due date, otherwise **Committed**. A cycle that's over is read on its last day.
- **Carried Over**: the unfinished points that run past their due date in this cycle; once the cycle is over, all its unfinished points.
- **Completion** = Points Completed ÷ Points Committed.
- **Capacity**: a point is a working day (Planning · 02), so a person's capacity is the cycle's working days (no weekends or public holidays), less their own all-day leave in the Holiday Registry. A team's is the sum. *This differs from the Planning List's Total Capacity, a fixed number per cycle (decided 9 Nov 2026).*
- **Teams** are the prototype's people, grouped: Team Platform (Eve, John, Alice), Team Finance (Jack, Noah), Team Warehouse (Lena, Maya). Figma's names (Team Doms, Team John, Team Jayvee, QA) are sample text.
- **Value Cards**: Overdue is open AVs past their due date (not Pending, Draft or Backlog); In Progress includes Review; "Team" is Eve's team's AVs.
- **Sprint Metrics** shows the chosen cycle and the three before it (Figma draws four).
- **Burndown**: Committed is the even line from everything committed to zero; Completed is what's actually left, and Overdue what's past due, up to today.
- **Export** makes no file: a toast says what would be exported.

## What Figma shows, and what the prototype uses
Read from VCP Pages - Flows; correct it here if any of it is misread.

| Where | Figma | Prototype (DS) |
|---|---|---|
| Header filters | beside the title, one row at 1722 wide | the DS header wraps them to a second row at 1440 |
| Cycle option | "C37 (Jul 20, 2026 - Aug 03, 2026)" | same pattern; the prototype's calendar starts C37 on Jul 21 |
| Value Cards | four cards, "Assigned" chosen | same |
| Cycle Summary dots | Committed `text/brand/medium` #1a56db, Completed `accent/success/outline/border` #00c950, Carried Over `accent/warning/outline/border` #f0b100 | DS `CycleSummary`'s own |
| Team and User Capacity | Completed #63c270 (no token), Committed #5280e5 (no token), Overdue `accent/critical/outline/border` #fb2c36, Available `surface/brand/strong` #1a56db, Leave `text/subtle` #94a3b8 | DS chart series: Completed `accent.success.filled`, Committed `surface.brand.stronger` (navy), Overdue `accent.critical.filled`, Available `surface.brand.strong`, **Leave amber** (`accent.warning.filled`) |
| Sprint Metrics | Capacity #7f9cf5, Commitment #3b82f6, Completed #10b981, Overdue #f59e0b (none are tokens) | the same DS chart series as above |
| Cycle Burndown | Completed #00c950 (`success/outline/border`), Committed #4285f4 (no token), Overdue #fb2c36, Available #1a56db | the DS series; the prototype draws no Available line |

Figma draws "Committed" in three blues across the four charts, and most chart colours aren't tokens; the DS gives every chart one palette from tokens. Which to follow is open (below).

## Unresolved questions
- **Chart colours**: follow Figma's per chart (several aren't tokens, and Committed differs between charts), or keep the DS's one palette? The biggest visible difference: Leave is grey in Figma, amber in the DS.
- **Capacity**: working days less leave (as built), or the Planning List's fixed Total Capacity per cycle?
- **Carried Over**: what counts? (Built: unfinished and past due; everything unfinished once the cycle ends.)
- **Completion mid-cycle**: it starts red and climbs. Should a running cycle be measured against the days gone, or show no colour until it ends?
- **Teams**: where do they come from (Settings, Admin · 04)?
- **A domain without cycles** (Design, Content): what is its dashboard? Figma's Design Admin page is empty; the prototype shows Domain Budget, Value Cards and the strip.
- **Export**: what's in the report, and do PDF and CSV hold the same?
