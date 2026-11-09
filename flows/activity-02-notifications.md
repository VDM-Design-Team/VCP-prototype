# Activity · 02 Notifications

**ID:** `activity-02-notifications` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #342** (`TopBar` takes a `NotificationPopover`) and **#341** (the "reacted" kind), not released
**FigJam:** [Activity · 02 Notifications](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=68-211) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Notification Popover `474:23419`: on the AV page `474:24855`, sheets `1192:36357` / `1192:36363`, Flows `475:1238` (mark-as-read tooltip `477:56332`, mark read / unread `477:56333`, show more / less `1200:39428`, replying `1218:150788`), comment previews `1192:36373`, replying states `1210:146426` · Notification Inbox `1030:173233`
**Scenarios:** [`src/flows/activity-02-notifications.ts`](../src/flows/activity-02-notifications.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Know what happened to your Added Values and comments, and act on it without hunting for it.

## Actor, entry points and starting conditions
- **Anyone**, from **the bell** in the top bar on every page, or the **inbox** page.
- Sample: 7 notifications for Eve, 4 unread: Alice commented, Marvin reacted to Eve's reply, Lena mentioned Eve, Jack handed off; and older, read ones (moved, assigned, commented).

## Main steps and decision points
1. **The bell** (DS `NotificationBell`): a red dot when anything is unread; its name says how many ("Notifications, 4 unread").
2. **The popover** (DS `NotificationPopover` in `TopBar`, DS #342): newest first. Each row is a sentence the DS owns ("**Alice Carter commented on** *Title*."), with the time and, when unread, a blue dot. **All / Mentions** and **Unread only** narrow it; **⋯ → Mark all as read**.
3. **A comment row** shows the comment (Show More past three lines), its reactions and **Reply**. You can **react** (Activity · 01) and **reply** without leaving the page: the reply hides behind **Show Reply**, with **Edit** and **Delete** (Figma `1218:150788`). The thread is the AV's: what you do here is on the AV page, and back.
4. **"reacted to your comment"** (decided 9 Nov 2026; DS #341): the row shows your comment with its reactions. No Reply on it (it's your own).
5. **Mark one read or unread**: on hover or focus the dot becomes a check, "Mark as Read"; read, it's a filled check, "Mark as Unread" (Figma `477:56333`).
6. **Open a row**: its AV opens, and the popover closes.
7. **View notifications inbox** (the footer) opens **the inbox** (Figma `1030:173233`): every notification, without the comment previews, with **Show unread only**, **Mark all as read**, and the pager.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Nothing unread | The bell without its dot | — |
| Unread only, and all read | "No unread notifications" | Switch it off |
| A reply deleted | The notification is unread again (Figma: the dot comes back) | — |

## Completion or exit
- **Done:** what's new has been seen, answered, or opened; the dot goes when nothing is unread.

## The prototype's own rules (Figma doesn't say)
- **Opening a row reads it**, and goes to its AV. **Replying reads it** (Figma shows the dot gone); deleting the reply makes it unread again (Figma shows the dot back).
- **Mentions** shows the "mentioned you" rows.
- **The inbox keeps the rail**: Figma draws it with the top bar only, no rail.
- The footer link and a row open in the app (the prototype keeps its state); a modifier-click opens a new tab.

## Unresolved questions
- **Does opening the popover, or reading the AV, mark anything read?** The prototype reads a row only when it's opened or replied to.
- **The inbox page without the rail** (as Figma draws it), or with it (as built)?
- **Which events notify whom**: Figma implies it ("you"); the DS doc has the rules for the status kinds. Confirm "commented" goes to the initiator and assignees only.
- **An empty popover** (no notifications at all): Figma doesn't draw it; the DS says "No notifications".
- **Grouping by day** in the popover or the inbox: not drawn. Needed?
