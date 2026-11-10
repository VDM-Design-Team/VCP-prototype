import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Admin · 04 Users, tags and domains — the flow doc is `flows/admin-04-settings.md`,
 * the FigJam page is "Admin · 04 Users, tags and domains". An admin's Settings
 * (Users, Admin Panel with Development's Teams) for the domain in the rail's switcher,
 * and the super admin's Accounts and Domains. Figma: Settings Pages (Admin) 806:102049,
 * Accounts 921:123385, Domains 808:104305.
 */

const SETTINGS = "/settings";
const on = (text: string, target = "step:settings", path = SETTINGS): ScenarioStep => ({ text, target, path });
const press = (text: string, button: string, path = SETTINGS): ScenarioStep => ({ text, target: `button:${button}`, path, action: true });

const admin = { status: "Implemented", testing: "Not tested", role: "admin", start: SETTINGS, setup: undefined } as const;
const superAdmin = { status: "Implemented", testing: "Not tested", role: "super-admin", setup: undefined } as const;
const conditions = "Eve as Admin of Development, on Settings (her name's menu, top right › Settings).";

export const SETTINGS_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...admin,
    id: "admin-04-settings.new-user",
    steps: [
      on("Admin view: Settings, from the menu under Eve's name (top right). Figma's tabs (806:102049): Personal Info, Users, Admin Panel, Announcements, Manuals, Password."),
      press("Open Users: Development's people (the rail's domain), with their status and when they were added.", "Users"),
      press("Press + New User.", "New User"),
      { text: "Create New User (Figma's New User): a Status (Pending, say), a Name, an Email, and tick a Role (Developer). Submit, then Next.", path: SETTINGS },
      on("\"User created\": they're in the table, with their status. A pending user waits for approval."),
    ],
    name: "Add a user",
    demonstrates: "The Users tab and Create New User (Figma 992:3002).",
    conditions,
    simulated: "Nothing is sent; the user is added to the prototype's list.",
    expected: "The new user in the table, Pending, with the role ticked.",
    task: "Add a new developer to the Development domain.",
  },
  {
    ...admin,
    id: "admin-04-settings.view-user",
    steps: [
      press("Open Users.", "Users"),
      press("Press View on Jack Morgan.", "View Jack Morgan"),
      { text: "His account (Figma's View User): Status, Name, Email, Capacity Points with its own Save, and his Roles here. Set the points to 8 and press Save beside them (it saves the points alone), then tick Senior Developer and Submit. Then Next.", path: SETTINGS },
      on("\"Changes Saved\". His points are what this domain plans him at."),
    ],
    name: "View and change a user",
    demonstrates: "View User: the account, its capacity points and its roles (Figma 1119:112835).",
    conditions,
    simulated: "Capacity points are saved in the prototype only; the planning pages keep their own figures.",
    expected: "Jack Morgan: 8 points, Developer and Senior Developer.",
    task: "Give Jack the senior role and fewer points this cycle.",
  },
  {
    ...admin,
    id: "admin-04-settings.admin-panel",
    steps: [
      press("Open Admin Panel (Figma 806:102342): Development's Roles, Status and Assignee Types, and its Teams.", "Admin Panel"),
      on("Status: the shared steps are locked (\"Default\"); Development's own (In Progress … Confirmed prod) have a grip: drag one, or Space on its grip, then ↑ ↓ and Space."),
      press("Press Add New on Roles.", "Add New"),
      { text: "\"Add a new Tag\" (Figma 985:377854): type Tech Lead, Submit, then Next.", path: SETTINGS },
      on("Tech Lead is at the end of Roles. Its pencil renames it (the same dialog, Save); its bin deletes it, with Undo."),
    ],
    name: "Roles, statuses and assignee types",
    demonstrates: "The Admin Panel's lists: add, rename, reorder, delete (Figma 806:102342, 985:377854).",
    conditions,
    simulated: "The lists live in Settings only: a renamed status doesn't rename it on Added Values yet.",
    expected: "Tech Lead added to Roles; Status steps reorder; deleting has Undo.",
    task: "Add a Tech Lead role to Development.",
  },
  {
    ...admin,
    id: "admin-04-settings.teams",
    steps: [
      press("Open Admin Panel: Teams, under the lists (decided 10 Nov 2026: an admin sets teams in Settings; Figma doesn't draw it).", "Admin Panel"),
      on("Press Add New on Teams: a name and its people (a search, picks as tags). Make Team QA with Lena Novak and Maya Bennett, then Submit."),
      on("\"Team added\". Open the Dashboard from the rail: its team filter (Cycle view) lists Team QA now. Then Next."),
      { text: "Pick Team QA: Team Capacity and User Capacity show Lena and Maya.", target: "step:dashboard-header", path: "/" },
    ],
    name: "Make a team",
    demonstrates: "Teams in Settings, read by the dashboard's team filter (decided 10 Nov 2026).",
    conditions,
    simulated: "Teams are kept in the prototype only.",
    expected: "Team QA in Settings and in the dashboard's team filter.",
    task: "Make a QA team for Lena and Maya and check its capacity.",
  },
  {
    ...superAdmin,
    start: "/accounts",
    id: "admin-04-settings.accounts",
    steps: [
      on("Super Admin view: Accounts (Figma 921:152559): everyone, the domains they're in, when they were added; edit and delete on each row. Add Account is top left.", "step:accounts", "/accounts"),
      press("Press Edit on Alice Carter.", "Edit Alice Carter", "/accounts"),
      { text: "Her account, with Domain Access & Admin Rights (Figma 921:153865). Tick Admin on Design (BESA): her role there turns Admin. Untick Access on Development: No Access. Submit, then Next.", path: "/accounts" },
      on("\"Changes Saved\": her Domains column follows.", "step:accounts", "/accounts"),
    ],
    name: "Give someone a domain",
    demonstrates: "Accounts and the user dialog's domain access (Figma 921:153865).",
    conditions: "Eve as Super Admin on Accounts.",
    simulated: "Access is kept in the prototype only; the rail's domain switcher keeps its three domains.",
    expected: "Alice: Design (BESA) as Admin; no Development.",
    task: "Make Alice the Design admin and take her off Development.",
  },
  {
    ...superAdmin,
    start: "/accounts",
    id: "admin-04-settings.delete-account",
    steps: [
      press("Press Delete on Priya Shah (pending).", "Delete Priya Shah", "/accounts"),
      { text: "\"Are you sure you want to delete?\" with her name, so nobody deletes the wrong one. Press Delete, then Next.", path: "/accounts" },
      on("\"Account deleted\". Focus is on the Delete of the row before hers (she was the last), not lost. The confirm said it can't be undone, so there is no Undo.", "step:accounts", "/accounts"),
    ],
    name: "Delete an account",
    demonstrates: "Deleting a user, with the confirm; focus moves on, not lost.",
    conditions: "Eve as Super Admin on Accounts.",
    simulated: "Nothing is sent.",
    expected: "Priya gone; focus on Delete Noah Foster.",
    task: "Remove an account that was never approved.",
  },
  {
    ...superAdmin,
    start: "/domains",
    id: "admin-04-settings.domains",
    steps: [
      on("Super Admin view: Domains (Figma 808:104308): the domains, and the projects an Added Value belongs to.", "step:domains", "/domains"),
      press("Press Add New on Domains.", "Add New", "/domains"),
      { text: "\"Add a new Domain\" (Figma 984:376997): type Marketing, Submit, then Next.", path: "/domains" },
      on("Marketing is at the end. Delete it with its bin: \"Are you sure you want to delete this domain?\" with its name (Figma 984:377443). Confirm, then Next.", "step:domains", "/domains"),
      on("Projects: Add New is Figma's \"Add a new Tag\" (984:376450); a project's bin deletes it with Undo.", "step:domains", "/domains"),
    ],
    name: "Domains and projects",
    demonstrates: "The super admin's lists (Figma 808:104305).",
    conditions: "Eve as Super Admin on Domains.",
    simulated: "Kept in the prototype only: the rail and the AV forms keep their own lists.",
    expected: "Marketing added, then deleted after the confirm.",
    task: "Add a Marketing domain, then take it out again.",
  },
];

export const SETTINGS_FLOW: FlowDef = {
  id: "admin-04-settings",
  area: "Admin",
  number: "04",
  name: "Users, tags and domains",
  actor: "Admin, Super Admin",
  goal: "Keep each domain's people, lists and teams right, and the super admin's accounts and domains.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=85-257",
  doc: "flows/admin-04-settings.md",
  status: "Implemented",
  scenarios: SETTINGS_SCENARIOS,
};
