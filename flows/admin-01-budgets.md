# Admin · 01 Domain budgets

**ID:** `admin-01-budgets` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #347** (a super admin's Domain Budget in the rail, and the `wallet` glyph), not released
**FigJam:** [Admin · 01 Domain budgets](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=74-186) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Domain Budget Edit `696:54963` (table `701:67744`, tooltips and editing `701:67769`, saving `701:67761`, saved `701:67752`, Allocated Points Input flows `705:82511`) · Domain Budget Dashboard View `696:54964` (current `696:55584`, past `758:94757`, upcoming `760:97847`, levels of consumption `699:64547`)
**Scenarios:** [`src/flows/admin-01-budgets.ts`](../src/flows/admin-01-budgets.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Give each domain a budget of development points per quarter, and let its admin see how much is left.

## Actor, entry points and starting conditions
- **A super admin** sets the budgets: **Domain Budget** in their rail (DS #347), every domain in one table.
- **An admin** reads their own domain's on the **Dashboard**, under the Value Cards. The prototype's admin is Development's.
- A budget is **points, per domain, per quarter** (Q1–Q4 of a year). Today is 05/11/2026: Q4 2026 is current.

## Main steps and decision points
1. **The table** (DS `BudgetTable`, Figma `701:67744`): Q1–Q4 and the year top right; per domain, **Allocated Points** (a number field with arrows), **Consumed** (with its bar), **Remaining** (red when negative), **Optional Notes**.
2. **Change an allocation**: the arrows update Remaining and the bar at once; typing does after a brief pause (Figma's two flows). Only numbers go in. A domain with no budget says "Set Budget" and counts as 0.
3. **A note** grows while it's written and folds to one line after.
4. **Save Changes** (one, for the quarter shown): it spins while saving and locks the table and the quarter controls; then **"Changes Saved"** ("Your updates have been saved successfully!").
5. **The admin's card** (DS `DomainBudgetSummary`, Figma `696:55584`): Allocated, Consumed, Remaining; the quarter, its end and days left; **Budget Usage**, blue below 75%, amber from 75%, red from 100%. A past quarter shows its dates, an upcoming one its dates, each with **Go to Current Quarter**.
6. **The two are one budget**: what the super admin saves is what the admin's card reads.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Consumed past the allocation | Remaining negative in red; the bar red (Figma: shown, not blocked) | Raise the allocation |
| No budget for the quarter | "Set Budget" in every field; the admin's card shows 0 | Set it |
| Leaving with unsaved edits | The browser asks first | Stay and save |

## Completion or exit
- **Done:** each domain has its points for the quarter, and its admin can see what's left.

## The prototype's own rules (Figma doesn't say)
- **Consumed** for Development is the points of its AVs that start in the quarter (accepted onwards); the other domains' are sample figures (their AVs aren't in the prototype).
- **Switching quarter keeps unsaved edits**; Save saves the quarter shown.
- **Saving always works** (no server).
- The super admin can edit **any** quarter, past ones included.

## Unresolved questions
- **Past and upcoming quarters**: may a super admin edit a past quarter's budget? Figma only draws the current one.
- **Unsaved edits**: switching quarter, or leaving inside the app, with edits not saved: warn, keep (as built), or drop?
- **Validation**: zero, decimals, a value below what's consumed: allowed? Figma says only "only numbers are accepted".
- **The admin's domain**: Figma picks it with the domain switcher at the top of the rail. One domain per admin, or a switcher?
- **Notes**: only the super admin sees them. Should the admin's card show the note?
- **"Cycle" or "quarter"**: Figma's tooltips say cycle; the budget is per quarter. Which word?
