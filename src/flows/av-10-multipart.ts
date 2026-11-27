import { ADDED_VALUES, type AddedValue } from "@/data/added-values";
import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 10 Multipart — the flow doc is `flows/av-10-multipart.md`, the FigJam
 * page is "AV · 10 Multipart". A Development admin accepts an AV as multipart:
 * one part per problem set, each its own AV (DS #332's part titles in the
 * Accept dialog); the parent lists them in its Multipart section (DS #272) and
 * the AV tables mark parents and parts (DS #275). The dialogs make the page
 * inert, the walk's card included, so those steps are answered in the dialog
 * and Next is pressed after.
 */

const sample = (id: string) => ADDED_VALUES.find((av) => av.id === id)!;

/** Marvin's Pending supplier scorecard, with three problem sets. */
const THREE_SETS: AddedValue = {
  ...sample("vcp-1201"),
  problems: [
    "Planners can't see which suppliers are behind until a delivery is already late.",
    "The scorecard export drops suppliers with no deliveries this quarter.",
    "Overdue counts reset at midnight UTC, not in the planner's own day.",
  ],
  solutions: [
    "Show a scorecard per supplier on the planning page, with their overdue count and trend.",
    "Include every supplier in the export, with zero rows where there were no deliveries.",
    "Count overdue days in the planner's own time zone.",
  ],
};

/** The collapsible sidebar, already split into three parts (references kept free for new AVs). */
const PARENT_ID = "vcp-1203";
const PART_IDS = ["vcp-1228", "vcp-1229", "vcp-1230"];
const parentBase = sample(PARENT_ID);
const part = (i: number, change: Partial<AddedValue>): AddedValue => ({
  ...parentBase,
  id: PART_IDS[i],
  ref: PART_IDS[i].toUpperCase(),
  title: `(${i + 1}/3) ${parentBase.title}`,
  status: "Accepted",
  step: undefined,
  parent: PARENT_ID,
  parts: undefined,
  assignees: [],
  comments: [],
  files: [],
  history: [{ actor: "Marvin Ode", from: "Initial Creation", to: "Accepted", when: "A week ago" }],
  ...change,
});
const SPLIT = (parentChange: Partial<AddedValue> = {}, partChanges: Partial<AddedValue>[] = []): AddedValue[] => [
  { ...parentBase, parts: PART_IDS, ...parentChange },
  part(0, { title: "Collapse the rail to icons", status: "Completed", assignees: [{ name: "Eve Kestrel", points: 3 }], dueDate: "2026-11-04", capacityPoints: 3, ...partChanges[0] }),
  part(1, { status: "In Progress", step: "for-qa", assignees: [{ name: "Jack Morgan", points: 5 }], dueDate: "2026-11-12", capacityPoints: 5, ...partChanges[1] }),
  part(2, { ...partChanges[2] }),
];

const at = (id: string, text: string, target = "step:av-menu"): ScenarioStep => ({ text, target, path: `/added-values/${id}` });
/* A step Next does for you: it presses the target (a `step:` target, the button inside it). */
const press = (id: string, text: string, target: string): ScenarioStep => ({ ...at(id, text, target), action: true });

const base = { status: "Implemented", testing: "Not tested", role: "admin", setup: undefined } as const;

export const MULTIPART_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-10-multipart.accept-as-multipart",
    start: "/added-values/vcp-1201",
    avs: [THREE_SETS],
    steps: [
      at("vcp-1201", "Admin view. VCP-1201 is Pending and Development's, with three problem sets.", "step:multipart-source"),
      press("vcp-1201", "Press Accept, or Next.", "button:Accept"),
      {
        ...at("vcp-1201", "Tick Multipart Value, or press Next: \"Rename Individual parts\" lists the three problem sets, each with a Preview.", "button:Confirm"),
        enter: { "Multipart Value": true },
      },
      {
        ...press("vcp-1201", "Name the first, leave the others blank, and press Confirm, or press Next.", "button:Confirm"),
        enter: { "Problem Set 1": "Supplier scorecard on the planning page" },
      },
      at("vcp-1201", "Accepted, in three parts: the Multipart section lists them, 0% done. Blank titles became \"(2/3) Supplier scorecard…\".", "step:multipart"),
      press("vcp-1201", "Open a part from its title, or press Next: it's an AV of its own, with a Parent chip back to VCP-1201.", "button:Part 2:*"),
      { text: "The part's page: its own status, assignees and dates. The Parent chip goes back.", target: "step:parent", path: "/added-values/*" },
    ],
    name: "Accept as multipart",
    demonstrates: "An admin splits an AV into parts as they accept it, one per problem set, naming some.",
    conditions: "Eve as Admin, on Marvin's Pending VCP-1201 (Development) with three problem sets.",
    simulated: "Accepting always succeeds. Each part gets the next free reference.",
    expected: "The Accept dialog with part titles; then the parent Accepted with a Multipart section of three parts, each its own AV.",
    task: "As an admin, accept the supplier scorecard, split into its three problems; name the first part.",
  },
  {
    ...base,
    id: "av-10-multipart.in-the-table",
    start: "/manage",
    avs: SPLIT(),
    steps: [
      { text: "Manage: VCP-1203 is a parent, with a progress ring (1 of 3 done) and a brand edge on the left.", target: "step:av-list", path: "/manage" },
      {
        text: "Its parts read 1/3, 2/3, 3/3, each with a Parent: VCP-1203 chip. Press one, or Next.",
        target: "button:Parent: VCP-1203",
        path: "/manage",
        action: true,
      },
      at(PARENT_ID, "The chip opens the parent: its Multipart section, 33% (1/3 parts completed).", "step:multipart"),
    ],
    name: "Parents and parts in the table",
    demonstrates: "The AV table marks a parent's progress and each part's place and parent.",
    conditions: "Eve as Admin on Manage; VCP-1203 split into three parts, one Completed.",
    simulated: "The split comes from the sample data.",
    expected: "The parent's ring and edge, the parts' 1/3–3/3 tags and Parent chips; the chip opens the parent.",
    task: "As an admin, find how far the collapsible sidebar has got across its parts.",
  },
  {
    ...base,
    id: "av-10-multipart.add-part",
    start: `/added-values/${PARENT_ID}`,
    avs: SPLIT(),
    steps: [
      at(PARENT_ID, "VCP-1203 has three parts. As an admin (an editor) you see Add Part under them.", "step:multipart"),
      press(PARENT_ID, "Press Add Part, or Next.", "button:Add Part"),
      press(PARENT_ID, "Leave the title blank (or type one) and press Confirm, or press Next.", "button:Confirm"),
      at(
        PARENT_ID,
        "Part 4 is added, \"(4/4) Collapsible sidebar…\" when left blank, and the progress counts it: 25%. The other default titles are renumbered, (2/4) and (3/4); part 1's typed title stays (decided 9 Nov 2026).",
        "step:multipart",
      ),
      press(
        PARENT_ID,
        "Now rename one. Hover (or tab to) part 1, \"Collapse the rail to icons\": an edit button appears after its title. Press it, or Next.",
        "button:Edit title of part 1",
      ),
      { ...press(PARENT_ID, "\"Edit Child Part Title\": clear the title and press Save, or press Next.", "button:Save"), enter: { Title: "" } },
      at(PARENT_ID, "A blank title puts the default back: \"(1/4) Collapsible sidebar…\" (decided 6 Nov 2026).", "step:multipart"),
    ],
    name: "Add and rename parts",
    demonstrates: "An editor adds a part and renames one. A blank title gets the default, \"(n/total) …\", and the other default titles are renumbered.",
    conditions: "Eve as Admin on VCP-1203, split into three parts.",
    simulated: "Adding and renaming always succeed.",
    expected: "The \"Add a New Child Part\" dialog; a fourth part in the section; the progress recounted. The edit dialog with the current title; Save renames; blank restores \"(1/4) …\".",
    task: "As an admin, add a fourth part to the collapsible sidebar, then give the first part its default name back.",
  },
  {
    ...base,
    id: "av-10-multipart.add-part-completed",
    start: `/added-values/${PART_IDS[2]}`,
    avs: SPLIT({ status: "In Progress" }, [{}, { status: "Completed", step: undefined }, { status: "Review", handoff: { date: "08-11-2026", links: [], attachments: [] } }]),
    steps: [
      press(PART_IDS[2], "Part 3 of VCP-1203 is in Review; parts 1 and 2 are Completed. Press Accept, or Next.", "button:Accept"),
      press(PART_IDS[2], "Press Accept in the review, or Next.", "button:Accept"),
      press(PART_IDS[2], "Part 3 is Completed. Open the parent from the Parent chip, or press Next.", "step:parent"),
      at(PARENT_ID, "The parent completed itself: every part is done, 100% (decided 9 Nov 2026). Status History logs it.", "step:multipart"),
      press(PARENT_ID, "It needs one more piece of work. Press Add Part, or Next.", "button:Add Part"),
      press(PARENT_ID, "\"Status will change\" warns it goes back to In Progress. Press Confirm, or Next.", "button:Confirm"),
      at(PARENT_ID, "Back In Progress, with the new part at 75%. The toast says so."),
    ],
    name: "The parent completes, and reopens",
    demonstrates: "When every part is Completed, the parent moves to Completed on its own; adding a part then returns it to In Progress, with a warning first.",
    conditions: "Eve as Admin on part 3 of VCP-1203, in Review; parts 1 and 2 Completed.",
    simulated: "Accepting and adding always succeed.",
    expected: "Part 3 Completed; the parent Completed with it, 100%. Add Part warns, then the parent is In Progress with a fourth, unfinished part.",
    task: "As an admin, sign off the last part of the collapsible sidebar. Then it turns out to need one more piece of work: add it.",
  },
  {
    ...base,
    id: "av-10-multipart.part-edit-page",
    start: `/added-values/${PART_IDS[2]}`,
    avs: SPLIT(),
    steps: [
      press(PART_IDS[2], "A part's page. Open ⋮, or press Next.", "step:av-menu"),
      press(PART_IDS[2], "Choose Edit, or press Next.", "button:Edit"),
      {
        text: "Projects, AV Category, Type and Urgency are greyed: the part takes them from its parent (Figma 1404:132644; DS #333). The rest can change.",
        target: "step:details",
        path: "/added-values/*/edit",
      },
    ],
    name: "A part's edit page",
    demonstrates: "A part's inherited fields are locked on its edit page.",
    conditions: "Eve as Admin on part 3 of VCP-1203.",
    simulated: "Nothing is saved unless you save.",
    expected: "The four fields shown but disabled; Assignee, dates, Cycle, Tags and Capacity Points still editable.",
    task: "As an admin, see what you can change on a part of the collapsible sidebar.",
  },
  {
    ...base,
    id: "av-10-multipart.one-problem-set",
    start: "/added-values/vcp-1201",
    steps: [
      at("vcp-1201", "VCP-1201 as it is: one problem set.", "step:multipart-source"),
      press("vcp-1201", "Press Accept, or Next.", "button:Accept"),
      at("vcp-1201", "Multipart Value is disabled: \"It needs at least two problem sets to split.\" (decided 9 Nov 2026).", "button:Confirm"),
    ],
    name: "One problem set",
    demonstrates: "An AV needs two or more problem sets to be split.",
    conditions: "Eve as Admin on Marvin's Pending VCP-1201, which has one problem set.",
    simulated: "Nothing changes.",
    expected: "The Accept dialog with Multipart disabled and its hint.",
    task: "As an admin, accept the supplier scorecard in parts, if you can.",
  },
];

export const MULTIPART_FLOW: FlowDef = {
  id: "av-10-multipart",
  area: "AV",
  number: "10",
  name: "Multipart",
  actor: "A Development admin splits; editors (admin, initiator) add and rename parts",
  goal: "Split an Added Value into parts that are tracked on their own, with the original as the parent.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=47-72",
  doc: "flows/av-10-multipart.md",
  status: "Implemented",
  scenarios: MULTIPART_SCENARIOS,
};
