# Admin · 02 Admin dashboard

**ID:** `admin-02-dashboard` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #354** (`ValueCards` exported from the package) and **#362** (the amber Carried Over dot), not merged. The prototype runs a local DS build on current `main` (which has the dashboard pieces), with the open PRs it uses merged in.
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
   - **Cycle Summary** (DS `CycleSummary`): Points Committed, Points Completed, Carried Over (what was unfinished when the cycle ended; 0 while it runs), and the gauge, green from 90%, amber 70–89%, red below 70% (Figma's Cycle Summary States). A finished cycle's gauge is **Completion**, completed ÷ committed. A running cycle's reads **"Of plan to date"**: completed against what the even burn says should be done by today, so a team on track is green from the first days.
   - **Value Cards** (DS `ValueCards`): Overdue, In Progress, Pending, Draft, for **whose** is picked: All, Initiated, Assigned (Figma's default) or Team.
   - **In Case You Missed it** (Activity · 03), the domain's.
   - **Team Capacity** (DS `TeamCapacity`): the team's points as Completed, Committed, Overdue, then Available, out of the **Planning List's Total Capacity** for the cycle, and "N points of capacity remaining this cycle."
   - **User Capacity** (DS `UserCapacity`): a row per person, from their working days, with their Leave.
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
- **A team's share of the Total Capacity** is its people's share of everyone (All Teams has the whole).
- **A person's row** in User Capacity: a point is a working day (Planning · 02), so it's the cycle's working days (no weekends or public holidays), with their own all-day leave in the Holiday Registry shown as Leave.
- **"Of plan to date"**: what should be done by today is the burndown's even line on today's working day; ahead of plan reads 100%. Nothing committed, or the cycle's first day, has no rate yet.
- **Teams** are the prototype's sample teams until the Settings flow where an admin makes them (decided: Settings, Admin · 04): Team Platform (Eve, John, Alice), Team Finance (Jack, Noah), Team Warehouse (Lena, Maya). Figma's names (Team Doms, Team John, Team Jayvee, QA) are sample text.
- **Value Cards**: Overdue is open AVs past their due date (not Pending, Draft or Backlog); In Progress includes Review; "Team" is Eve's team's AVs.
- **Sprint Metrics** shows the chosen cycle and the three before it (Figma draws four).
- **Burndown**: Committed is the even line from everything committed to zero; Completed is what's actually left, and Overdue what's past due, up to today.
- **Export** makes no file: the toast says what the file holds (decided below).

## Decided (10 Nov 2026)
- **Chart colours: the design system's one palette**, from tokens, Leave amber included. Figma's differing colours are Figma fixes (below).
- **Capacity: the Planning List's fixed Total Capacity per cycle**, so the two pages agree. Per-person rows still show leave.
- **Carried Over: unfinished at the cycle's end.** A running cycle shows 0.
- **The gauge: against days gone** for a running cycle ("Of plan to date"); a finished cycle keeps completed ÷ committed. The DS gauge needed no change: the rate is the caller's, and `completionLabel` names it.
- **Teams: an admin sets them in Settings**, creating teams and assigning people. The sample teams stay until that flow is built (noted for Admin · 04).
- **A domain without cycles: as built.**
- **The Carried Over dot: amber, as in Figma** (DS #362).
- **Export: the PDF is the cycle dashboard as shown, with its filters; the CSV is one row per Added Value in the cycle**, with its status, points, assignees and dates. The prototype keeps the toast, which says so.

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

Figma draws "Committed" in three blues across the four charts, and most chart colours aren't tokens; the DS gives every chart one palette from tokens, and that's what's kept (decided).

### Figma colour fixes
To bring Figma to the DS palette (`CHART_SERIES`): one colour per series on every chart, each a token.

| Figma, Dashboard Page `951:370905` | Series | Figma uses | Should use |
|---|---|---|---|
| Team and User Capacity | Completed | #63c270 (no token) | `accent.success.filled.surface` |
| Team and User Capacity | Committed | #5280e5 (no token) | `surface.brand.stronger` |
| Team and User Capacity | Overdue | `accent/critical/outline/border` #fb2c36 | `accent.critical.filled.surface` |
| User Capacity | Leave | `text/subtle` #94a3b8 (grey) | `accent.warning.filled.surface` (amber) |
| Sprint Metrics | Capacity | #7f9cf5 (no token) | `surface.brand.strong` (Available) |
| Sprint Metrics | Commitment | #3b82f6 (no token) | `surface.brand.stronger` |
| Sprint Metrics | Completed | #10b981 (no token) | `accent.success.filled.surface` |
| Sprint Metrics | Overdue | #f59e0b (no token, orange) | `accent.critical.filled.surface` (red) |
| Cycle Burndown | Completed | `accent/success/outline/border` #00c950 | `accent.success.filled.surface` |
| Cycle Burndown | Committed | #4285f4 (no token) | `surface.brand.stronger` |
| Cycle Burndown | Overdue | `accent/critical/outline/border` #fb2c36 | `accent.critical.filled.surface` |

Team Capacity's Available (`surface/brand/strong`) already matches. The Cycle Summary's dots aren't chart series: Committed (`action.primary.surface`) and Completed (`accent.success.outline.border`) match Figma. **Carried Over** was brown in the DS; it is amber now, as Figma draws it (decided 10 Nov 2026, DS #362): `accent.yellow.medium`, since the DS's `accent.warning.outline.border` is yellow-700 in light, nearly brown.

## Unresolved questions
- For the Settings flows (Admin · 04): where an admin creates teams and assigns people.
