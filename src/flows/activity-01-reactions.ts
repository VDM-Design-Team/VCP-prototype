import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Activity · 01 Comment reactions — the flow doc is
 * `flows/activity-01-reactions.md`, the FigJam page is "Activity · 01 Comment
 * reactions". Anyone reacts to a comment or reply on an AV (DS `CommentSection`
 * and `EmojiReactionPicker`): the quick 👍, the palette, joining someone's
 * reaction, and taking yours back. Figma: AV Comment Section 231:26974, flows
 * "Comment Reaction" 634:68928.
 */

const PATH = "/added-values/vcp-1205";
const on = (text: string, target = "step:comments"): ScenarioStep => ({ text, target, path: PATH });
const press = (text: string, button: string): ScenarioStep => ({ text, target: `button:${button}`, path: PATH, action: true });
/* A step while the palette is open: no outline. */
const say = (text: string): ScenarioStep => ({ text, path: PATH });

const base = { status: "Implemented", testing: "Not tested", role: "user", start: PATH, setup: undefined } as const;
const conditions = "Eve as a User on VCP-1205 (assigned to her): Alice's comment, Marvin's with Alice's 👀, and Eve's reply with 👍 from her and Marvin.";

export const REACTION_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "activity-01-reactions.thumbs-up",
    steps: [
      on("VCP-1205's comments. Under each comment and reply: the thumbs up and Add reaction, then any reactions (Figma's reaction row)."),
      press("On Alice's comment, press the thumbs up (Figma: Reacting with Thumbs Up).", "React with thumbs up"),
      on("\"👍 1\" appears, outlined in blue: it's yours (Own Reaction). The button now says Remove thumbs up reaction; pressing it again takes it back."),
    ],
    name: "A quick thumbs up",
    demonstrates: "The quick 👍 button (Figma 620:55208).",
    conditions,
    simulated: "Reactions aren't saved; nobody is notified (Figma has no reaction notification).",
    expected: "A 👍 1 pill, yours, on Alice's comment.",
    task: "Let Alice know you like her idea, with one click.",
  },
  {
    ...base,
    id: "activity-01-reactions.palette",
    steps: [
      press("On Alice's comment, press Add reaction (the smiley with a plus).", "Add reaction"),
      say("The palette (Figma 644:92458): Hand Gestures, Smileys & People, Symbols. Pick 🙌; it closes. Then Next."),
      on("\"🙌 1\", yours. Reactions sit in the order they were first added (Figma: Several Reactions). Picking an emoji you already used takes it back (Figma 644:92616)."),
    ],
    name: "Pick from the palette",
    demonstrates: "The add-reaction palette (Figma 643:70525).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "A 🙌 1 pill, yours.",
    task: "Cheer Alice's idea with a raised-hands emoji.",
  },
  {
    ...base,
    id: "activity-01-reactions.join",
    steps: [
      on("Marvin's comment has \"👀 1\". Point at it, or Tab to it: \"Alice Carter reacted with :eyes:\" (Figma's who-reacted tooltip)."),
      press("Press 👀 to add yours.", "1 reaction, 👀"),
      on("\"👀 2\", now blue: yours too. Its tooltip reads \"You and Alice Carter reacted with :eyes:\" (Figma: Join Existing Emoji Reaction)."),
    ],
    name: "Join someone's reaction",
    demonstrates: "Adding to an existing reaction, and who reacted (Figma 644:93264).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "👀 2, yours and Alice's.",
    task: "Show Marvin you've seen his nudge, the way Alice did.",
  },
  {
    ...base,
    id: "activity-01-reactions.take-back",
    steps: [
      press("Open the reply under Marvin's comment: Show 1 Reply.", "Show 1 Reply"),
      on("Your reply has \"👍 2\": you and Marvin (Own Reaction, blue)."),
      press("Press it to take yours back (Figma: Removing Your Reaction).", "2 reactions, 👍, you reacted"),
      on("\"👍 1\", grey: Marvin's stays. Take back the last of a reaction and its pill goes; focus moves to the next pill, or to Add reaction (DS #338), never to the page."),
    ],
    name: "Take your reaction back",
    demonstrates: "Removing your reaction from a pill; a reply has the same row (Figma 634:68953).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "👍 1, Marvin's only.",
    task: "You thumbed-up your own reply by mistake: undo it.",
  },
];

export const REACTIONS_FLOW: FlowDef = {
  id: "activity-01-reactions",
  area: "Activity",
  number: "01",
  name: "Comment reactions",
  actor: "All users",
  goal: "Answer a comment with a reaction instead of a reply, and see who reacted.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=65-241",
  doc: "flows/activity-01-reactions.md",
  status: "Implemented",
  scenarios: REACTION_SCENARIOS,
};
