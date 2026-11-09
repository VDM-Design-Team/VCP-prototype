import type { AVStatus } from "@vdm-design-team/vcp-design-system";
import { ADDED_VALUES } from "@/data/added-values";
import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 04 Edit an AV — the flow doc is `flows/av-04-edit.md`, the FigJam page
 * is "AV · 04 Edit an AV". Editing opens the creation form, filled in from the
 * AV. Its scenarios start from Eve's sample draft (VCP-1199) and her Pending
 * AV (VCP-1200), changed per scenario through `avs`.
 */

/** The statuses whose AV opens on the edit page. Figma draws only these two. */
export const EDITABLE: readonly AVStatus[] = ["Draft", "Pending"];

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
      onEditPage("A Pending AV's edit page has Save as draft and Submit, and no Discard (Figma 1043:239669)."),
      onEditPage("Change something: add a second acceptance criterion.", "step:deliverables"),
      {
        text: "Which one?",
        target: "step:actions",
        path: "/added-values/*/edit",
        options: [
          { label: "Submit: keep it Pending", goto: "submit" },
          { label: "Save as draft: take it back", goto: "draft" },
        ],
      },
      { id: "submit", ...press("Submit", "Press Submit. The checks run; the AV stays Pending.") },
      {
        text: "Saved: its page opens with the change, still Pending, and a \"changes saved\" toast.",
        target: "step:av-menu",
        path: "/added-values/vcp-1200",
        next: "end",
      },
      { id: "draft", ...press("Save as draft", "Press Save as draft. It moves back to Draft.") },
      {
        text: "Back to Draft: it leaves the admins' queue (Manage) and waits on Drafts. Status History logs Pending → Draft.",
        target: "step:av-menu",
        path: "/added-values/vcp-1200",
        next: "end",
      },
      { id: "end", text: "Either way the edit page closes and the AV's page opens (inferred: Figma draws no landing page)." },
    ],
    name: "Edit a Pending AV",
    demonstrates: "A Pending AV can be edited: Submit keeps it Pending, Save as draft takes it back to Draft.",
    conditions: "Eve (User) on her Pending AV VCP-1200.",
    simulated: "Saving always succeeds.",
    expected: "Submit saves the change and it stays Pending. Save as draft moves it back to Draft. Both return to the AV's page with a toast.",
    task: "Add a second acceptance criterion to your Added Value about undo, which is waiting for review.",
  },
  {
    ...base,
    id: "av-04-edit.past-pending",
    start: "/added-values/vcp-1207",
    steps: [
      { text: "VCP-1207 is Eve's and in Review: past Pending.", target: "step:av-menu" },
      openEdit("vcp-1207", "Open the ⋮ menu and choose Edit."),
      {
        text: "Editing past Pending isn't designed: Figma draws the edit page for a Draft or Pending AV only, so a toast says so. An open question.",
        target: "step:av-menu",
        path: "/added-values/vcp-1207",
      },
    ],
    name: "Past Pending (not designed)",
    demonstrates: "The ⋮ menu offers Edit at every status, but Figma's edit page covers Draft and Pending only.",
    conditions: "Eve (User) on her AV VCP-1207, in Review.",
    simulated: "Nothing changes.",
    expected: "An info toast; the AV stays as it is.",
    task: "Change the title of your Added Value that's in review.",
  },
];

export const EDIT_FLOW: FlowDef = {
  id: "av-04-edit",
  area: "AV",
  number: "04",
  name: "Edit an AV",
  actor: "The initiator (Draft, Pending); an admin too",
  goal: "Change an Added Value before it's accepted: finish a draft, or correct one waiting for review.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=26-72",
  doc: "flows/av-04-edit.md",
  status: "Implemented",
  scenarios: EDIT_SCENARIOS,
};
