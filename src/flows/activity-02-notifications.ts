import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Activity · 02 Notifications — the flow doc is `flows/activity-02-notifications.md`,
 * the FigJam page is "Activity · 02 Notifications". The bell in the top bar opens
 * the latest notifications (DS NotificationPopover in TopBar, DS #342); a row opens
 * its AV; a comment can be answered or reacted to from there; the inbox lists
 * them all. Figma: Notification Popover 474:23419, Notification Inbox 1030:173232.
 */

const HOME = "/";
const AV = "/added-values/vcp-1205";
const INBOX = "/notifications";
const on = (text: string, target = "step:bell", path = HOME): ScenarioStep => ({ text, target, path });
/* A step inside the open popover: no outline, so the popover stays as it is. */
const say = (text: string, path = HOME): ScenarioStep => ({ text, path });
const press = (text: string, button: string, path = HOME): ScenarioStep => ({ text, target: `button:${button}`, path, action: true });
/* The bell, whatever its count says. */
const BELL = "button:Notifications*";
/* A press inside the popover. Next's own click closes the popover, so Next opens it again first (and the menu or
   palette the button is in, with `then`). */
const inside = (text: string, button: string, then: readonly string[] = [], path = HOME): ScenarioStep => ({
  text,
  target: `button:${button}`,
  path,
  action: true,
  first: [BELL, ...then],
});

const base = { status: "Implemented", testing: "Not tested", role: "user", start: HOME, setup: undefined } as const;
const conditions = "Eve as a User on the Dashboard, with 7 notifications, 4 unread: Alice's comment, Marvin's reaction to Eve's reply, Lena's mention, and Jack's handoff.";

export const NOTIFICATION_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "activity-02-notifications.the-bell",
    steps: [
      on("The bell has a red dot: there are unread notifications (its name says how many, \"Notifications, 4 unread\")."),
      press("Press the bell, or Next.", "Notifications, 4 unread"),
      say("The popover (Figma 474:24855): the latest first. Each row says who did what to which AV, and when; unread ones have the blue dot. A comment shows with its reactions, and you can reply or react right here. Scroll it, then Next."),
      inside("All / Mentions, and Unread only, narrow the list. Choose Mentions, or press Next: only Lena's mention.", "Mentions"),
      {
        ...say("Back to All, and switch Unread only on, or press Next: the four unread."),
        enter: { "Unread only": true },
        first: [BELL, "button:All"],
      },
      { ...say("At the foot: View notification inbox. Press it, or Next."), target: "link:/notifications", action: true, first: [BELL] },
      { text: "The inbox (Figma 1030:173233): full width, no left menu (decided 9 Nov 2026), the logo takes you home. Every notification, grouped by day (Today, Yesterday, 3 November …; decided), without the comment previews, with Show unread only, Mark all as read and the pager.", target: "step:inbox", path: INBOX },
    ],
    name: "The bell, its popover and the inbox",
    demonstrates: "The bell's dot, the popover's rows, its All / Mentions and Unread only filters, and the inbox its footer opens.",
    conditions,
    simulated: "The notifications are sample data; the inbox has one page of seven.",
    expected: "4 unread; Mentions shows 1; Unread only shows 4; the inbox, grouped by day.",
    task: "See what's new for you, then just what mentions you, then everything.",
  },
  {
    ...base,
    id: "activity-02-notifications.mark-read",
    steps: [
      press("Press the bell, or Next.", "Notifications, 4 unread"),
      inside("Point at Jack's handoff row: the blue dot turns into a check (\"Mark as Read\", Figma 477:56333). Press it, or Next: the dot goes and the bell's count drops. The filled check marks it unread again.", "Mark as read: Export for the task log trail"),
      inside("The ⋯ beside Unread only: Mark all as read. Press it, or Next.", "Mark all as read", ["button:More notification actions"]),
      on("Every dot goes, and so does the bell's: no red dot now."),
    ],
    name: "Mark read, and all as read",
    demonstrates: "Marking one read or unread (Figma's check), and Mark all as read.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "One read, then all read; the bell's dot goes.",
    task: "Clear your notifications.",
  },
  {
    ...base,
    id: "activity-02-notifications.open-one",
    steps: [
      press("Press the bell, or Next.", "Notifications, 4 unread"),
      inside("Press Alice's row (its text, not the comment), or Next: it opens VCP-1205.", "Unread: Alice Carter commented*"),
      { text: "The AV it's about, with Alice's comment; the popover closed. Opening a notification reads it: the bell says 3 unread.", target: "step:comments", path: AV },
    ],
    name: "Open a notification",
    demonstrates: "A row opens its AV, and reads it (the prototype's rule; Figma doesn't say).",
    conditions,
    simulated: "Nothing is saved.",
    expected: "VCP-1205 opens; 3 unread.",
    task: "See what Alice said, in context.",
  },
  {
    ...base,
    id: "activity-02-notifications.reply",
    steps: [
      press("Press the bell, or Next.", "Notifications, 4 unread"),
      inside("Under Alice's comment, press Reply (Figma 1218:150788), or Next.", "Reply"),
      {
        ...inside("Type an answer and press Reply, or press Next. It's sent, and hides behind Show Reply; Edit and Delete are on it. Replying reads the notification.", "Reply", ["button:Reply"]),
        enter: { "Write a reply": "Yes: the inbox filters ship with C45." },
      },
      inside("Open the bell again and press Alice's row, or Next.", "Alice Carter commented*"),
      { text: "Your reply is under Alice's comment on the AV: the popover and the page are the same thread.", target: "step:comments", path: AV },
    ],
    name: "Reply from the popover",
    demonstrates: "Replying to a comment without leaving the page; the reply is the AV's.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "The reply on VCP-1205; the notification read.",
    task: "Answer Alice's question without opening the AV.",
  },
  {
    ...base,
    id: "activity-02-notifications.reacted",
    steps: [
      press("Press the bell, or Next.", "Notifications, 4 unread"),
      inside("\"Marvin Ode reacted to your comment on …\" (decided 9 Nov 2026; DS #341): your reply, with his 👍 and yours. React back from here: Add reaction, then 🙌. Or press Next.", "React with 🙌", ["button:Add reaction[2]"]),
      inside("Open the bell again and press Marvin's row, or Next.", "Unread: Marvin Ode reacted*"),
      { text: "Show 1 Reply under Marvin's comment: your 🙌 is on your reply here too.", target: "step:comments", path: AV },
    ],
    name: "Someone reacted to your comment",
    demonstrates: "The new \"reacted to your comment\" notification, and reacting from the popover.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "The reacted row; a reaction made there shows on the AV.",
    task: "See who liked your reply.",
  },
];

export const NOTIFICATIONS_FLOW: FlowDef = {
  id: "activity-02-notifications",
  area: "Activity",
  number: "02",
  name: "Notifications",
  actor: "All users",
  goal: "Know what happened to your Added Values and comments, and act on it without hunting.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=68-211",
  doc: "flows/activity-02-notifications.md",
  status: "Implemented",
  scenarios: NOTIFICATION_SCENARIOS,
};
