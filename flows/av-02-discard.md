# AV · 02 Discard

**ID:** `av-02-discard` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Uses the design system's `Button` `critical-tertiary` (Figma's red text Discard; `danger-tertiary` before 1.0.0) and `NotificationItem` `discarded`, both in 1.0.0
**FigJam:** [AV · 02 Discard](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=87-257) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, AV Page: Editing AVs: Flows › Discard Button (Draft) `1026:166776` (the button `1026:168551`, "available while the AV is in Draft and Pending status" `1026:168578`, the confirm `1028:170470`, "Does the AV already have an ID?" `1028:173219`)
**Scenarios:** [`src/flows/av-02-discard.ts`](../src/flows/av-02-discard.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Throw away a draft that isn't wanted, before it's submitted.

## Actor, entry points and starting conditions
- **Whoever raised it**, or **an admin of its domain** (decided 10 Nov 2026), on an Added Value's edit page while it is a **Draft**; and anyone on **Create Added Value** (a new one, not saved yet). A new one and a saved draft are the same case *(proposed 24 Nov 2026, for creativedesignlead to confirm)*.
- Once it's submitted (Pending and on), there is no Discard. Nor is there for anyone else who can open its edit page.

## Main steps and decision points
1. **Discard** (DS `Button` `critical-tertiary`, red text) sits before Save as draft and Submit (Figma `1026:166776`).
2. **The confirm** (DS `ConfirmModal` with the `discardAV` recipe, since DS 2.0.0): a plain question, "Are you sure you want to discard this Added Value?", "This action cannot be undone. The item will be permanently removed.", **Cancel** and a red **Confirm**. It no longer names the AV: the page it is asked on does.
3. **Confirm**: the Added Value is removed for good. The toast is the DS `discarded` recipe, **"Draft discarded"**, and
   - with an ID: "Added Value VCP-1199 was discarded.";
   - a new one, never saved: no line under the title (Figma's "Does the AV already have an ID?").
4. **Where to**: **My Values** in the product (Figma); the prototype goes to the **Dashboard** until My Values is built (decided 10 Nov 2026).
5. **Notifications:** none change. A draft has told nobody: admins are told when it's submitted. (DS `NotificationItem` `discarded`, #366, was for a discarded Pending AV; with Draft-only Discard the prototype no longer uses it.)

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Cancel | The confirm closes and nothing happens (Figma); focus back on Discard | — |
| The AV is submitted (Pending and on) | No Discard: Save as draft and Submit only | An admin rejects it or moves it to the Backlog (AV · 05) |
| Someone who didn't raise it, and isn't an admin | No Discard | Ask whoever raised it, or an admin |

## Completion or exit
- **Done:** the draft is gone from every list.
- **Not in this flow:** deleting from the AV table (Eve's bulk delete, AV · 09), moving to the Backlog (AV · 05).

## The prototype's own rules (Figma doesn't say)
- **After a discard** the prototype goes to the **Dashboard**, as Submit does (AV · 01), because My Values isn't built.
- **The admin role** stands for "an admin of the AV's domain": Eve is admin of all three.
- **Nothing to undo**: the confirm says it can't be undone, so the toast has no Undo.

## What Figma shows, and what the prototype uses
| Where | Figma | Prototype |
|---|---|---|
| Discard | Style=Text, label `accent/critical/outline/content/hover` (red-700) | DS `critical-tertiary`, the same token |
| The confirm | "Are you sure you want to discard this Added Value?" · "This action cannot be undone. The item will be permanently removed." · Cancel, Confirm | the same words (DS `ConfirmModal`, `confirmations.discardAV`) |
| The toast | "Deleted!" · "Added Value “12065” has been discarded successfully." | "Draft discarded" · "Added Value VCP-1199 was discarded." (DS `discarded` recipe, 2.0.0) |
| After | My Values | the Dashboard, until My Values is built (decided) |
| Who | the initiator's page only | whoever raised it, and the domain's admins (decided) |
| Pending | the Discard flow allows it (`1026:168578`); the Pending edit page frame (`1043:239669`) draws no Discard | no Discard on Pending, as the frame draws it (proposed 24 Nov 2026) |

## Proposed (24 Nov 2026), for creativedesignlead to confirm
- **Draft only**: Discard while the AV is a **draft**, new or saved, and never once it's submitted. This replaces 10 Nov's "Draft or Pending". It matches Figma's Pending edit page frame (`1043:239669`), not its Discard flow note (`1026:168578`). With it, the discarded notification (10 Nov) never happens: a draft has told nobody.

## Decided (10 Nov 2026)
- ~~**Pending**: Discard while the AV is a **Draft or Pending**~~ (replaced by the proposal above, if confirmed).
- **Who**: **whoever raised it, and the domain's admins**. Nobody else sees Discard.
- **Where to**: **My Values** in the product; the **Dashboard** until it's built.
- ~~**Notifications**: they stay and **say it was discarded**~~ (no longer reached with Draft-only Discard).

## Unresolved questions
None.
