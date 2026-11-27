import type { Role } from "@/components/roles";
import type { AddedValue } from "@/data/added-values";

/**
 * The Flows & Scenarios model (see "VCP Flows & Scenarios: how we manage them").
 * A flow is a user's task; a scenario is one set of conditions inside it. Each
 * scenario is ONE definition that both its catalogue card and its start read,
 * so the two can't drift apart.
 */

export type ImplementationStatus = "Planned" | "In progress" | "Implemented";
export type TestingStatus = "Not tested" | "Tested";

/**
 * One step of a guided scenario: what the reviewer does or looks at now, and
 * which part of the screen it's about. `target` finds that part:
 * - `step:<name>`: an element marked `data-flow-step="<name>"` on the screen;
 * - `group:<Label>`: a field group named by its label (DetailCard's "Tags", "Assignee");
 * - `button:<Text>`: a button by its words ("Submit"), or an icon-only one by its name; a trailing `*`
 *   matches the start ("Part 2:*"); in an open dialog, the dialog's own buttons come first;
 * - `link:<href>`: a link by where it goes ("/added-values/vcp-1104", a Gantt bar);
 * - `field:<Name>`: a field by its label or name, as `enter` finds it ("Date", to open its picker).
 * Without a target, the step is text only.
 */
export interface ScenarioStep {
  /** Needed only by a step that a branch or `next` points at. */
  id?: string;
  /** One short line: what to do or notice. */
  text: string;
  target?: string;
  /**
   * The page the step happens on: exact ("/" is the Dashboard). A `*` at the
   * end matches the rest ("/added-values/*"); one in the middle matches one
   * segment ("/added-values/*\/edit"). Default: the scenario's start.
   */
  path?: string;
  /**
   * Two or more ways forward: Next opens a menu of them, each going to its own
   * step. Without options, Next goes to `next` or the step after this one.
   */
  options?: readonly { label: string; goto: string }[];
  /** Where Next goes when it isn't the following step (where a branch rejoins). */
  next?: string;
  /**
   * The step asks the user to press its target (Submit). Pressing it moves the
   * walk on by itself, and Next presses it for them, so the screen always shows
   * what the step after describes. Never skipped past. When the step after is
   * on another page, the walk moves only once that page opens, so a press that
   * fails (a blocked Submit) leaves it on this step. A `step:` target presses
   * the first button inside it (the ⋮ menu, the back arrow).
   */
  action?: boolean;
  /**
   * The step asks the user to change the form (type a title, pick a tag, set a
   * date). Next makes the change for them, unless it's made already; making it
   * themselves moves the walk on once it's done, a moment after they stop
   * typing. Back puts back the fills walked before the step it goes to.
   */
  fill?: StepFill;
  /**
   * The step asks the user to enter something in fields that aren't the AV form: a dialog's reason, a demo
   * link, a part's title, a row's checkbox, an assignee. Each key names a field by its label, `aria-label` or
   * placeholder (its start is enough), looked for in the topmost open dialog first, then in the step's own
   * `step:` part of the screen. Each value is the text for a text field ("" clears it), the option's words for a
   * dropdown (`<select>`, a combobox, a button that opens a list), a list of words for a multi-select, or true /
   * false for a checkbox.
   * Next enters them, leaving a field that already holds something alone; entering them yourself moves the walk
   * on once they all hold something and you've stopped typing. With `action` too, Next then presses the target
   * ("pick a reason and press Reject"), and your own press moves the walk on.
   */
  enter?: Record<string, string | boolean | readonly string[]>;
  /**
   * Targets Next presses first, in order, before the step's entries and its own press: what it takes to reach
   * them (open a date picker, press its start and end days). Doing it yourself and pressing the step's target
   * moves the walk on as usual.
   */
  first?: readonly string[];
  /**
   * The step asks the user to open another page ("open VCP-1203, then Edit").
   * Next opens it for them; opening it themselves moves the walk on too (the
   * walk follows to the step for that page).
   */
  open?: string;
  /**
   * The step asks the user to drag a row (the Planning List) onto a section:
   * `row` is the AV's reference, `on` the section's title ("Cycle 45").
   * Next does the drop for them when the row isn't there yet.
   */
  drop?: { row: string; on: string };
}

/**
 * What a `fill` step changes: `set` is merged into the form's values (a nested
 * object, such as `details`, one level deep). `done` says when the user's own
 * change counts; without it, when the form holds `set`.
 */
export interface StepFill {
  set: Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each form has its own values (SubmitDraft for the AV form)
  done?: (values: any) => boolean;
}

export interface ScenarioDef<Setup = unknown> {
  /** Stable, never reused: "av-01-submit.happy". Also the last part of its link. */
  id: string;
  name: string;
  /** The condition or outcome it exists to show. */
  demonstrates: string;
  /** Where it opens: a route. */
  start: string;
  /** Who, and with what data, in words for the card. */
  conditions: string;
  /** What the simulated backend does, including failures. */
  simulated: string;
  /** What should happen, and how the user recovers. */
  expected: string;
  /** The participant's task, without the intended solution. */
  task: string;
  status: ImplementationStatus;
  testing: TestingStatus;
  /** The role the scenario starts as. */
  role: Role;
  /** An admin's domain, from the rail's switcher (Admin · 01). Development when omitted. */
  domain?: string;
  /** The Development admin's dashboard view to start on (Admin · 02). Cycle when omitted. */
  dashboardView?: "cycle" | "quarter";
  /** The reviewer's guided walk through it. The participant view shows none of it. */
  steps: readonly ScenarioStep[];
  /** The screen's starting data. Read by the screen the scenario opens. */
  setup: Setup;
  /** Sample AVs this scenario starts with changed (matched by id), or added (with an id from NEW_AV_IDS). */
  avs?: readonly AddedValue[];
}

export interface FlowDef {
  /** Stable, never reused: "av-01-submit". Matches the FigJam page "AV · 01 Submit". */
  id: string;
  area: "AV" | "Planning" | "Activity" | "Admin";
  number: string;
  name: string;
  /** Who does it. */
  actor: string;
  /** The user's goal, one line. */
  goal: string;
  /** The FigJam page, when it's drawn. */
  figjam?: string;
  /** The flow doc in this repo, when it's written. */
  doc?: string;
  status: ImplementationStatus;
  scenarios: readonly ScenarioDef[];
}
