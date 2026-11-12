# AV · 02 Discard

**ID:** `av-02-discard` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Uses the design system's `Button` `critical-tertiary` (Figma's red text Discard; `danger-tertiary` before 1.0.0) and `NotificationItem` `discarded`, both in 1.0.0
**FigJam:** [AV · 02 Discard](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=87-257) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, AV Page: Editing AVs: Flows › Discard Button (Draft) `1026:166776` (the button `1026:168551`, "available while the AV is in Draft and Pending status" `1026:168578`, the confirm `1028:170470`, "Does the AV already have an ID?" `1028:173219`)
**Scenarios:** [`src/flows/av-02-discard.ts`](../src/flows/av-02-discard.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Throw away an Added Value that isn't wanted, before anyone has accepted it.

## Actor, entry points and starting conditions
- **Whoever raised it**, or **an admin of its domain** (decided 10 Nov 2026), on an Added Value's edit page while it is a **Draft** or **Pending**; and anyone on **Create Added Value** (a new one, not saved yet).
- Once an admin has accepted it, there is no Discard. Nor is there for anyone else who can open its edit page.

## Main steps and decision points
1. **Discard** (DS `Button` `critical-tertiary`, red text) sits before Save as draft and Submit (Figma `1026:166776`).
2. **The confirm** (DS `ConfirmDeleteModal`, "the same modal used to delete AVs in the AV table"): "Are you sure you want to discard this Added Value?", "This action cannot be undone. The item will be permanently removed.", the AV's reference and title, **Cancel** and **Confirm**.
3. **Confirm**: the Added Value is removed for good. The toast: "Deleted!", and
   - with an ID: "Added Value “VCP-1199” has been discarded successfully.";
   - a new one, never saved: "Added Value has been discarded successfully." (Figma's "Does the AV already have an ID?").
4. **Where to**: **My Values** in the product (Figma); the prototype goes to the **Dashboard** until My Values is built (decided 10 Nov 2026).
5. **Notifications** (decided 10 Nov 2026): whoever was told of it (the admins, told of a Pending one) **keeps the row**, which now reads "**Lena Novak discarded** *Empty states for the archive pages*." and **no longer opens it** (DS `NotificationItem` `discarded`, #366). It comes to the top, unread.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Cancel | The confirm closes and nothing happens (Figma); focus back on Discard | — |
| The AV is past Pending (Accepted and on) | No Discard: Save as draft and Submit only | Move it to the Backlog (AV · 05), or ask an admin to reject it |
| Someone who didn't raise it, and isn't an admin | No Discard | Ask whoever raised it, or an admin |
| A notification about an AV that's gone | "… discarded *Title*.", plain text: nothing opens | — |

## Completion or exit
- **Done:** the Added Value is gone from every list; its notifications say it was discarded.
- **Not in this flow:** deleting from the AV table (Eve's bulk delete, AV · 09), moving to the Backlog (AV · 05).

## The prototype's own rules (Figma doesn't say)
- **After a discard** the prototype goes to the **Dashboard**, as Submit does (AV · 01), because My Values isn't built.
- **The admin role** stands for "an admin of the AV's domain": Eve is admin of all three. A row an admin's own discard turns into reads "You discarded …".
- **A discarded notification keeps the title**: the Added Value is gone, so the row carries it.
- **Nothing to undo**: the confirm says it can't be undone, so the toast has no Undo.

## What Figma shows, and what the prototype uses
| Where | Figma | Prototype |
|---|---|---|
| Discard | Style=Text, label `accent/critical/outline/content/hover` (red-700) | DS `critical-tertiary`, the same token |
| The confirm | "Are you sure you want to discard this Added Value?" · "This action cannot be undone. The item will be permanently removed." · Cancel, Confirm | the same words; the DS confirm also shows the AV's reference and title |
| The toast | "Deleted!" · "Added Value “12065” has been discarded successfully." | "Deleted!" · "Added Value “VCP-1199” …" |
| After | My Values | the Dashboard, until My Values is built (decided) |
| Who | the initiator's page only | whoever raised it, and the domain's admins (decided) |
| Notifications | not drawn | the row stays and says "discarded", and opens nothing (decided; DS #366) |
| Pending | the Discard flow allows it (`1026:168578`); the Pending edit page frame (`1043:239669`) draws no Discard | Discard on Pending, as the flow says |

## Decided (10 Nov 2026)
- **Pending**: Discard while the AV is a **Draft or Pending**, as Figma's Discard flow says (its Pending edit page frame `1043:239669` draws none: a Figma fix).
- **Who**: **whoever raised it, and the domain's admins**. Nobody else sees Discard.
- **Where to**: **My Values** in the product; the **Dashboard** until it's built.
- **Notifications**: they stay and **say it was discarded**; they no longer open the Added Value (DS `NotificationItem` `discarded`, #366).

## Unresolved questions
None.
