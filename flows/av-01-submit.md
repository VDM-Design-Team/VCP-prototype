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
- **Several initiators, all equal** *(decided 12 Nov 2026)*: the + beside Initiator adds more, and each one counts wherever "the initiator" does (Drafts, Edit, Discard, reviewing a handoff, the Initiator filter). Remove them all and whoever saves it is its initiator.

## Main steps and decision points
1. Fill in the **Title**.
2. Fill in **Problems**, **Solutions**, **Acceptance Criteria / Deliverables** and **Desired Outcome**. Each problem needs its solution.
3. In the details card: **Projects** (Figma `1026:166742`) and **Tags** (at least one, of any kind: global or the AV's domain's; decided 26 Nov 2026). Assignees, dates and the rest are optional here.
4. Press **Submit**. Every check runs at once:
   - every required field filled;
   - every problem paired with a solution;
   - at least one tag;
   - no assignee **unavailable** (e.g. on leave) during the AV's dates.
5. All pass → the AV moves **Draft → Pending**, the creation page closes and the **Added Value's own page** opens, showing its reference and its Pending status, with a success toast ("VCP-1211 submitted") *(decided 13 Nov 2026, as the live product does; it replaces 6 Nov's "the Dashboard opens". Figma draws no landing page)*. It waits for an admin to Accept or Reject (AV · 06).

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| A required field is empty | A critical **"Missing input"** toast per empty field (the DS `missingInput` recipe with Figma's wording: ✕, `announce: false`, and since DS 2.0.0 it times out, because the error under the field stays), and "You need to fill in this field before submitting the Added Value" under each field | Fill the field: its error clears at once. Submit again |
| A problem without its solution (or the reverse) | "Problem and solution should be filled together" under both cards of the pair | Fill the other card, or remove the problem |
| No project | "Please select a project tag before submitting" under Projects, and a toast (Figma `1026:166742`; added with AV · 04) | Pick a project |
| No tags | "Please select at least one tag before submitting" under Tags, and a toast | Add any tag |
| An assignee is unavailable during the AV's dates | Their chip on the details card turns red at the edge and says so under it (DS `DetailCard`'s assignee availability, Development only), and Submit gives a toast | Change the AV's dates, or remove that assignee |
| An assignee is busy (fully booked) | Their chip turns amber at the edge and says they can still be assigned. Submit still passes | Nothing required |

A new Submit replaces the last Submit's toasts instead of stacking more.

## Completion or exit
- **Done:** the AV is Pending, and the user is on its page.
- **Leave early:** the back arrow; **Save as Draft** (AV · 03, its own flow and scenarios) keeps it a Draft on Drafts; **Discard** (AV · 02) throws a new one away, after a confirm.

## Unresolved questions
- **Which tags are global, which are a domain's?** Figma names no tags. The prototype uses placeholders: Performance, Accessibility and UX debt as global; Development, Frontend and Backend as the Development domain's.
- **Which card the creation page uses:** Figma's creation page has Assignee, Start and Due Date and Capacity, which is `DetailCard`'s `editing` card. Its `new` card has none of them.
- **The status buttons in Figma's creation header** ("Return to In Progress", "Move to For QA") look copied from the AV page; the prototype leaves them out.
