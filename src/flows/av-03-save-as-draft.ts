import { VIEWER } from "@/data/added-values";
import { EMPTY_DRAFT, type SubmitDraft } from "./av-01-submit";
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

/** Started, not finished: one problem, no title, no tags, and Lena Novak (on leave 16–20 Nov) assigned for 9–20 Nov. */
const PART_WAY: SubmitDraft = {
  ...EMPTY_DRAFT,
  problems: ["Moving a cycle's due dates means opening every AV one by one."],
  details: {
    ...EMPTY_DRAFT.details,
    assignees: [{ name: "Lena Novak", description: "Assignee", points: 5 }],
    startDate: "2026-11-09",
    dueDate: "2026-11-20",
  },
};

export const DRAFT_SCENARIOS: readonly ScenarioDef<SubmitDraft>[] = [
  {
    ...base,
    id: "av-03-save-as-draft.part-way",
    steps: [
      {
        text: "Only one problem is filled in: no title yet. The rest can wait.",
        target: "step:form",
      },
      {
        text: "No tags, and Lena Novak assigned while she's on leave 16/11/2026–20/11/2026. Both would block Submit.",
        target: "group:Assignee",
      },
      pressSave("Press Save as draft. Nothing is checked: Submit's checks don't run, and a draft doesn't need a title."),
      onDrafts,
      openIt,
      {
        ...onDraftPage,
        text: "It's called \"Draft - \" and the date and time it was saved, and everything else was kept as it was, gaps included. Submit's checks (a title among them) run when it's submitted, from Edit (AV · 04). The ⋮ menu has Edit, Move to Backlog (AV · 05) and Delete.",
      },
    ],
    name: "Save as draft",
    demonstrates:
      "A half-filled AV saves as a Draft, and waits on the Drafts page. Nothing is checked: with no title it's named \"Draft - <date and time>\", and empty fields, missing tags and an away assignee all save.",
    conditions:
      "Eve (User) on the creation page with one problem and nothing else: no title, no tags, and Lena Novak (on leave 16–20 Nov) assigned for 9–20 Nov.",
    simulated:
      "Saving always succeeds. The draft gets the next free reference. Lena's leave comes from the sample availability.",
    expected:
      "No errors and no toasts but the success one. The creation page closes, Drafts opens with the draft listed as \"Draft - <date and time>\", and a toast whose Open it shows the draft, kept as it was.",
    task: "You've started this Added Value but can't finish it today. Keep it for later.",
    setup: PART_WAY,
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
