import type { DomainAccessRow, ManualRow } from "@vdm-design-team/vcp-design-system";
import { CHAINS, DOMAINS } from "./added-values";
import { PEOPLE, PROJECTS } from "./gantt";

/* Admin · 04: the Settings data (Figma's Settings Pages (Admin) 806:102049, Accounts 921:123385, Domains
   808:104305). Sample people only; no real names or addresses. What a change here reaches elsewhere in the
   prototype is in flows/admin-04-settings.md. */

export type AccountStatus = "approved" | "pending" | "inactive";

export interface Account {
  id: string;
  name: string;
  email: string;
  status: AccountStatus;
  /** ISO date the account was added. */
  added: string;
  proficiency: "Junior" | "Mid" | "Senior";
  /** Development points a cycle, for the domain's admin (Figma: "Points allocated for this user in the current domain"). */
  capacityPoints: number | null;
  /** Role values per domain value ("development" → ["developer"]). */
  roles: Record<string, string[]>;
  /** Per domain value: can they get in, and are they its admin. */
  access: Record<string, { access: boolean; admin: boolean }>;
}

const slug = (name: string) => name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
const dev = { development: { access: true, admin: false } };

export const ACCOUNTS: Account[] = [
  { id: "u-eve", name: "Eve Kestrel", status: "approved", added: "2025-03-02", proficiency: "Senior", capacityPoints: 10, roles: { development: ["senior-developer"] }, access: { development: { access: true, admin: true }, design: { access: true, admin: true }, content: { access: true, admin: true } } },
  { id: "u1", name: "John Mason Smith", status: "approved", added: "2025-06-11", proficiency: "Senior", capacityPoints: 10, roles: { development: ["senior-developer"] }, access: dev },
  { id: "u2", name: "Alice Carter", status: "approved", added: "2025-09-20", proficiency: "Mid", capacityPoints: 10, roles: { development: ["developer"] }, access: { ...dev, design: { access: true, admin: false } } },
  { id: "u3", name: "Jack Morgan", status: "approved", added: "2026-01-08", proficiency: "Mid", capacityPoints: 10, roles: { development: ["developer"] }, access: dev },
  { id: "u4", name: "Lena Novak", status: "approved", added: "2026-04-15", proficiency: "Junior", capacityPoints: 8, roles: { development: ["junior-developer"] }, access: { ...dev, design: { access: true, admin: false } } },
  { id: "u5", name: "Maya Bennett", status: "approved", added: "2026-07-01", proficiency: "Junior", capacityPoints: 8, roles: { development: ["junior-developer"] }, access: dev },
  { id: "u6", name: "Noah Foster", status: "approved", added: "2026-08-19", proficiency: "Mid", capacityPoints: 10, roles: { development: ["developer"] }, access: dev },
  { id: "u7", name: "Marvin Ode", status: "approved", added: "2025-11-30", proficiency: "Senior", capacityPoints: null, roles: { design: ["senior-product-designer"] }, access: { design: { access: true, admin: false }, development: { access: true, admin: false } } },
  { id: "u8", name: "Priya Shah", status: "pending", added: "2026-11-03", proficiency: "Junior", capacityPoints: null, roles: {}, access: {} },
].map((a) => ({ ...a, email: `${slug(a.name)}@example.com` })) as Account[];

/** The planning team is the Gantt's people (the dashboard and planning read them). */
export const PLANNING_PEOPLE = PEOPLE.map((p) => p.name);

/** A list in the Admin Panel (Figma 806:102342), per domain: Roles, Status and Assignee Types. */
export interface PanelItem {
  id: string;
  label: string;
  /** `locked`: a default the domain can't change ("Default"); `draggable`: the domain's own step, reordered by dragging. */
  variant?: "default" | "locked" | "draggable";
}

const locked = (labels: string[]): PanelItem[] => labels.map((label) => ({ id: slug(label), label, variant: "locked" }));

/** The statuses every domain shares, in the spine's order; a domain adds its own steps after In Progress (Figma's list). */
const shared = ["Pending", "Accepted", "Initiated"];
const after = ["Review", "Rejected", "Backlog", "Draft", "Completed"];

/** The status list as Figma draws it: the shared steps locked, In Progress and the domain's own steps (its chain) movable. */
const statusesFor = (domain: "development" | "design" | "content"): PanelItem[] => [
  ...locked(shared),
  { id: IN_PROGRESS, label: "In Progress", variant: "draggable" },
  ...(domain === "content" ? [] : CHAINS[domain].map((s) => ({ id: s.id, label: s.label, variant: "draggable" as const }))),
  ...locked(after),
];
/** In Progress is on the shared spine, not a domain's own step, though Figma lets it move with them. */
export const IN_PROGRESS = "in-progress";
/** A domain's own steps, from its status list: the movable ones but In Progress. */
export const chainOf = (statuses: readonly PanelItem[]) => statuses.filter((i) => i.variant === "draggable" && i.id !== IN_PROGRESS).map((i) => ({ id: i.id, label: i.label }));

export const PANEL: Record<string, { roles: PanelItem[]; statuses: PanelItem[]; assigneeTypes: PanelItem[] }> = {
  development: {
    roles: [
      { id: "junior-developer", label: "Junior Developer" },
      { id: "developer", label: "Developer" },
      { id: "senior-developer", label: "Senior Developer" },
    ],
    statuses: statusesFor("development"),
    assigneeTypes: [...locked(["Assignee", "Viewer"]), { id: "qa", label: "QA" }],
  },
  design: {
    roles: [
      { id: "junior-product-designer", label: "Junior Product Designer" },
      { id: "product-designer", label: "Product Designer" },
      { id: "senior-product-designer", label: "Senior Product Designer" },
    ],
    statuses: statusesFor("design"),
    assigneeTypes: [...locked(["Assignee", "Viewer"]), { id: "qa", label: "QA" }],
  },
  content: {
    roles: [{ id: "writer", label: "Writer" }, { id: "editor", label: "Editor" }],
    statuses: statusesFor("content"),
    assigneeTypes: locked(["Assignee", "Viewer"]),
  },
};

/** Teams an admin sets in Settings (decided 10 Nov 2026, Admin · 02): the dashboard's team filter reads them. */
export { TEAMS, type Team } from "./teams";

/** Figma's Manuals Tab (1046:242262): sample manuals, with who uploaded them. Every user in the domain reads them;
    an admin's Add Manual puts one on top (decided 10 Nov 2026). */
export const MANUALS: ManualRow[] = [
  { id: "m1", name: "Writing a good Added Value", uploadedBy: { name: "Eve Kestrel", email: "eve.kestrel@example.com" }, attachmentCount: 2, dateAdded: "2 months ago" },
  { id: "m2", name: "How planning cycles work", uploadedBy: { name: "John Mason Smith", email: "john.mason.smith@example.com" }, attachmentCount: 1, dateAdded: "4 months ago" },
  { id: "m3", name: "Handing off for review", uploadedBy: { name: "Alice Carter", email: "alice.carter@example.com" }, attachmentCount: 3, dateAdded: "6 months ago" },
];

/** The super admin's Domains page (Figma 808:104308): the domains, and the projects an AV belongs to. */
export const DOMAIN_LIST: PanelItem[] = DOMAINS.map((d) => ({ id: d.value, label: d.name }));
export const PROJECT_LIST: PanelItem[] = PROJECTS.map((p) => ({ id: p.id, label: p.name }));

/** An account's Domain Access & Admin Rights rows, every domain listed (Figma's Edit User). */
export const accessRows = (a: Pick<Account, "access"> | undefined, domains: readonly PanelItem[]): DomainAccessRow[] =>
  domains.map((d) => ({ id: d.id, domain: d.label, access: !!a?.access[d.id]?.access, admin: !!a?.access[d.id]?.admin }));

/** "4 months ago", from the prototype's today (05/11/2026), as the users tables read it. */
export function ago(iso: string, today: string) {
  const days = Math.round((Date.parse(today) - Date.parse(iso)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
  const years = Math.round(days / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
