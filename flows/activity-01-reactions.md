# Activity · 01 Comment reactions

**ID:** `activity-01-reactions` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Uses DS **#338** ("+N" expands, three names, focus stays) and **#341** (the "reacted" notification), not released
**FigJam:** [Activity · 01 Comment reactions](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=65-241) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, AV Comment Section `231:26974`: Comment Threads `231:27137` · Flows → Comment Reaction `634:68928`: Thumbs Up `620:55208`, the palette `643:70525`, joining `643:69881` / `644:93264`, removing yours `634:68953`, several reactions `657:4636` · Notification Popover `474:23419` (no reaction notification)
**Scenarios:** [`src/flows/activity-01-reactions.ts`](../src/flows/activity-01-reactions.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Answer a comment with a reaction instead of a reply, and see who reacted.

## Actor, entry points and starting conditions
- **Anyone** who can see an AV's comments, on the AV page. Every comment and reply has the same row (Figma).
- Sample: VCP-1205 (assigned to Eve) has Alice's comment, Marvin's (with Alice's 👀), and Eve's reply (👍 from Eve and Marvin).

## Main steps and decision points
1. **The reaction row** (DS `EmojiReactionPicker`, inside `CommentSection`), after the comment's controls: the quick **thumbs up**, **Add reaction**, then a pill per emoji with its count.
2. **Thumbs up**: one press adds "👍 1", outlined in blue (Own Reaction); the button's name turns to "Remove thumbs up reaction", and pressing it again takes it back.
3. **Add reaction** opens the palette: Hand Gestures, Smileys & People, Symbols (27, Figma's). A pick adds it and closes the palette; **picking one you already used takes it back** (Figma `644:92616`).
4. **Join** someone's reaction by pressing their pill: the count goes up and it turns blue.
5. **Take yours back** by pressing your own pill (blue): the count goes down and it turns grey; **at 0 the pill goes**, and focus moves to the next pill or to Add reaction (DS #338).
6. **Who reacted**: hover or focus a pill: "**You and Alice Carter** reacted with :eyes:". You first, then **up to three names, then "and N others"** (decided 9 Nov 2026; DS #338).
7. **Order**: pills sit in the order each emoji was first added (Figma: Several Reactions).
8. **More than five**: "+N" (named "Show N more reactions"). **Pressing it shows every pill in the row; "Show less" folds them** (decided 9 Nov 2026; DS #338).
9. **The author is told**: "**Eve reacted to your comment on** *Title*." (decided 9 Nov 2026; DS #341), in Activity · 02 Notifications. Not when they react to their own.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Their own comment | The same row; they can react to it (Figma shows the row on comments with Edit/Delete) | — |
| More than 5 emoji on a comment | "+N"; pressing it shows them all, "Show less" folds them | — |

## Completion or exit
- **Done:** the reaction shows on the comment for everyone, with the right count and names.
- **Not in this flow:** replying, editing, deleting and mentions (the AV page has Add Comment only, for now); reacting from the Notification Popover (Activity · 02).

## The prototype's own rules (Figma doesn't say)
- The palette opens below the button (where there's room); Figma draws it above.

## Decided (9 Nov 2026)
- **The author is notified** of a reaction: a new notification kind, "reacted to your comment" (DS #341), shown in Activity · 02.
- **Reacting to your own comment is allowed.**
- **"+N" expands the row** in place, with "Show less" to fold it (DS #338).
- **Who reacted**: three names, then "and N others" (DS #338).

## Unresolved questions
- None for this flow.
