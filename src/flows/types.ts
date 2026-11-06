import type { Role } from "@/components/roles";

/**
 * The Flows & Scenarios model (see "VCP Flows & Scenarios: how we manage them").
 * A flow is a user's task; a scenario is one set of conditions inside it. Each
 * scenario is ONE definition that both its catalogue card and its start read,
 * so the two can't drift apart.
 */

export type ImplementationStatus = "Planned" | "In progress" | "Implemented";
export type TestingStatus = "Not tested" | "Tested";

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
