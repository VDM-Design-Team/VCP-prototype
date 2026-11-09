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

const base = { status: "Implemented", testing: "Not tested", role: "user", start: HOME, setup: undefined } as const;
const conditions = "Eve as a User on the Dashboard, with 7 notifications, 4 unread: Alice's comment, Marvin's reaction to Eve's reply, Lena's mention, and Jack's handoff.";

export const NOTIFICATION_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "activity-02-notifications.the-bell",
    steps: [
      on("The bell has a red dot: there are unread notifications (its name says how many, \"Notifications, 4 unread\")."),
      press("Press the bell.", "Notifications, 4 unread"),
      say("The popover (Figma 474:24855): the latest first. Each row says who did what to which AV, and when; unread ones have the blue dot. A comment shows with its reactions, and you can reply or react right here. Scroll it, then Next."),
      press("Open it again: All / Mentions, and Unread only, narrow the list.", "Notifications, 4 unread"),
      say("Choose Mentions: only Lena's mention. Back to All, and switch Unread only on: the four unread. Then Next."),
    ],
    name: "The bell and its popover",
    demonstrates: "The bell's dot, the popover's rows, and its All / Mentions and Unread only filters.",
    conditions,
    simulated: "The notifications are sample data.",
    expected: "4 unread; Mentions shows 1; Unread only shows 4.",
    task: "See what's new for you, then just what mentions you.",
  },
  {
    ...base,
    id: "activity-02-notifications.mark-read",
    steps: [
      press("Press the bell.", "Notifications, 4 unread"),
      say("Point at Jack's handoff row: the blue dot turns into a check (\"Mark as Read\", Figma 477:56333). Press it: the dot goes and the bell's count drops. The filled check marks it unread again. Then Next."),
      press("Open the bell once more.", "Notifications, 3 unread"),
      say("The ⋯ beside Unread only: Mark all as read. Every dot goes, and so does the bell's. Then Next."),
      on("No red dot on the bell now."),
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
      press("Press the bell.", "Notifications, 4 unread"),
      say("Press Alice's row (its text, not the comment): it opens VCP-1205. Then Next.", HOME),
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
      press("Press the bell.", "Notifications, 4 unread"),
      say("Under Alice's comment, press Reply (Figma 1218:150788). Type an answer and press Reply. It's sent, and hides behind Show Reply; Edit and Delete are on it. Replying reads the notification. Then Next."),
      press("Open the bell again.", "Notifications, 3 unread"),
      say("Press Alice's row. Then Next."),
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
      press("Press the bell.", "Notifications, 4 unread"),
      say("\"Marvin Ode reacted to your comment on …\" (decided 9 Nov 2026; DS #341): your reply, with his 👍 and yours. React back from here: 🙌 from Add reaction. Then Next."),
      press("Open the bell again.", "Notifications, 4 unread"),
      say("Press Marvin's row. Then Next."),
      { text: "Show 1 Reply under Marvin's comment: your 🙌 is on your reply here too.", target: "step:comments", path: AV },
    ],
    name: "Someone reacted to your comment",
    demonstrates: "The new \"reacted to your comment\" notification, and reacting from the popover.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "The reacted row; a reaction made there shows on the AV.",
    task: "See who liked your reply.",
  },
  {
    ...base,
    id: "activity-02-notifications.inbox",
    steps: [
      press("Press the bell.", "Notifications, 4 unread"),
      say("At the foot: View notifications inbox. Press it. Then Next."),
      { text: "The inbox (Figma 1030:173233): full width, no left menu (decided 9 Nov 2026), the logo takes you home. Every notification, grouped by day (Today, Yesterday, 3 November …; decided), without the comment previews, with Show unread only, Mark all as read and the pager.", target: "step:inbox", path: INBOX },
      { text: "Switch Show unread only on, then press Mark all as read: the list empties (\"No unread notifications\") and the bell's dot goes.", target: "step:inbox", path: INBOX },
    ],
    name: "The inbox",
    demonstrates: "The inbox page the popover's footer opens: full width, grouped by day.",
    conditions,
    simulated: "Nothing is saved; one page of seven.",
    expected: "The inbox; all read after Mark all as read.",
    task: "Go through every notification, not only the latest.",
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
