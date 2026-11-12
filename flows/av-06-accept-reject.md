# AV · 06 Accept / Reject

**ID:** `av-06-accept-reject` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Deciding from the Backlog depends on **DS #330** (not released)
**FigJam:** [AV · 06 Accept / Reject](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=35-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: AV in Pending `305:22280` · Accept_Added_Value_Modal `5939:149041` · Rejecting a Pending AV `1137:132507` (`1139:137352` → `137601` → `137751`; Other `1139:137784`) · AV was rejected `1094:95365` · AV in Accepted `810:192544` · Archive: Rejected `254:75925`
**Scenarios:** [`src/flows/av-06-accept-reject.ts`](../src/flows/av-06-accept-reject.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Decide a submitted Added Value: accept it into the work, or turn it down and say why.

## Actor, entry points and starting conditions
- **An admin.** The initiator and everyone else see no decision buttons (`StatusProgression` owns this).
- An admin finds Pending AVs on **Manage**, for the domain picked in the rail's switcher (Admin · 01, decided 10 Nov 2026). The reject scenario starts on Design (BESA), VCP-1202's domain.
- The AV is **Pending** (after AV · 01 or AV · 04), or **Backlog** (AV · 05; DS #330).
- Starts from **Manage** (every open AV, Pending included) → the AV's row → its page, where the header has **Reject** and **Accept**.

## Main steps and decision points
1. Open the Pending AV from Manage.
2. **Accept** → "Are you sure you want to accept this task?" (`AcceptPendingAVModal`) with the **Multipart** choice (AV · 10) → **Confirm**:
   - Pending → **Accepted**, Date Accepted set, logged in Status History;
   - the AV stays open; the header's next move is **Move to In Progress**; a toast "VCP-1201 accepted" *(inferred)*.
3. **Reject** → "Reject Added Value" (`RejectPendingAVModal`):
   - **Rejection Reason** is required: Reject stays faded until one is picked;
   - each reason shows what it means; **Other** shows an optional text field instead (Figma `1139:137784`);
   - **Reject** → Pending → **Rejected**: the AV stays open with a red **"This Task was rejected"** banner giving the reason (and the text, for Other) (Figma `1094:95365`); a toast links to Archive → Rejected *(inferred)*. It leaves Manage and is listed in **Archive → Rejected**.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| No reason picked | Reject stays disabled; no error message (the DS's rule) | Pick a reason |
| Cancel or Escape on either dialog | Nothing changes; focus goes back to the button that opened it. The reject dialog forgets the reason | — |
| Not an admin | No Accept or Reject | — |
| A Backlog AV | The same two buttons (outline Reject), deciding it the same way; the Remarks go (DS #330) | — |

## Completion or exit
- **Done:** Accepted (next: Move to In Progress, then AV · 07 Hand off), or Rejected (in the archive).
- **Not in this flow:** Multipart (AV · 10), the initiator being told (Activity · 02 Notifications), accepting or rejecting several at once (AV · 09 Bulk actions), the Review decision after a handoff (AV · 07).

## Decided (9 Nov 2026)
- **After Accept or Reject the admin stays on the AV** (as built).
- **Rejected is final:** there is no way out of Rejected. (Edit still opens the edit page, which only saves; it can't change the status.)
- **An admin can accept or reject any AV, their own included.**
- **Dates:** `DetailCard`'s Date Accepted moves to dd/mm/yyyy in the design system (being fixed from the main session).
- **Both Rejects are red:** decided 6 Nov; the reject dialog's button is fixed in Eve's DS #279.

## Unresolved questions
- None for this flow.
