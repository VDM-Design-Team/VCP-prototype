# Activity · 02 Notifications

**ID:** `activity-02-notifications` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #342** (`TopBar` takes a `NotificationPopover`), **#341** (the "reacted" kind, and who hears of a comment) and **#343** (the inbox by day), not released
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
7. **View notifications inbox** (the footer) opens **the inbox** (Figma `1030:173233`): **full width, no left menu**, the logo top bar (decided 9 Nov 2026); every notification **grouped by day**, "Today", "Yesterday", "3 November" (decided; DS #343), without the comment previews, with **Show unread only**, **Mark all as read**, and the pager. The popover stays one list.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Nothing unread | The bell without its dot | — |
| No notifications at all | "No notifications" (the DS's empty state; a default, not asked) | — |
| Unread only, and all read | "No unread notifications" | Switch it off |
| A reply deleted | The notification is unread again (Figma: the dot comes back) | — |

## Completion or exit
- **Done:** what's new has been seen, answered, or opened; the dot goes when nothing is unread.

## The prototype's own rules (Figma doesn't say)
- **Mentions** shows the "mentioned you" rows.
- Deleting your reply makes the notification unread again (Figma shows the dot back).
- The footer link, a row and the inbox's logo open in the app (the prototype keeps its state); a modifier-click opens a new tab.

## Decided (9 Nov 2026)
- **What reads a notification:** opening it, or replying to it. Opening the popover or reading the AV elsewhere doesn't.
- **The inbox:** full width, no left menu, as Figma draws it.
- **Who hears of a new comment:** the initiator(s), assignee(s), anyone @mentioned, and anyone who has commented on the AV before (in the DS's "Who gets it", #341). Never the author.
- **Grouping by day:** in the inbox only (DS #343); the popover stays one list.

## Defaults (not asked)
- **An empty popover** keeps the DS's "No notifications" state.

## Unresolved questions
- None for this flow.
