import type { Role } from "@/components/roles";

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
 * - `button:<Text>`: a button by its words ("Submit").
 * Without a target, the step is text only.
 */
export interface ScenarioStep {
  /** Needed only by a step that a branch or `next` points at. */
  id?: string;
  /** One short line: what to do or notice. */
  text: string;
  target?: string;
  /** The page the step happens on: exact ("/" is the Dashboard), or a prefix ending in "*". Default: the scenario's start. */
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
   * what the step after describes. Never skipped past.
   */
  action?: boolean;
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
  /** The reviewer's guided walk through it. The participant view shows none of it. */
  steps: readonly ScenarioStep[];
  /** The screen's starting data. Read by the screen the scenario opens. */
  setup: Setup;
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
