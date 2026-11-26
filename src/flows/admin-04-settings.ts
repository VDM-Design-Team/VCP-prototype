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
      press("Open Users, or press Next: Development's people (the rail's domain), with their status and when they were added.", "Users"),
      press("Press + New User, or Next.", "New User"),
      {
        text: "Create New User (Figma's New User): a Status (Pending, say), a Name, an Email, and tick a Role (Developer). Submit, or press Next.",
        path: SETTINGS,
        target: "button:Submit",
        action: true,
        enter: { Status: "Pending", Name: "Sam Lee", Email: "sam.lee@example.com", Developer: true },
      },
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
      press("Open Users, or press Next.", "Users"),
      press("Press View on Jack Morgan, or Next.", "View Jack Morgan"),
      {
        text: "His account (Figma's View User): Status, Name, Email, Capacity Points with its own Save, and his Roles here. Set the points to 8 and press Save beside them, or press Next: it saves the points alone.",
        path: SETTINGS,
        target: "button:Save",
        action: true,
        enter: { "Capacity Points": "8" },
      },
      { text: "Then tick Senior Developer and Submit, or press Next.", path: SETTINGS, target: "button:Submit", action: true, enter: { "Senior Developer": true } },
      { ...on("\"Changes saved\". His Capacity Points are the most he can take in one cycle (decided 10 Nov 2026); the cycle's total stays separate. Open Planning › Planning List from the rail, or press Next."), open: "/planning/planning-list" },
      { text: "The Planning List warns: Jack Morgan has 12 of 8 points in C44. Move work to another cycle or person.", target: "step:over-cap", path: "/planning/planning-list" },
    ],
    name: "View and change a user",
    demonstrates: "View User: the account, its capacity points and its roles (Figma 1119:112835).",
    conditions,
    simulated: "Saved in the prototype only.",
    expected: "Jack Morgan: 8 points, Developer and Senior Developer; the Planning List warns he's over (12 of 8 in C44).",
    task: "Give Jack the senior role and fewer points this cycle.",
  },
  {
    ...admin,
    id: "admin-04-settings.admin-panel",
    steps: [
      press("Open Admin Panel, or press Next (Figma 806:102342): Development's Roles, Status and Assignee Types, and its Teams.", "Admin Panel"),
      on("Status: the shared steps are locked (\"Default\"); Development's own (In Progress … Confirmed prod) have a grip: drag one, or Space on its grip, then ↑ ↓ and Space."),
      press("Press Add New on Roles, or Next.", "Add New"),
      { text: "\"Add a new Tag\" (Figma 985:377854): type Tech Lead and Submit, or press Next.", path: SETTINGS, target: "button:Submit", action: true, enter: { "Tag Name": "Tech Lead" } },
      on("Tech Lead is at the end of Roles. Its pencil renames it (the same dialog, Save); its bin deletes it, with Undo. A role someone holds can't be deleted: try Developer, \"held by 3 people\" (decided 10 Nov 2026)."),
    ],
    name: "Roles, statuses and assignee types",
    demonstrates: "The Admin Panel's lists: add, rename, reorder, delete (Figma 806:102342, 985:377854).",
    conditions,
    simulated: "Saved in the prototype only.",
    expected: "Tech Lead added to Roles; Status steps reorder; deleting has Undo.",
    task: "Add a Tech Lead role to Development.",
  },
  {
    ...admin,
    id: "admin-04-settings.rename-step",
    steps: [
      press("Open Admin Panel, or press Next.", "Admin Panel"),
      press("Press the pencil on For QA, in Status, or Next.", "Edit For QA"),
      { text: "Rename it Ready for QA and Save, or press Next.", path: SETTINGS, target: "button:Save", action: true, enter: { "Tag Name": "Ready for QA" } },
      {
        ...on("Status reads Ready for QA. Now try the bin on In QA: \"Can't delete In QA\": it's used by an Added Value, so move them first (decided 10 Nov 2026). Then open Manage from the rail, or press Next."),
        open: "/manage",
      },
      { text: "VCP-1105 (Warehouse feed sync) reads Ready for QA: a domain's step shows its new name on every Added Value at once (decided 10 Nov 2026), and on its page's progression.", target: "step:av-list", path: "/manage" },
    ],
    name: "Rename a step everywhere",
    demonstrates: "A domain's own step renamed in Settings, on every Added Value; a step in use can't be deleted.",
    conditions,
    simulated: "Saved in the prototype only.",
    expected: "For QA reads Ready for QA on Manage and the AV page; deleting In QA is refused.",
    task: "Rename the For QA step to Ready for QA.",
  },
  {
    ...admin,
    id: "admin-04-settings.teams",
    steps: [
      press("Open Admin Panel, or press Next: Teams, under the lists (decided 10 Nov 2026: an admin sets teams in Settings; Figma doesn't draw it).", "Admin Panel"),
      /* Teams is the Admin Panel's fourth list, after Roles, Status and Assignee Types. */
      press("Press Add New on Teams, or Next.", "Add New[4]"),
      {
        text: "A name and its people (a search, picks as tags). Make Team QA with Lena Novak and Maya Bennett and Submit, or press Next.",
        path: SETTINGS,
        target: "button:Submit",
        action: true,
        enter: { "Team Name": "Team QA", People: ["Lena Novak", "Maya Bennett"] },
      },
      { ...on("\"Team added\". Open the Dashboard from the rail, or press Next: its team filter (Cycle view) lists Team QA now."), open: "/" },
      { text: "Pick Team QA, or press Next.", target: "step:dashboard-header", path: "/", enter: { Team: "Team QA" } },
      { text: "Team Capacity and User Capacity show Lena and Maya.", target: "step:team-capacity", path: "/" },
    ],
    name: "Make a team",
    demonstrates: "Teams in Settings, read by the dashboard's team filter (decided 10 Nov 2026).",
    conditions,
    simulated: "Teams are kept in the prototype only.",
    expected: "Team QA in Settings and in the dashboard's team filter.",
    task: "Make a QA team for Lena and Maya and check its capacity.",
  },
  {
    ...admin,
    id: "admin-04-settings.add-manual",
    steps: [
      press("Open Manuals, or press Next: the domain's manuals, with who uploaded them.", "Manuals"),
      press("Press Add Manual in the top bar (Figma 1046:242262), or Next.", "Add Manual"),
      {
        text: "Add Manual (decided 10 Nov 2026; Figma draws the button, not the dialog): a Manual Name and its Files. Press Submit empty first, or Next: both say what's missing.",
        path: SETTINGS,
        target: "button:Submit",
        action: true,
      },
      {
        text: "Name it Release checklist, drop or browse for a file, and Submit; or press Next (it attaches a stand-in file).",
        path: SETTINGS,
        target: "button:Submit",
        action: true,
        enter: { "Manual Name": "Release checklist", "Upload a file": "release-checklist.pdf" },
      },
      on("\"Manual added\": Release checklist is on top, uploaded by Eve Kestrel, Today, with its file count. Switch View as to User and open Manuals: it's there for every user in the domain, read-only."),
    ],
    name: "Add a manual",
    demonstrates: "Add Manual's dialog: a name and one or more files, with the shared attachments (decided 10 Nov 2026).",
    conditions,
    simulated: "Nothing is uploaded; the manual is kept in the prototype only.",
    expected: "Release checklist on Manuals, for an admin and a user.",
    task: "Add the release checklist so the whole domain can read it.",
  },
  {
    ...superAdmin,
    start: "/accounts",
    id: "admin-04-settings.accounts",
    steps: [
      on("Super Admin view: Accounts (Figma 921:152559): everyone, the domains they're in, when they were added; edit and delete on each row. Add Account is top left.", "step:accounts", "/accounts"),
      press("Press Edit on Alice Carter, or Next.", "Edit Alice Carter", "/accounts"),
      {
        text: "Her account, with Domain Access & Admin Rights (Figma 921:153865). Tick Admin on Design (BESA): her role there turns Admin. Untick Access on Development: No Access. Submit, or press Next.",
        path: "/accounts",
        target: "button:Submit",
        action: true,
        enter: { "Design (BESA) admin": true, "Development access": false },
      },
      on("\"Changes saved\": her Domains column follows.", "step:accounts", "/accounts"),
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
      press("Press Delete on Priya Shah (pending), or Next.", "Delete Priya Shah", "/accounts"),
      { text: "\"Are you sure you want to delete?\" with her name, so nobody deletes the wrong one. Press Delete, or Next.", path: "/accounts", target: "button:Delete", action: true },
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
      press("Press Add New on Domains, or Next.", "Add New", "/domains"),
      { text: "\"Add a new Domain\" (Figma 984:376997): type Marketing and Submit, or press Next.", path: "/domains", target: "button:Submit", action: true, enter: { "Domain Name": "Marketing" } },
      press("Marketing is at the end. Delete it with its bin, or press Next.", "Delete Marketing", "/domains"),
      { text: "\"Are you sure you want to delete this domain?\" with its name (Figma 984:377443). Press Delete, or Next.", path: "/domains", target: "button:Delete", action: true },
      on("Projects: Add New is Figma's \"Add a new Tag\" (984:376450). A project's bin asks first, like a domain's, and can't be undone (design system 2.0, decided 20 Nov 2026). One that Added Values belong to is refused: try VCP, \"used by\" them (decided 10 Nov 2026), and the dialog stays open for Cancel.", "step:domains", "/domains"),
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
