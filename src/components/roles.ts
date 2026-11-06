import { NAV_BY_USER_TYPE, type SidebarUserType } from "@vdm-design-team/vcp-design-system";

/* VCP's three user types, and the rail each one sees. Admin is the Dev Admin
   rail: it has everything a Design Admin's has, plus Planning. */
export type Role = "user" | "admin" | "super-admin";

export const ROLES: readonly { value: Role; label: string; rail: SidebarUserType }[] = [
  { value: "user", label: "User", rail: "user" },
  { value: "admin", label: "Admin", rail: "admin-dev" },
  { value: "super-admin", label: "Super Admin", rail: "super-admin" },
];

export const railFor = (role: Role) => ROLES.find((r) => r.value === role)!.rail;

/** Every key a role's rail can navigate to: its rows and their sub-rows. */
const keysOf = (role: Role) =>
  NAV_BY_USER_TYPE[railFor(role)].flatMap((row) => [row.key, ...(row.items ?? []).flatMap((sub) => sub.key ?? [])]);

/** Whether a rail key (`drafts`, `planning/gantt-chart`) is one this role's rail shows. */
export const roleSees = (role: Role, key: string) => keysOf(role).includes(key);

/** The rail key a path belongs to: `/` is the Dashboard, `/planning/gantt-chart` is itself. */
export const keyForPath = (pathname: string) => pathname.replace(/^\/+|\/+$/g, "") || "dashboard";

/**
 * The role to start in for a page opened directly: User, unless only another
 * role's rail has the page (Gantt Chart is Admin's, Accounts is Super Admin's).
 */
export const roleForPath = (pathname: string): Role => {
  const key = keyForPath(pathname);
  return ROLES.find((r) => roleSees(r.value, key))?.value ?? "user";
};
