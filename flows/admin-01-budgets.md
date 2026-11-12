# Admin · 01 Domain budgets

**ID:** `admin-01-budgets` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #347** (a super admin's Domain Budget in the rail, and the `wallet` glyph), **#350** (the bars' colours and the card's tooltip, as Figma) and **#351** (the note on the admin's card) and **#353** (the domain switcher's list, the switcher's width), none released
**FigJam:** [Admin · 01 Domain budgets](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=74-186) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Domain Budget Edit `696:54963` (table `701:67744`, tooltips and editing `701:67769`, saving `701:67761`, saved `701:67752`, Allocated Points Input flows `705:82511`) · Domain Budget Dashboard View `696:54964` (current `696:55584`, past `758:94757`, upcoming `760:97847`, levels of consumption `699:64547`)
**Scenarios:** [`src/flows/admin-01-budgets.ts`](../src/flows/admin-01-budgets.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Give each domain a budget of development points per quarter, and let its admin see how much is left.

## Actor, entry points and starting conditions
- **A super admin** sets the budgets: **Domain Budget** in their rail (DS #347), every domain in one table.
- **An admin** reads their domain's on the **Dashboard**: for Development on its **Quarter** view (Admin · 02, Figma `961:372017`), for a domain without cycles on its only view. An admin can look after **several domains** and picks one with the **domain switcher** at the top of the rail (Figma's admin menu; DS `Sidebar`'s `showDomainSelector`). The prototype's admin has Development, Design (BESA) and Content.
- A budget is **points, per domain, per quarter** (Q1–Q4 of a year). Today is 05/11/2026: Q4 2026 is current.

## Main steps and decision points
1. **The table** (DS `BudgetTable`, Figma `701:67744`): Q1–Q4 and the year top right; per domain, **Allocated Points** (a number field with arrows), **Consumed** (with its bar), **Remaining** (red when negative), **Optional Notes**.
2. **Change an allocation**: the arrows update Remaining and the bar at once; typing does after a brief pause (Figma's two flows). **Whole points only**: a decimal isn't taken. **Zero** is allowed, and so is **less than already consumed** (the domain shows over budget). A domain with no budget says "Set Budget" and counts as 0.
3. **A note** grows while it's written and folds to one line after.
4. **Save Changes** (one, for the quarter shown): it spins while saving and locks the table and the quarter controls; then **"Changes Saved"** ("Your updates have been saved successfully!").
5. **The admin's card** (DS `DomainBudgetSummary`, Figma `696:55584`), for the domain in the rail's switcher: Allocated, Consumed, Remaining; the quarter, its end and days left; **Budget Usage**, blue below 75%, amber from 75%, red from 100%; and under it the super admin's **note** for that domain. A past quarter shows its dates, an upcoming one its dates, each with **Go to Current Quarter**.
6. **Switching domain** changes the card, In Case You Missed It and the Manage list together: each shows the picked domain only.
7. **The two are one budget**: what the super admin saves is what the admin's card reads.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Consumed past the allocation | Remaining negative in red; the bar red (Figma: shown, not blocked) | Raise the allocation |
| No budget for the quarter | "Set Budget" in every field; the admin's card shows 0 | Set it |
| Switching quarter or year, or going to another page, with unsaved edits | **"Leave without saving?"**, the AV edit page's dialog: "Your changes to Q4 2026's budgets aren't saved. If you leave now, they're lost." | **Keep editing** (focus back on what was pressed), or **Leave** (the edits are dropped) |
| Closing the tab with unsaved edits | The browser's own prompt | Stay and save |
| A decimal typed | Not taken: the field goes back to its last whole number | Type whole points |

## Completion or exit
- **Done:** each domain has its points for the quarter, and its admin can see what's left.

## The prototype's own rules (Figma doesn't say)
- **Consumed** for Development is the points of its AVs that start in the quarter (accepted onwards); the other domains' are sample figures (their AVs aren't in the prototype).
- **Saving always works** (no server).
- **Design (BESA)'s and Content's Consumed** are sample figures; Content has no AVs in the prototype, so its Manage list is empty.
- **The View as bar** isn't guarded: switching role with unsaved edits drops them (it's the prototype's control, not the product's).

## Decided (10 Nov 2026)
- **Past quarters can be edited** by a super admin, like any other.
- **Unsaved edits ask first.** Switching quarter or year, or going to another page, opens the same "ask before leaving" dialog as the AV edit page.
- **Amounts:** zero is allowed, and so is a number below what's already consumed (the domain shows over budget). **No decimals**: whole points only (the DS number field already refuses them).
- **An admin can switch between several domains**, with the domain switcher in the rail, as in Figma's admin menu. It picks which domain's budget card and lists show.
- **The admin's card shows the super admin's note** for that domain (DS #351).
- **Colours follow Figma** on each surface (below).
- **Wording: "quarter" and "cycle" are different things** and never stand in for each other (the user, 10 Nov 2026). A budget is per quarter, so everything about its period says "quarter"; "cycle" is only a planning cycle. Where Figma's budget tooltips say "cycle" but mean the quarter, the prototype and the design system say "quarter" (DS #350): see Figma wording fixes below.

### What Figma shows, and what the prototype uses
Read from VCP Pages - Flows; correct it here if any of it is misread.

| Where | Figma | Before | Now |
|---|---|---|---|
| Admin card bar, under 75% | blue, `colors/surface/brand/strong` #1a56db | blue | blue (unchanged) |
| Admin card bar, 75–99% | amber, `colors/accent/warning/outline/border` #f0b100 | yellow-700 (`accent.warning.filled`) | `accent.yellow.medium`: #fdc700 in light, #f0b100 in dark (#350). No DS token is #f0b100 in light; an exact match needs a GDL token |
| Admin card bar, 100% and over | red, `colors/accent/critical/outline/border` #fb2c36 | red-600 (`accent.critical.filled`) | red-500, `accent.critical.outline.border` (#350): exact |
| Admin card Remaining | green `accent/success/outline/content` #008236; red `accent/critical/outline/content` #e7000b when negative | as Figma | unchanged |
| Admin card percent | "100%" even at 170/120 pts | the real figure (142%) | unchanged, flagged: Figma's label looks capped, maybe by accident |
| Super admin table bar | blue `surface/brand/strong`; red `accent/critical/outline/border` when over; **no amber** | amber from 75% | blue up to 100%, red over (#350) |
| Table bar track | white `surface/neutral/base`; `surface/neutral/faint` with nothing consumed | as Figma | unchanged |
| Table Remaining | `text/primary`; red `accent/critical/outline/content` when negative | as Figma | unchanged |
| Tooltips (same on both pages) | Allocated: "…assigned for the selected cycle…"; Consumed: "…calculated automatically from their points and active dates."; Remaining: "…Consumed points for the cycle…" | "quarter" in Allocated and Remaining (DS #350); Consumed as Figma |

### Figma wording fixes
Each says "cycle" but means the budget's quarter. None of the budget tooltips means a planning cycle.

| Figma | Where | Figma says | Should say |
|---|---|---|---|
| Domain Budget Edit, table `701:67744` (tooltips `701:67769`) | Allocated Points ⓘ | "Total development points assigned for the selected cycle. Unused points do not roll over." | "…for the selected quarter…" |
| Domain Budget Edit, table | Remaining ⓘ | "Remaining = Allocated - Consumed points for the cycle. Negative values indicate overspend." | "…points for the quarter…" |
| Domain Budget Dashboard View, card `696:55584` | Allocated ⓘ | as the table's | "…for the selected quarter…" |
| Domain Budget Dashboard View, card | Remaining ⓘ | as the table's | "…points for the quarter…" |

The red bar (red-500 on white) is 3.09:1 in light and 2.17:1 in dark: it clears 3:1 in light only. The words carry the figure, so the bar isn't the only signal.

## Unresolved questions
- **The card's percent**: Figma's over-budget card reads 100% at 170/120. Capped on purpose, or the real figure (142%) as built?
- **Amber in light**: Figma's #f0b100 has no DS token in light. Add one to GDL, or keep `accent.yellow.medium` (#fdc700)?
