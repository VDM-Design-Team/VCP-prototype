import { NAV_BY_USER_TYPE } from "@vdm-design-team/vcp-design-system";
import { ROLES, type Role } from "@/components/roles";
import type { ScenarioDef } from "./types";

/* What a scenario's card says about it at a glance, worked out from its definition (nothing new to keep up). */

const ROLE_BY_LABEL = new Map(ROLES.map((r) => [r.label, r.value]));
/* "Switch View as to User", "Switch to Admin in the View as bar", or a step that presses a role. */
const SWITCH = /(?:View as|Switch)[^.]*?\b(Super Admin|Admin|User)\b/g;
const PRESS = /^button:(Super Admin|Admin|User)$/;

/** The roles a scenario is seen as: the one it starts in, then any its steps switch to, in that order. */
export function rolesOf(scenario: ScenarioDef): Role[] {
  const roles = new Set<Role>([scenario.role]);
  for (const step of scenario.steps) {
    for (const [, label] of step.text.matchAll(SWITCH)) roles.add(ROLE_BY_LABEL.get(label)!);
    const pressed = step.target?.match(PRESS);
    if (pressed) roles.add(ROLE_BY_LABEL.get(pressed[1])!);
  }
  return [...roles];
}

/* The rails' own names for their pages (Dashboard, Manage, Holiday Registry …). */
const RAIL_NAMES = new Map(
  Object.values(NAV_BY_USER_TYPE)
    .flat()
    .flatMap((row) => [row, ...(row.items ?? [])])
    .filter((item): item is { key: string; label: string } => typeof item.key === "string" && typeof item.label === "string")
    .map((item) => [item.key, item.label]),
);

/** The page a scenario opens on, by the name its rail gives it, or what it is (an Added Value, its edit page). */
export function startPageOf(scenario: ScenarioDef): string {
  const path = scenario.start;
  if (path === "/added-values/new") return "Create Added Value";
  if (/^\/added-values\/[^/]+\/edit$/.test(path)) return "Edit an Added Value";
  if (/^\/added-values\/[^/]+$/.test(path)) return "Added Value";
  if (path === "/notifications") return "Notification inbox";
  if (path === "/settings") return "Settings";
  const key = path.replace(/^\/+|\/+$/g, "") || "dashboard";
  /* Off every rail: its path, as words ("contact-list" → "Contact list"). */
  return RAIL_NAMES.get(key) ?? key.replace(/[-/]/g, " ").replace(/^./, (c) => c.toUpperCase());
}
