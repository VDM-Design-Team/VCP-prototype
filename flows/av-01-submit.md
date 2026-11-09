# AV · 01 Submit an AV

**ID:** `av-01-submit` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet
**FigJam:** [AV · 01 Submit](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=14-226) (decision diagram, then screen by screen)
**Figma sources:** VCP Pages - Flows: Added value creation `2:11984` · Missing information `2:3928` · Multiple toast example `2:12151` · Assignee busy warning `103:30193`
**Scenarios:** [`src/flows/av-01-submit.ts`](../src/flows/av-01-submit.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Get a new Added Value in front of an admin: from Draft to Pending.

## Actor, entry points and starting conditions
- Any VCP user creating an Added Value (the initiator).
- Starts from **Create Added Value** in the top bar (any page) or on the empty Drafts page. It opens **Added Value Creation** (`/added-values/new`), with the initiator set to whoever is creating it.

## Main steps and decision points
1. Fill in the **Title**.
2. Fill in **Problems**, **Solutions**, **Acceptance Criteria / Deliverables** and **Desired Outcome**. Each problem needs its solution.
3. In the details card: **Tags** (one global tag and at least one tag of the AV's domain). Assignees, dates and the rest are optional here.
4. Press **Submit**. Every check runs at once:
   - every required field filled;
   - every problem paired with a solution;
   - the tag rule met;
   - no assignee **unavailable** (e.g. on leave) during the AV's dates.
5. All pass → the AV moves **Draft → Pending**, the creation page closes and the **Dashboard** opens, with a success toast ("VCP-1211 submitted") whose **Open it** shows the AV *(decided 6 Nov 2026; Figma draws no landing page)*. It waits for an admin to Accept or Reject (AV · 06).

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| A required field is empty | A critical **"Missing Input"** toast per empty field (✕, stays until dismissed, `announce: false`), and "You need to fill in this field before submitting the Added Value" under each field | Fill the field: its error clears at once. Submit again |
| A problem without its solution (or the reverse) | "Problem and solution should be filled together" under both cards of the pair | Fill the other card, or remove the problem |
| No tags | "Please select at least one tag before submitting" under Tags, and a toast | Add a global and a domain tag |
| Tags but the rule unmet | "Add one global tag / at least one Development tag before submitting" *(wording inferred)* | Add the missing kind of tag |
| An assignee is unavailable during the AV's dates | A critical **Assignee unavailable** banner over the details card, and a toast | Change the AV's dates, or remove that assignee |
| An assignee is busy (fully booked) | An amber **Assignee busy** banner. Submit still passes | Nothing required |

A new Submit replaces the last Submit's toasts instead of stacking more.

## Completion or exit
- **Done:** the AV is Pending, and the user is back on the Dashboard.
- **Leave early:** the back arrow; **Save as Draft** (AV · 03, its own flow and scenarios) keeps it a Draft on Drafts; **Discard** (AV · 02) is a separate flow, not in the prototype yet.

## Unresolved questions
- **Which tags are global, which are a domain's?** Figma names the rule, not the tags. The prototype uses placeholders: Performance, Accessibility and UX debt as global; Development, Frontend and Backend as the Development domain's.
- **The tag-rule message** when tags exist but the rule isn't met: Figma has only "Please select at least one tag before submitting".
- **Busy-assignee warning:** Figma draws it inside the assignee picker (`103:30193`). `DetailCard`'s add-assignee form is a plain picker with no availability, so the prototype shows a banner instead. Design system follow-up?
- **The Assignee field's error:** `DetailCard` accepts `errors.assignees` in its types but never draws it (only its dropdowns and dates show errors), so the block is a banner. Design system bug.
- **Which card the creation page uses:** Figma's creation page has Assignee, Start and Due Date and Capacity, which is `DetailCard`'s `editing` card. Its `new` card has none of them.
- **The status buttons in Figma's creation header** ("Return to In Progress", "Move to For QA") look copied from the AV page; the prototype leaves them out.
