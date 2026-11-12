import { VIEWER } from "@/data/added-values";
import { COMPLETE_DRAFT, EMPTY_DRAFT, type SubmitDraft } from "./av-01-submit";
import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 03 Save as Draft — the flow doc is `flows/av-03-save-as-draft.md`, the
 * FigJam page is "AV · 03 Save as Draft". It runs on the same creation page as
 * AV · 01 Submit, so its scenarios start from the same kind of draft.
 */

/* ---------- The guided steps ---------- */

const pressSave = (text = "Press Save as draft."): ScenarioStep => ({
  text,
  target: "button:Save as draft",
  action: true,
});

/* A saved draft lands on Drafts, with a toast that can open it. */
const onDrafts: ScenarioStep = {
  text: "Saved: the creation page closes and Drafts opens. The draft is in the list, and the toast's Open it shows it.",
  target: "step:av-list",
  path: "/drafts",
};
const openIt: ScenarioStep = {
  text: "Press Open it on the toast (or the draft's row).",
  target: "button:Open it",
  path: "/drafts",
  action: true,
};
const onDraftPage: ScenarioStep = {
  text: "The draft's page: status Draft, and no status buttons. The ⋮ menu has Edit (AV · 04), Move to Backlog (AV · 05) and Delete.",
  target: "step:av-menu",
  path: "/added-values/*",
};

/* ---------- The scenarios ---------- */

const base = {
  start: "/added-values/new",
  status: "Implemented",
  testing: "Not tested",
  role: "user",
} as const;

/** Started, not finished: a title and one problem. */
const PART_WAY: SubmitDraft = {
  ...EMPTY_DRAFT,
  title: "Bulk-edit due dates on the Gantt chart",
  problems: ["Moving a cycle's due dates means opening every AV one by one."],
};

export const DRAFT_SCENARIOS: readonly ScenarioDef<SubmitDraft>[] = [
  {
    ...base,
    id: "av-03-save-as-draft.part-way",
    steps: [
      {
        text: "Only the Title and one problem are filled in. The rest can wait.",
        target: "step:form",
      },
      pressSave("Press Save as draft. Only the Title is checked."),
      onDrafts,
      openIt,
      onDraftPage,
    ],
    name: "Save it part-way",
    demonstrates:
      "A half-filled AV saves as a Draft, and waits on the Drafts page.",
    conditions:
      "Eve (User) on the creation page with a Title and one problem, nothing else.",
    simulated:
      "Saving always succeeds. The draft gets the next free reference.",
    expected:
      "The creation page closes, Drafts opens with the draft listed, and a toast whose Open it shows the draft.",
    task: "You've started this Added Value but can't finish it today. Keep it for later.",
    setup: PART_WAY,
  },
  {
    ...base,
    id: "av-03-save-as-draft.no-title",
    steps: [
      pressSave("The page is blank. Press Save as draft."),
      {
        text: "Blocked: a draft needs a Title, so it can be found on Drafts. One toast, and an error under Title.",
        target: "step:title",
      },
      {
        text: "Type a title: the error clears as you type.",
        target: "step:title",
      },
      pressSave("Press Save as draft again."),
      onDrafts,
    ],
    name: "No title",
    demonstrates: "The Title is the one thing a draft needs.",
    conditions: "Eve (User) on a blank creation page.",
    simulated: "Nothing is sent: the check runs in the page.",
    expected:
      'A "Missing Input" toast and an error under Title. Typing a title clears it; the draft then saves.',
    task: "Keep this Added Value as a draft for later.",
    setup: EMPTY_DRAFT,
  },
  {
    ...base,
    id: "av-03-save-as-draft.skips-submit-checks",
    steps: [
      {
        text: "This one would fail Submit: two problems with one solution, no tags…",
        target: "step:problems",
      },
      {
        text: "…and Lena Novak assigned while she's on leave 16/11/2026–20/11/2026.",
        target: "group:Assignee",
      },
      pressSave("Press Save as draft. Submit's checks don't run."),
      onDrafts,
      openIt,
      {
        ...onDraftPage,
        text: "Everything was kept as it was, gaps included. Submit's checks run when it's submitted, from Edit (AV · 04).",
      },
    ],
    name: "Would fail Submit",
    demonstrates:
      "Save as draft skips Submit's checks: unpaired problems, missing tags and an away assignee all save.",
    conditions:
      "Eve (User), a draft with an unpaired problem, no tags, and Lena Novak (on leave 16–20 Nov) assigned for 9–20 Nov.",
    simulated:
      "Saving always succeeds. Lena's leave comes from the sample availability.",
    expected:
      "No errors and no toasts but the success one: the draft saves as it is.",
    task: "Keep this Added Value as a draft for later.",
    setup: {
      ...COMPLETE_DRAFT,
      problems: [
        ...COMPLETE_DRAFT.problems,
        "Focus jumps to the top of the page after sorting a column.",
      ],
      details: {
        ...COMPLETE_DRAFT.details,
        tags: [],
        assignees: [{ name: "Lena Novak", description: "Assignee", points: 5 }],
      },
    },
  },
  {
    ...base,
    id: "av-03-save-as-draft.after-blocked-submit",
    steps: [
      { text: "Desired Outcome is empty.", target: "step:desired-outcome" },
      { text: "Press Submit.", target: "button:Submit", action: true },
      {
        text: "Blocked: a toast and an error under Desired Outcome. What now?",
        target: "step:desired-outcome",
        options: [
          { label: "Save it as a draft instead", goto: "save" },
          { label: "Fill it in and submit", goto: "fill" },
        ],
      },
      {
        id: "fill",
        text: "Filling it in and submitting is AV · 01 Submit's \"One required field empty\". Here, go on and save it as a draft instead.",
        target: "step:desired-outcome",
        next: "save",
      },
      {
        id: "save",
        ...pressSave(
          "Press Save as draft: Submit's toast and errors go, and the draft saves.",
        ),
      },
      onDrafts,
    ],
    name: "Submit blocked, save it for later",
    demonstrates:
      "After a blocked Submit, Save as draft still works: the errors and toasts clear.",
    conditions: "Eve (User), a complete draft with Desired Outcome left empty.",
    simulated: "Nothing is sent until the save, which always succeeds.",
    expected:
      "Submit is blocked as in AV · 01. Save as draft then clears its toast and errors, and the draft saves to Drafts.",
    task: "Submit this Added Value. If you can't, keep it for later.",
    setup: { ...COMPLETE_DRAFT, desiredOutcome: "" },
  },
];

export const DRAFT_FLOW: FlowDef = {
  id: "av-03-save-as-draft",
  area: "AV",
  number: "03",
  name: "Save as Draft",
  actor: `Any VCP user creating an Added Value (the initiator; ${VIEWER.name} in the prototype)`,
  goal: "Keep an unfinished Added Value to finish and submit later.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=23-313",
  doc: "flows/av-03-save-as-draft.md",
  status: "Implemented",
  scenarios: DRAFT_SCENARIOS,
};
