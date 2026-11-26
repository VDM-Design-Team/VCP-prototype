# AV · 03 Save as Draft

**ID:** `av-03-save-as-draft` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [AV · 03 Save as Draft](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=23-313) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Added value creation `2:11984` · Drafts page `254:74539` · AV in Draft status `1331:26533`
**Scenarios:** [`src/flows/av-03-save-as-draft.ts`](../src/flows/av-03-save-as-draft.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Keep an Added Value that isn't finished, to finish and submit it later.

## Actor, entry points and starting conditions
- Any VCP user creating an Added Value (the initiator).
- Starts from **Save as draft** on **Added Value Creation** (`/added-values/new`), the same page as AV · 01 Submit. Anything may be filled in, or nothing.

## Main steps and decision points
1. Fill in whatever is ready, or nothing.
2. Press **Save as draft**. Nothing is checked. With no Title, it's saved as **"Draft - Nov 24, 2026 6:19 PM"** (the date and time it's saved), as the live product does *(24 Nov 2026, for creativedesignlead to confirm; it replaces the prototype's inferred "a draft needs a Title")*. Submit still needs a Title (AV · 01).
3. The AV is saved in **Draft** with the next free reference (VCP-1211), the creation page closes and **Drafts** opens, with a success toast ("VCP-1211 saved as a draft", "Only you can see it until it's submitted.", or "Only you and Marvin Ode…" when it has more initiators) whose **Open it** shows the draft *(inferred: Figma draws no landing page; Drafts mirrors Submit's "close and go back")*.
4. The draft is listed on **Drafts** (its initiator's own drafts only) and opens on its AV page: status Draft, no status buttons, the ⋮ menu with Move to Backlog, Edit and Delete (Figma `1331:26533`). Its Status History has one entry, Initial Creation → Draft.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| No Title | Nothing blocks: the draft is saved as "Draft - *date time*" | Rename it later in Edit (AV · 04) |
| A domain ticked in "Initiate to other Domains" whose copy has no title | A "Missing input" toast and an error under that copy's Title | Type the copy's title |
| Anything Submit would block (empty fields, an unpaired problem, the tag rule, an assignee away) | Nothing: **Submit's checks don't run** on a draft | Not needed. They run when the draft is submitted (AV · 04) |
| Submit was pressed first and blocked | Save as draft clears Submit's toasts and errors, then saves | — |

## Completion or exit
- **Done:** the AV is a Draft, on Drafts. Only its initiator sees it: Drafts lists the viewer's own drafts, and Manage and Assigned leave drafts out.
- **Next:** Edit (AV · 04) to finish and submit it; Move to Backlog (AV · 05); Delete. Leaving without saving is Discard (AV · 02).

## Unresolved questions
- **A copy for another domain still needs its own title** to save as a draft (AV · 08). Should it get an automatic title too?
- **Where does a saved draft land?** The prototype opens Drafts, with an Open it toast. Staying on the page, or opening the draft's page, are the alternatives.
- **What the draft's details hold when left blank.** `AddedValue` always has an Urgency and Type, so a draft saved without them shows Normal and Type 3. Should a draft show them empty?
- **Can an admin see other people's drafts?** The prototype says no: Manage leaves drafts out. But an admin's "Move to Draft" (DetailCardMenu) sends someone's AV back to Draft, after which only its initiator can find it.
- **Design system:** `StatusProgression` gives a Draft "Save as Draft" and "Submit" buttons, but Figma's Draft page (`1331:26533`) has none; the prototype turns them off there. Those two buttons belong on the edit page (AV · 04).
- **Design system (already logged):** `DetailCard` (viewing) draws an empty Assignee heading when a draft has no assignee.
