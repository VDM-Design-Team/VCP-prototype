import type { DetailCardValue, SearchSelectOption } from "@vdm-design-team/vcp-design-system";
import { VIEWER } from "@/data/added-values";
import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 01 Submit an AV — the flow doc is `flows/av-01-submit.md`, the FigJam
 * page is "AV · 01 Submit". Everything the create screen and its scenarios
 * need lives here, so the catalogue card and the scenario's start read one
 * definition.
 */

/** What the creation page holds until it's submitted. */
export interface SubmitDraft {
  title: string;
  problems: string[];
  solutions: string[];
  deliverables: string[];
  desiredOutcome: string;
  details: DetailCardValue;
}

/* ---------- Sample data the flow needs (inferred where Figma is silent) ---------- */

/**
 * The tag rule: one global tag and at least one tag of the AV's own domain.
 * Figma names the rule, not the tags, so these lists are placeholders.
 */
export const GLOBAL_TAGS = ["Performance", "Accessibility", "UX debt"] as const;
export const DOMAIN_TAGS = ["Development", "Frontend", "Backend"] as const;
export const TAG_OPTIONS: SearchSelectOption[] = [
  ...GLOBAL_TAGS.map((t) => ({ value: t, label: t, group: "Global" })),
  ...DOMAIN_TAGS.map((t) => ({ value: t, label: t, group: "Development" })),
];

/**
 * Who can be picked, and when they're away. `unavailable` blocks Submit when it
 * overlaps the AV's dates; `busy` only warns. ISO dates, both ends included.
 */
export const AVAILABILITY: Record<string, { state: "unavailable" | "busy"; from: string; to: string; why: string }> = {
  "Lena Novak": { state: "unavailable", from: "2026-11-16", to: "2026-11-20", why: "on leave" },
  "Jack Morgan": { state: "busy", from: "2026-11-09", to: "2026-11-13", why: "fully booked" },
};

export const SUBMIT_PEOPLE = [VIEWER.name, "Marvin Ode", "Alice Carter", "Jack Morgan", "Lena Novak", "Noah Foster"].map(
  (name) => ({ name }),
);

/** Whether `name` is away at any point between `start` and `due`. */
export function availabilityClash(name: string, start?: string, due?: string) {
  const a = AVAILABILITY[name];
  if (!a || !start || !due) return undefined;
  return a.from <= due && a.to >= start ? a : undefined;
}

/* ---------- Starting drafts ---------- */

/** A fresh creation page: only the initiator (whoever is creating it) is set. */
export const EMPTY_DRAFT: SubmitDraft = {
  title: "",
  problems: [""],
  solutions: [""],
  deliverables: [""],
  desiredOutcome: "",
  details: { initiators: [{ name: VIEWER.name }], projects: ["VCP"] },
};

/** A draft with everything a Submit needs. */
export const COMPLETE_DRAFT: SubmitDraft = {
  title: "Keyboard shortcuts for the AV table",
  problems: ["Moving through a long AV table takes a mouse; keyboard users tab through every cell."],
  solutions: ["Arrow keys move between rows, Enter opens the AV, and / jumps to the search box."],
  deliverables: ["Arrow keys and Enter work on every AV table.", "The shortcuts are listed in the Help menu."],
  desiredOutcome: "Anyone can work through the AV table without a mouse.",
  details: {
    initiators: [{ name: VIEWER.name }],
    assignees: [{ name: "Alice Carter", description: "Assignee", points: 5 }],
    startDate: "2026-11-09",
    dueDate: "2026-11-20",
    urgency: "Normal",
    type: "Type 2",
    projects: ["VCP"],
    category: "Improvement",
    tags: ["Accessibility", "Frontend"],
  },
};

/* ---------- The guided steps ---------- */

/* After a successful Submit the AV closes and the Dashboard opens, with a toast that can open the AV. */
const submitted: ScenarioStep = {
  text: "Submitted: the AV closes and you're back on the Dashboard. The toast confirms it, and Open it shows the AV, Pending until an admin accepts or rejects it (AV · 06).",
  path: "/",
};
const pressSubmit = (text = "Press Submit. Every check runs at once."): ScenarioStep => ({
  text,
  target: "button:Submit",
  action: true,
});

/* ---------- The scenarios ---------- */

const base = {
  start: "/added-values/new",
  status: "Implemented",
  testing: "Not tested",
  role: "user",
} as const;

export const SUBMIT_SCENARIOS: readonly ScenarioDef<SubmitDraft>[] = [
  {
    ...base,
    id: "av-01-submit.happy",
    steps: [
      { text: "Every required field is filled in, starting with the Title.", target: "step:title" },
      { text: "Problems and Solutions pair up by number: each problem has its solution.", target: "step:problems" },
      { text: "Acceptance Criteria and Desired Outcome are required too.", target: "step:deliverables" },
      { text: "Tags: one global tag (Accessibility) and one Development tag (Frontend).", target: "group:Tags" },
      {
        id: "leave",
        text: "There are two ways off this page. Which one?",
        target: "step:actions",
        options: [
          { label: "Submit it", goto: "submit" },
          { label: "Save it as a draft", goto: "draft" },
        ],
      },
      { id: "draft", text: "Saving it keeps it a Draft, on the Drafts page: that's AV · 03 Save as Draft, with its own scenarios. Go back and choose Submit.", target: "button:Save as draft", next: "leave" },
      { id: "submit", ...pressSubmit() },
      submitted,
    ],
    name: "Everything filled in",
    demonstrates: "Submit passes every check and the AV moves from Draft to Pending.",
    conditions: "Eve (User) on the creation page with every required field filled and the tag rule met.",
    simulated: "Submit always succeeds. The new AV gets the next free reference and waits for an admin.",
    expected: "The AV closes and the Dashboard opens with a success toast (Open it shows the AV, Pending). Nothing is blocked.",
    task: "Submit this Added Value for review.",
    setup: COMPLETE_DRAFT,
  },
  {
    ...base,
    id: "av-01-submit.one-missing",
    steps: [
      { text: "Desired Outcome is empty. Leave it that way for now.", target: "step:desired-outcome" },
      pressSubmit(),
      { text: "Blocked: one \"Missing Input\" toast, and an error under Desired Outcome.", target: "step:desired-outcome" },
      { text: "Type a desired outcome: the error clears as you type.", target: "step:desired-outcome" },
      pressSubmit("Press Submit again."),
      submitted,
    ],
    name: "One required field empty",
    demonstrates: "Submit is blocked by one empty required field: one toast and one field error.",
    conditions: "Eve (User), the same draft with Desired Outcome left empty.",
    simulated: "Nothing is sent: the checks run in the page.",
    expected: "A \"Missing Input\" toast and the field's error. Filling the field clears its error; Submit then passes.",
    task: "Submit this Added Value for review.",
    setup: { ...COMPLETE_DRAFT, desiredOutcome: "" },
  },
  {
    ...base,
    id: "av-01-submit.several-missing",
    steps: [
      pressSubmit("The page is blank. Press Submit without filling anything in."),
      { text: "Every check runs at once: a toast per empty field, and an error under each one.", target: "step:form" },
      { text: "Fill in the Title: its error clears, the others stay until their fields are filled.", target: "step:title" },
      { text: "Fill in the rest, and add a global and a Development tag.", target: "step:form" },
      pressSubmit("Press Submit again."),
      submitted,
    ],
    name: "Several required fields empty",
    demonstrates: "Every check runs at once: one toast per problem, every field error together.",
    conditions: "Eve (User) on a blank creation page.",
    simulated: "Nothing is sent: the checks run in the page.",
    expected: "One \"Missing Input\" toast per empty field (Title, Problems, Solutions, Acceptance Criteria, Desired Outcome, Tags) and an error under each. Each error stays until its field is filled.",
    task: "Create an Added Value and submit it for review.",
    setup: EMPTY_DRAFT,
  },
  {
    ...base,
    id: "av-01-submit.problem-without-solution",
    steps: [
      { text: "There are two problems…", target: "step:problems" },
      { text: "…but only one solution.", target: "step:solutions" },
      pressSubmit(),
      {
        text: "Blocked: both cards of the pair say \"Problem and solution should be filled together\". How do you fix it?",
        target: "step:problems",
        options: [
          { label: "Add the second solution", goto: "fill" },
          { label: "Remove the second problem", goto: "remove" },
        ],
      },
      { id: "fill", text: "Type the second solution: both errors clear.", target: "step:solutions", next: "again" },
      { id: "remove", text: "Hover problem 2 and press its ✕: both errors clear.", target: "step:problems", next: "again" },
      { id: "again", ...pressSubmit("Press Submit again.") },
      submitted,
    ],
    name: "A problem without its solution",
    demonstrates: "Each problem needs its solution: a second problem with no matching solution blocks Submit.",
    conditions: "Eve (User), a complete draft with a second problem and no second solution.",
    simulated: "Nothing is sent: the checks run in the page.",
    expected: "Both cards of the pair show \"Problem and solution should be filled together\". Filling the solution, or removing the problem, clears it.",
    task: "Submit this Added Value for review.",
    setup: { ...COMPLETE_DRAFT, problems: [...COMPLETE_DRAFT.problems, "Focus jumps to the top of the page after sorting a column."], solutions: [...COMPLETE_DRAFT.solutions, ""] },
  },
  {
    ...base,
    id: "av-01-submit.tag-rule",
    steps: [
      { text: "One tag, Accessibility, which is global. There's no Development tag.", target: "group:Tags" },
      pressSubmit(),
      { text: "Blocked: the error under Tags says which kind is missing.", target: "group:Tags" },
      { text: "Add a Development tag (Development, Frontend or Backend): the error clears.", target: "group:Tags" },
      pressSubmit("Press Submit again."),
      submitted,
    ],
    name: "Tag rule not met",
    demonstrates: "Tags need one global tag and at least one in-domain tag.",
    conditions: "Eve (User), a complete draft tagged only \"Accessibility\" (global, no Development tag).",
    simulated: "Nothing is sent: the checks run in the page.",
    expected: "A toast and an error under Tags. Adding a Development tag clears it.",
    task: "Submit this Added Value for review.",
    setup: { ...COMPLETE_DRAFT, details: { ...COMPLETE_DRAFT.details, tags: ["Accessibility"] } },
  },
  {
    ...base,
    id: "av-01-submit.assignee-unavailable",
    steps: [
      { text: "Lena Novak is assigned. She's on leave 16/11/2026–20/11/2026.", target: "group:Assignee" },
      { text: "The AV runs 09/11/2026 to 20/11/2026, so it overlaps her leave.", target: "group:Due Date" },
      pressSubmit(),
      {
        text: "Blocked: the Assignee unavailable banner says why. How do you fix it?",
        target: "step:assignee-unavailable",
        options: [
          { label: "Move the due date earlier", goto: "dates" },
          { label: "Remove Lena", goto: "remove" },
        ],
      },
      { id: "dates", text: "Set the due date to 13/11/2026 or earlier: the banner goes.", target: "group:Due Date", next: "again" },
      { id: "remove", text: "Hover Lena's chip and press its ✕: the banner goes.", target: "group:Assignee", next: "again" },
      { id: "again", ...pressSubmit("Press Submit again.") },
      submitted,
    ],
    name: "Assignee unavailable on the AV's dates",
    demonstrates: "An assignee who is away (on leave) during the AV's dates blocks Submit.",
    conditions: "Eve (User), a complete draft assigned to Lena Novak, who is on leave 16–20 Nov; the AV runs 9–20 Nov.",
    simulated: "Lena's leave comes from the sample availability. It doesn't change during the scenario.",
    expected: "A toast and an error under Assignee. Moving the due date before 16 Nov, or removing Lena, clears it.",
    task: "Submit this Added Value for review.",
    setup: { ...COMPLETE_DRAFT, details: { ...COMPLETE_DRAFT.details, assignees: [{ name: "Lena Novak", description: "Assignee", points: 5 }] } },
  },
  {
    ...base,
    id: "av-01-submit.assignee-busy",
    steps: [
      { text: "Jack Morgan is fully booked 09/11/2026–13/11/2026: an amber warning, not a block.", target: "step:assignee-busy" },
      pressSubmit("Press Submit: it still goes through."),
      submitted,
    ],
    name: "Assignee busy (warning only)",
    demonstrates: "A busy assignee only gets a warning; Submit still passes.",
    conditions: "Eve (User), a complete draft assigned to Jack Morgan, who is fully booked 9–13 Nov.",
    simulated: "Jack's booking comes from the sample availability.",
    expected: "An amber warning about Jack; Submit still goes through, back to the Dashboard.",
    task: "Submit this Added Value for review.",
    setup: { ...COMPLETE_DRAFT, details: { ...COMPLETE_DRAFT.details, assignees: [{ name: "Jack Morgan", description: "Assignee", points: 5 }] } },
  },
];

export const SUBMIT_FLOW: FlowDef = {
  id: "av-01-submit",
  area: "AV",
  number: "01",
  name: "Submit an AV",
  actor: "Any VCP user creating an Added Value (the initiator)",
  goal: "Get a new Added Value in front of an admin: from Draft to Pending.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=14-226",
  doc: "flows/av-01-submit.md",
  status: "Implemented",
  scenarios: SUBMIT_SCENARIOS,
};
