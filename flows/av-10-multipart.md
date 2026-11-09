# AV · 10 Multipart

**ID:** `av-10-multipart` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #272** (`MultipartSection`, `MultipartRow`, `ChildPartModal`), **#275** (multipart rows in `AVTable`, `MultipartParentChip`, `MultipartTableTag`) and **#332** (part titles in `AcceptPendingAVModal`, and its two-set minimum) and **#333** (read-only fields in `DetailCard`), none released
**FigJam:** [AV · 10 Multipart](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=47-72) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Enabling Multipart in AV acceptance `1404:132249` (`1404:132266` → `132267` → … → `132644`) · Accepting AV with Multipart + Custom Titles `1666:263661` · AV page with Multipart section `1405:140122` · Multipart in AV table `1405:143193`
**Scenarios:** [`src/flows/av-10-multipart.ts`](../src/flows/av-10-multipart.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Split an Added Value whose problem sets are separate pieces of work into parts that are tracked on their own, keeping the original as the parent for the overall progress.

## Actor, entry points and starting conditions
- **A Development admin** splits it, while accepting a Pending Development AV (AV · 06). **Only Development offers Multipart** (decided 9 Nov 2026), and **it needs two or more problem sets**: with one, Multipart Value is disabled and says "It needs at least two problem sets to split." (decided).
- **Editors** (an admin, or the AV's initiator) add and rename parts afterwards (decided 6 Nov 2026).

## Main steps and decision points
1. On a Pending Development AV, **Accept** → "Are you sure you want to accept this task?" → tick **Multipart Value**.
2. **Rename Individual parts** appears (DS #332): one row per problem set ("Problem Set 1"), with a **Preview** of its problem and an optional title. Blank means the default, **"(2/3) Parent title"** (Figma's).
3. **Confirm**: the AV is Accepted, and **each problem set becomes a part**: an AV of its own (its problem and solution, the parent's deliverables, desired outcome and details; no assignees or dates yet), Accepted, under the next free reference.
4. The parent's page gets a **Multipart** section (DS #272): "0% (0/3 parts completed)", a progress bar, one row per part (number, title, assignee, CP, due date, status), and an info glyph: "This Added Value is split into parts. Each part is tracked on its own; the Added Value is done when every part is completed." (decided 6 Nov 2026).
5. **A part's title opens it**; its page has a **Parent: VCP-1201** chip back to the parent.
6. **In the AV tables** (DS #275): the parent has a progress ring and a brand edge on its left; a part reads "2/3" and has a Parent chip, which opens the parent.
7. **Editors** see **Add Part** (ChildPartModal "Add a New Child Part to Multipart AV"; blank title: "(4/4) Parent title") and, on a row's hover or focus, an edit button ("Edit Child Part Title"; a blank title restores the default, decided 6 Nov 2026). **Adding a part renumbers the default titles** to the new count; typed titles stay (decided 9 Nov 2026).
8. **A part's edit page locks** Projects, AV Category, Type and Urgency, which it takes from its parent (Figma `1404:132644`; DS #333, decided 9 Nov 2026).
9. **The parent completes itself** when its last part is Completed, logged in Status History (decided 9 Nov 2026).

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Adding a part to a **Completed** AV | "Status will change: … the AV will be returned to In Progress." Confirm moves it back to In Progress | — |
| Not an editor | The section without Add Part or edit buttons | — |
| A Design (or other) AV | No Multipart choice in the Accept dialog | — |

## Completion or exit
- **Done:** the parent tracks its parts; each part runs its own life (AV · 07 for its handoff).
- **Not in this flow:** a parent going back when a completed part is reopened (no part can be reopened in the prototype yet).

## Decided (9 Nov 2026)
- The parent completes automatically when every part is Completed.
- A part inherits the deliverables, desired outcome and details; not assignees, dates or points.
- A part's edit page locks Projects, AV Category, Type and Urgency (DS #333, a new DS piece).
- Only Development offers Multipart, and it needs two or more problem sets (DS #332).
- Adding a part renumbers the default titles; typed titles stay.

## Unresolved questions
- None for this flow.
