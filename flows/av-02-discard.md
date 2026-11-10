# AV · 02 Discard

**ID:** `av-02-discard` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #365** (`Button` `danger-tertiary`, Figma's red text Discard), not merged
**FigJam:** [AV · 02 Discard](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=87-257) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, AV Page: Editing AVs: Flows › Discard Button (Draft) `1026:166776` (the button `1026:168551`, "available while the AV is in Draft and Pending status" `1026:168578`, the confirm `1028:170470`, "Does the AV already have an ID?" `1028:173219`)
**Scenarios:** [`src/flows/av-02-discard.ts`](../src/flows/av-02-discard.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Throw away an Added Value that isn't wanted, before anyone has accepted it.

## Actor, entry points and starting conditions
- **Anyone** on an Added Value's edit page while it is a **Draft** or **Pending**, or on **Create Added Value** (a new one, not saved yet).
- Once an admin has accepted it, there is no Discard.

## Main steps and decision points
1. **Discard** (DS `Button` `danger-tertiary`, red text) sits before Save as draft and Submit (Figma `1026:166776`).
2. **The confirm** (DS `ConfirmDeleteModal`, "the same modal used to delete AVs in the AV table"): "Are you sure you want to discard this Added Value?", "This action cannot be undone. The item will be permanently removed.", the AV's reference and title, **Cancel** and **Confirm**.
3. **Confirm**: the Added Value is removed for good. The toast: "Deleted!", and
   - with an ID: "Added Value “VCP-1199” has been discarded successfully.";
   - a new one, never saved: "Added Value has been discarded successfully." (Figma's "Does the AV already have an ID?").
4. **Where to**: the Dashboard (Figma: My Values, which isn't built in the prototype yet).

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Cancel | The confirm closes and nothing happens (Figma); focus back on Discard | — |
| The AV is past Pending (Accepted and on) | No Discard: Save as draft and Submit only | Move it to the Backlog (AV · 05), or ask an admin to reject it |

## Completion or exit
- **Done:** the Added Value is gone from every list.
- **Not in this flow:** deleting from the AV table (Eve's bulk delete, AV · 09), moving to the Backlog (AV · 05).

## The prototype's own rules (Figma doesn't say)
- **After a discard** the prototype goes to the **Dashboard**, as Submit does (AV · 01), because My Values isn't built.
- **Who can discard**: whoever can open the edit page (the initiator; an admin too). Figma draws only the initiator's page.
- **Nothing to undo**: the confirm says it can't be undone, so the toast has no Undo.

## What Figma shows, and what the prototype uses
| Where | Figma | Prototype |
|---|---|---|
| Discard | Style=Text, label `accent/critical/outline/content/hover` (red-700) | DS `danger-tertiary` (#365), the same token |
| The confirm | "Are you sure you want to discard this Added Value?" · "This action cannot be undone. The item will be permanently removed." · Cancel, Confirm | the same words; the DS confirm also shows the AV's reference and title |
| The toast | "Deleted!" · "Added Value “12065” has been discarded successfully." | "Deleted!" · "Added Value “VCP-1199” …" |
| After | My Values | the Dashboard |
| Pending | the Discard flow allows it (`1026:168578`); the Pending edit page frame (`1043:239669`) draws no Discard | Discard on Pending, as the flow says |

## Unresolved questions
- **Pending**: can a Pending AV be discarded? Figma's Discard flow says yes; its Pending edit page draws no Discard. Built: yes.
- **Who**: only the initiator, or an admin too?
- **Where to after a discard**: My Values (Figma) when it's built; until then the Dashboard?
- **What happens to a Pending AV's notifications** (the admin was told about it): do they go, or say it was discarded?
