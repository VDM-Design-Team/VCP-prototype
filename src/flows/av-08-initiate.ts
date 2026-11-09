import { ADDED_VALUES, type AddedValue, type Duplicate } from "@/data/added-values";
import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * AV · 08 Initiate to another domain — the flow doc is `flows/av-08-initiate.md`,
 * the FigJam page is "AV · 08 Initiate to another domain". On the edit page
 * (AV · 04), "Duplicate to other Domains" opens a copy per ticked domain;
 * Submit initiates them. The original then lists them under Duplicates, each
 * with its own status, and keeps its own.
 */

const PENDING = ADDED_VALUES.find((av) => av.id === "vcp-1200")!;
/** Eve's Pending AV, already initiated to Design, with the copy at `status` there. */
const withCopy = (status: string, extra: Partial<Duplicate> = {}): AddedValue => ({
  ...PENDING,
  duplicates: [{ domain: "Design (BESA)", status, title: "Undo for deleted description cards (design)", ...extra }],
});

const page = (text: string, target = "step:av-menu"): ScenarioStep => ({ text, target, path: "/added-values/vcp-1200" });
const edit = (text: string, target: string, action = false): ScenarioStep => ({
  text,
  target,
  path: "/added-values/vcp-1200/edit",
  ...(action ? { action: true } : {}),
});

const base = { status: "Implemented", testing: "Not tested", role: "user", setup: undefined } as const;

export const INITIATE_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...base,
    id: "av-08-initiate.initiate",
    start: "/added-values/vcp-1200/edit",
    steps: [
      edit("Eve's Pending AV, open for editing. Under Status History: Duplicate to other Domains. Its own domain, Development, isn't offered.", "step:duplicate"),
      edit("Tick Initiate to Design (BESA) assignment.", "step:duplicate"),
      edit("The copy in Design (BESA) domain appears, filled in from the AV. Change its title for Design.", "step:copy-design"),
      edit("Press Submit. The AV's checks run, and the copy needs a title.", "button:Submit", true),
      page("Saved, still Pending. The details card now lists Duplicates: Design (BESA), Initiated (Figma 1142:144122).", "step:details"),
    ],
    name: "Initiate to Design",
    demonstrates: "A copy of the AV goes to another domain; the original lists it under Duplicates.",
    conditions: "Eve (User) on the edit page of her Pending AV VCP-1200 (Development).",
    simulated: "Initiating always succeeds. The copy isn't a page of its own in the prototype.",
    expected: "Ticking a domain opens its copy. Submit saves the AV, still Pending, and its details card lists Design (BESA): Initiated.",
    task: "Your undo Added Value needs design work too. Send a copy to the Design domain.",
  },
  {
    ...base,
    id: "av-08-initiate.copy-needs-title",
    start: "/added-values/vcp-1200/edit",
    steps: [
      edit("Tick Initiate to Content assignment, then clear the copy's title.", "step:duplicate"),
      edit("Press Submit.", "button:Submit", true),
      edit("Blocked: the copy's Title shows the error, and a toast says which copy needs a title.", "step:copy-content"),
      edit("Untick Content instead: its copy goes, and so does the error. Or give it a title. Then Submit.", "step:duplicate"),
    ],
    name: "A copy without a title",
    demonstrates: "Each copy needs a title before Submit.",
    conditions: "Eve (User) on the edit page of VCP-1200.",
    simulated: "Nothing is sent until Submit passes.",
    expected: "An error under the copy's Title and a \"Missing Input\" toast naming the domain. Unticking or a title clears it.",
    task: "Send a copy of your undo Added Value to the Content domain.",
  },
  {
    ...base,
    id: "av-08-initiate.status-mirrors",
    start: "/added-values/vcp-1200",
    avs: [withCopy("In design")],
    steps: [
      page("Design has moved its copy on: Duplicates shows In design. The original is still Pending (Figma 1144:46123).", "step:details"),
      page("Open ⋮ → Edit."),
      edit("Design (BESA) is greyed out: an AV can't be initiated to the same domain twice. The others can still be picked.", "step:duplicate"),
    ],
    name: "The copy moves on its own",
    demonstrates: "Each copy's status shows on the original, which keeps its own; a domain can't be initiated twice.",
    conditions: "Eve (User) on VCP-1200, Pending, whose Design copy is In design.",
    simulated: "The copy's status comes from the sample data.",
    expected: "Duplicates: Design (BESA), In design; the AV stays Pending. On its edit page Design is disabled.",
    task: "Check how the design copy of your undo Added Value is getting on.",
  },
  {
    ...base,
    id: "av-08-initiate.copy-rejected",
    start: "/added-values/vcp-1200",
    avs: [withCopy("Rejected", { rejection: "Out of Scope: Falls outside the Domain's responsibilities." })],
    steps: [
      page("Design rejected its copy: a red banner says so, with Design's reason (Figma 1146:65944).", "step:av-menu"),
      page("Duplicates shows Design (BESA): Rejected. The original's own status is untouched: still Pending.", "step:details"),
    ],
    name: "The copy is rejected",
    demonstrates: "A copy rejected in its domain shows on the original as a banner; the original goes on.",
    conditions: "Eve (User) on VCP-1200, Pending, whose Design copy was rejected.",
    simulated: "The rejection comes from the sample data.",
    expected: "\"This Task was rejected in Design (BESA) Domain\" with the reason; Duplicates reads Rejected; the AV stays Pending.",
    task: "Find out what happened to the design copy of your undo Added Value.",
  },
  {
    ...base,
    id: "av-08-initiate.copy-backlogged",
    start: "/added-values/vcp-1200",
    avs: [withCopy("Backlog", { remarks: "No design capacity this quarter." })],
    steps: [
      page("Design backlogged its copy: a yellow banner gives Design's feedback (Figma 1146:65362).", "step:av-menu"),
      page("Duplicates shows Design (BESA): Backlog; the original stays Pending.", "step:details"),
    ],
    name: "The copy is backlogged",
    demonstrates: "A copy backlogged in its domain shows on the original as a warning banner.",
    conditions: "Eve (User) on VCP-1200, Pending, whose Design copy is in the Backlog.",
    simulated: "The backlog comes from the sample data.",
    expected: "\"This Task was backlogged in Design (BESA) Domain\" with the feedback; Duplicates reads Backlog.",
    task: "Find out what happened to the design copy of your undo Added Value.",
  },
];

export const INITIATE_FLOW: FlowDef = {
  id: "av-08-initiate",
  area: "AV",
  number: "08",
  name: "Initiate to another domain",
  actor: "Whoever can edit the AV (AV · 04)",
  goal: "Send a copy of an Added Value to another domain, and follow how it goes there.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=40-72",
  doc: "flows/av-08-initiate.md",
  status: "Implemented",
  scenarios: INITIATE_SCENARIOS,
};
