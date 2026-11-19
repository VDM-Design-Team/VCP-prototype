# AV · 06 Accept / Reject

**ID:** `av-06-accept-reject` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Runs on **design system 1.2.0** (`DetailCardMenu` with the admin's moves after a decision, decided 13 Nov 2026)
**FigJam:** [AV · 06 Accept / Reject](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=35-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: AV in Pending `305:22280` · Accept_Added_Value_Modal `5939:149041` · Rejecting a Pending AV `1137:132507` (`1139:137352` → `137601` → `137751`; Other `1139:137784`) · AV was rejected `1094:95365` · AV in Accepted `810:192544` · Archive: Rejected `254:75925`
**Scenarios:** [`src/flows/av-06-accept-reject.ts`](../src/flows/av-06-accept-reject.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Decide a submitted Added Value: accept it into the work, or turn it down and say why. An admin can change that decision later.

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
4. **After the decision, an admin's ⋮ menu can undo it** *(decided 13 Nov 2026, the live product's menu; `DetailCardMenu` owns which moves appear, Figma does not draw them)*:

   | The AV is | An admin's ⋮ menu adds | What the move does |
   |---|---|---|
   | **Rejected** | Move to Backlog · Move to Pending · Move to Draft | **Move to Pending** puts it back in the admins' queue to be decided again; the rejection banner goes. Move to Draft sends it back to its initiator. |
   | **Accepted**, on a **domain step**, or in **Review** | Move to Backlog · Move to Draft | **Move to Backlog** parks it, with the required feedback as Remarks (AV · 05). Move to Draft sends it back to its initiator. |
   | **Completed** | nothing (Edit · Delete only) | Nothing moves a finished AV. |

   Every move is logged in Status History and confirmed by a toast; the AV stays open. A move back before acceptance (Draft, Pending, Backlog) drops the rejection reason, the Date Accepted and what was handed off; the plan (assignees, dates, points) stays *(the prototype's choice; not drawn)*. A user's menu is unchanged: Edit and Delete.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| No reason picked | Reject stays disabled; no error message (the DS's rule) | Pick a reason |
| Cancel or Escape on either dialog | Nothing changes; focus goes back to the button that opened it. The reject dialog forgets the reason | — |
| Not an admin | No Accept or Reject | — |
| A Backlog AV | The same two buttons (outline Reject), deciding it the same way; the Remarks go | — |
| Rejected by mistake | The red banner, and no decision buttons | An admin: ⋮ → **Move to Pending**, then decide it again |
| Accepted, but the work has to wait | The AV on its step | An admin: ⋮ → **Move to Backlog**, with feedback |

## Completion or exit
- **Done:** Accepted (next: Move to In Progress, then AV · 07 Hand off), or Rejected (in the archive, until an admin reopens it).
- **Not in this flow:** Multipart (AV · 10), the initiator being told (Activity · 02 Notifications), accepting or rejecting several at once (AV · 09 Bulk actions), the Review decision after a handoff (AV · 07).

## Decided (13 Nov 2026)
- **A decision can be changed by an admin.** A Rejected AV can be moved to Pending, to the Backlog or back to Draft; an AV that is accepted, on a domain step or in Review can be moved to the Backlog or back to Draft. This is the live product's menu, and it replaces the 9 Nov rule that there was no way out of Rejected. Completed gets no moves, and a Rejected AV gets no Accept button: it goes through Pending *(both the design system's choices in #396)*.

## Decided (9 Nov 2026)
- **After Accept or Reject the admin stays on the AV** (as built).
- **An admin can accept or reject any AV, their own included.**
- **Dates:** `DetailCard`'s Date Accepted moves to dd/mm/yyyy in the design system (being fixed from the main session).
- **Both Rejects are red:** decided 6 Nov; the reject dialog's button is fixed in Eve's DS #279.

## Unresolved questions
- **What a move back leaves on the AV.** The prototype keeps the plan and drops the rejection reason, the Date Accepted and the handoff. This is not drawn and not decided yet.
- **A multipart AV (AV · 10).** Moving a parent or one of its parts back is not handled: the parts stay as they are.
