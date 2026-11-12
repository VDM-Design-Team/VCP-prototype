import { ADDED_VALUES } from "@/data/added-values";
import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 04 Edit an AV — the flow doc is `flows/av-04-edit.md`, the FigJam page
 * is "AV · 04 Edit an AV". Editing opens the creation form, filled in from the
 * AV, at any status (decided 9 Nov 2026). Its scenarios start from Eve's
 * sample draft (VCP-1199), her Pending AV (VCP-1200) and her AV in Review
 * (VCP-1207), changed per scenario through `avs`.
 */

const sample = (id: string) => ADDED_VALUES.find((av) => av.id === id)!;
const DRAFT = sample("vcp-1199");

/* ---------- The guided steps ---------- */

const openEdit = (id: string, text = "Open the ⋮ menu and choose Edit."): ScenarioStep => ({
  text,
  target: "step:av-menu",
  path: `/added-values/${id}`,
});
const press = (button: "Submit" | "Save as draft", text: string): ScenarioStep => ({
  text,
  target: `button:${button}`,
  path: "/added-values/*/edit",
  action: true,
});
const onEditPage = (text: string, target = "step:actions"): ScenarioStep => ({
  text,
  target,
  path: "/added-values/*/edit",
});
const submitted: ScenarioStep = {
  text: "Submitted: Draft → Pending. The edit page closes and the Dashboard opens, as in AV · 01; the toast's Open it shows the AV.",
  path: "/",
};

/* ---------- The scenarios ---------- */

const base = { status: "Implemented", testing: "Not tested", role: "user", setup: undefined } as const;

export const EDIT_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-04-edit.finish-draft",
    start: "/added-values/vcp-1199",
    steps: [
      { text: "VCP-1199 is Eve's draft. It has no acceptance criteria and no desired outcome yet.", target: "step:av-menu" },
      openEdit("vcp-1199"),
      onEditPage("The edit page is the creation form, filled in from the draft. A draft's has Discard (AV · 02), Save as draft and Submit."),
      onEditPage("Type an acceptance criterion…", "step:deliverables"),
      onEditPage("…and the desired outcome.", "step:desired-outcome"),
      press("Submit", "Press Submit. Every Submit check runs, as in AV · 01."),
      submitted,
    ],
    name: "Finish a draft and submit it",
    demonstrates: "A saved draft is finished on the edit page and submitted: Draft → Pending.",
    conditions: "Eve (User) on her draft VCP-1199, which lacks acceptance criteria and a desired outcome.",
    simulated: "Submit always succeeds once the checks pass.",
    expected: "Edit opens the filled-in form. Once the two fields are filled, Submit moves it to Pending and opens the Dashboard with a toast.",
    task: "Finish your draft about saved filters and send it for review.",
  },
  {
    ...base,
    id: "av-04-edit.save-draft-changes",
    start: "/added-values/vcp-1199/edit",
    steps: [
      onEditPage("Eve's draft, open for editing. Change the title.", "step:title"),
      press("Save as draft", "Press Save as draft. Only the Title is checked, as in AV · 03."),
      {
        text: "Saved: the edit page closes and the draft's page opens, with the new title. It's still a Draft.",
        target: "step:av-menu",
        path: "/added-values/vcp-1199",
      },
    ],
    name: "Save changes to a draft",
    demonstrates: "Save as draft on a draft's edit page keeps it a Draft and returns to its page.",
    conditions: "Eve (User) on the edit page of her draft VCP-1199.",
    simulated: "Saving always succeeds.",
    expected: "The draft's page opens with the change and a \"changes saved\" toast; the status stays Draft.",
    task: "Rename your draft about saved filters, but don't send it yet.",
  },
  {
    ...base,
    id: "av-04-edit.projects-missing",
    start: "/added-values/vcp-1199/edit",
    avs: [
      {
        ...DRAFT,
        project: "",
        deliverables: ["A Save filters button and a list of saved sets in the filter bar."],
        desiredOutcome: "Nobody sets the same filters twice.",
      },
    ],
    steps: [
      onEditPage("Everything is filled in except Projects.", "group:Projects"),
      press("Submit", "Press Submit."),
      onEditPage("Blocked: \"Please select a project tag before submitting\" under Projects, and a toast (Figma 1026:166742).", "group:Projects"),
      onEditPage("Pick VCP in Projects: the error clears.", "group:Projects"),
      press("Submit", "Press Submit again."),
      submitted,
    ],
    name: "Projects left empty",
    demonstrates: "Projects is required to submit: Figma's \"Projects\" field error.",
    conditions: "Eve (User), her draft VCP-1199 complete except for Projects.",
    simulated: "Nothing is sent until Submit passes.",
    expected: "An error under Projects and a \"Missing Input\" toast. Choosing a project clears it; Submit then passes.",
    task: "Send your draft about saved filters for review.",
  },
  {
    ...base,
    id: "av-04-edit.pending",
    start: "/added-values/vcp-1200",
    steps: [
      { text: "VCP-1200 is Eve's, Pending: it waits for an admin.", target: "step:av-menu" },
      openEdit("vcp-1200"),
      onEditPage("Past Draft, the edit page has Save as draft and Submit, and no Discard (Figma 1043:239669)."),
      onEditPage("Change something: add a second acceptance criterion.", "step:deliverables"),
      {
        text: "Both buttons save the change, and it stays Pending. Which one?",
        target: "step:actions",
        path: "/added-values/*/edit",
        options: [
          { label: "Submit: every check runs", goto: "submit" },
          { label: "Save as draft: only the Title is checked", goto: "draft" },
        ],
      },
      { id: "submit", ...press("Submit", "Press Submit. Every check runs, then the change is saved."), next: "saved" },
      { id: "draft", ...press("Save as draft", "Press Save as draft. Only the change is saved: it doesn't go back to Draft.") },
      {
        id: "saved",
        text: "Saved: its page opens with the change, still Pending, and a \"changes saved\" toast (inferred landing).",
        target: "step:av-menu",
        path: "/added-values/vcp-1200",
      },
    ],
    name: "Edit a Pending AV",
    demonstrates: "A Pending AV is edited on the same page: Submit and Save as draft both save, and it stays Pending.",
    conditions: "Eve (User) on her Pending AV VCP-1200.",
    simulated: "Saving always succeeds.",
    expected: "The change is saved and the AV stays Pending. The AV's page opens with a toast.",
    task: "Add a second acceptance criterion to your Added Value about undo, which is waiting for review.",
  },
  {
    ...base,
    id: "av-04-edit.in-review",
    start: "/added-values/vcp-1207",
    steps: [
      { text: "VCP-1207 is Eve's and in Review: well past Pending.", target: "step:av-menu" },
      openEdit("vcp-1207"),
      onEditPage("The same edit page as a Draft or Pending AV (decided 9 Nov 2026). Change the desired outcome.", "step:desired-outcome"),
      press("Submit", "Press Submit. Every check runs, then the change is saved."),
      {
        text: "Saved: its page opens with the change, still in Review.",
        target: "step:av-menu",
        path: "/added-values/vcp-1207",
      },
    ],
    name: "Edit an AV in Review",
    demonstrates: "Edit opens the same page at every status; the AV keeps its status.",
    conditions: "Eve (User) on her AV VCP-1207, in Review.",
    simulated: "Saving always succeeds.",
    expected: "The edit page opens; saving keeps it in Review and returns to its page with a toast.",
    task: "Change the desired outcome of your Added Value that's in review.",
  },
  {
    ...base,
    id: "av-04-edit.unsaved-changes",
    start: "/added-values/vcp-1199/edit",
    steps: [
      onEditPage("Eve's draft, open for editing. Change the title.", "step:title"),
      onEditPage("Press the back arrow. A dialog asks before your change is dropped.", "step:back"),
      onEditPage("Keep editing closes it and keeps the change. Leave drops it. Press Keep editing, then Next.", "step:back"),
      onEditPage("Press the back arrow again, and this time choose Leave.", "step:back"),
      {
        text: "Left without saving: the draft's page opens with the title as it was.",
        target: "step:av-menu",
        path: "/added-values/vcp-1199",
      },
    ],
    name: "Leave with unsaved changes",
    demonstrates: "The back arrow asks before dropping unsaved changes.",
    conditions: "Eve (User) on the edit page of her draft VCP-1199.",
    simulated: "Nothing is saved.",
    expected: "\"Leave without saving?\": Keep editing keeps the change; Leave drops it and opens the AV's page. With nothing changed, the arrow leaves at once.",
    task: "Start renaming your draft about saved filters, then change your mind and go back without saving.",
  },
];

export const EDIT_FLOW: FlowDef = {
  id: "av-04-edit",
  area: "AV",
  number: "04",
  name: "Edit an AV",
  actor: "The initiator; an admin too",
  goal: "Change an Added Value: finish a draft and submit it, or correct one already submitted.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=26-72",
  doc: "flows/av-04-edit.md",
  status: "Implemented",
  scenarios: EDIT_SCENARIOS,
};
