import type { FlowDef, ScenarioDef, ScenarioStep } from "./types";

/**
 * Planning · 03 Holiday registry — the flow doc is
 * `flows/planning-03-holidays.md`, the FigJam page is "Planning · 03 Holiday
 * registry". An admin adds, edits and removes holidays and leave (DS
 * `HolidayTable`, `HolidayModal`); a user reads them. Leave makes
 * a person unavailable on the Planning List (Planning · 02); public holidays
 * aren't working days in its estimates. Figma: Holiday Registry 3:7732.
 */

const PATH = "/planning/holiday-registry";
const PLANNING = "/planning/planning-list";
const on = (text: string, target = "step:holidays", path = PATH): ScenarioStep => ({ text, target, path });
/* A step inside a dialog: no outline (the dialog is the whole screen). */
const say = (text: string, path = PATH): ScenarioStep => ({ text, path });
const press = (text: string, button: string, path = PATH): ScenarioStep => ({ text, target: `button:${button}`, path, action: true });

const admin = { status: "Implemented", testing: "Not tested", role: "admin", start: PATH, setup: undefined } as const;
const conditions = "Eve as Admin on the Holiday Registry; the sample holidays and leave, today 05/11/2026.";

export const HOLIDAY_SCENARIOS: readonly ScenarioDef[] = [
  {
    ...admin,
    role: "user",
    id: "planning-03-holidays.as-a-user",
    start: "/",
    steps: [
      { ...press("User view, on the Dashboard: a user's rail has Holiday Registry as a row of its own (decided 9 Nov 2026; DS #337). Open it.", "Holiday Registry", "/"), target: "button:Holiday Registry" },
      on("The same table and filters (Figma 1234:179617), but no Add Holiday, no Import from Hubstaff and no Actions column. They read everyone's entries."),
      on("Holiday type → Individual Holiday: only personal leave stays."),
      on("Applies to → Noah Foster: only what covers him, his leave and the holidays that cover everyone."),
    ],
    name: "As a user: read only",
    demonstrates: "What a non-admin sees: the registry without its admin actions (Figma's Normal User table).",
    conditions: "Eve as a User, starting on the Dashboard.",
    simulated: "The entries are sample data.",
    expected: "No Add, Import or Actions; the filters narrow the table.",
    task: "As a user, find out when Noah is away.",
  },
  {
    ...admin,
    id: "planning-03-holidays.add",
    steps: [
      on("Admin view (Figma 3:8484): Add Holiday and Import from Hubstaff top right; Edit and Delete on each row (a system-added row can only be deleted)."),
      press("Press Add Holiday.", "Add Holiday"),
      say("Add Holiday (Figma 3:8583): Holiday Name, Recurring Yearly (on), Date, All Day (on; off, it asks From and To), Holiday Type. Press Add with nothing filled in: each field says what it needs (Figma 3:8582), and the first takes focus. Then name it, pick a period (two clicks, Apply) and choose a type: Team asks which teams it applies to, Individual which people, Public no one (it is everyone's). Press Add, then Next."),
      on("It's in the table, Added By you, Manual Entry, and a toast says so; focus is back on Add Holiday. Applies to shows who it covers; a Public holiday covers everyone, and also stops being a working day in the Planning List's estimates."),
    ],
    name: "Add a holiday",
    demonstrates: "Adding an entry, with the dialog's checks.",
    conditions,
    simulated: "Nothing is saved. A Public holiday covers everyone, a Team one its teams' members, an Individual one the people picked (decided 9 Nov 2026). The teams are sample data.",
    expected: "The three errors (and \"Select who it applies to\" for a Team or Individual holiday), then the new row and a toast.",
    task: "As an admin, add the office's closing day on 30 November.",
  },
  {
    ...admin,
    id: "planning-03-holidays.edit",
    steps: [
      on("Team offsite (18/12/2026) was entered by hand, so it has Edit; Google Calendar's holidays have only Delete."),
      press("Press Edit on Team offsite.", "Edit Team offsite, Eve Kestrel and 6 others"),
      say("Edit Holiday (Figma 3:8584), filled in, with the three teams it applies to. Change the name, the date or the teams, press Save, then Next."),
      on("The row shows the change, and a toast says it's saved; focus is back on its Edit button."),
    ],
    name: "Edit a holiday",
    demonstrates: "Editing a manual entry; system entries can't be edited.",
    conditions,
    simulated: "Nothing is saved.",
    expected: "The row changes; a toast.",
    task: "As an admin, the offsite moved: change it.",
  },
  {
    ...admin,
    id: "planning-03-holidays.duplicate",
    steps: [
      on("Jack Morgan's Annual leave (07/12/2026) has an amber flag: point at it. \"Hubstaff already includes this entry. Remove it from VCP to avoid duplicate coverage.\" The Hubstaff one, Leave, is the row below it."),
      press("Press Delete on Jack Morgan's Annual leave.", "Delete Annual leave, Jack Morgan"),
      say("\"Remove Manual Holiday Entry?\" (Figma's future popup, 3:8586): it's covered by Hubstaff, and removing it won't change capacity. Press Remove, then Next."),
      on("The duplicate is gone; Hubstaff's entry stays. Focus is on Add Holiday, and a toast says it's removed. Any other entry's Delete asks the usual \"Are you sure you want to delete?\"."),
    ],
    name: "Remove a Hubstaff duplicate",
    demonstrates: "The duplicate flag and removing the manual copy (ConfirmDeleteModal, with Figma's copy here).",
    conditions,
    simulated: "Hubstaff's entries are sample data; nothing syncs.",
    expected: "The flagged row is removed; the Hubstaff row stays.",
    task: "As an admin, clean up Jack's leave, which is in VCP twice.",
  },
  {
    ...admin,
    id: "planning-03-holidays.leave-and-planning",
    steps: [
      on("Noah Foster is on leave 16–20/11/2026 (Annual leave, Applies to Noah Foster). Leave here is what makes someone unavailable when planning."),
      press("Open Planning List from the rail.", "Planning List"),
      { text: "Drag VCP-1128 onto Cycle 45 (Next does it): Add Required Details opens.", target: "step:planning", path: PLANNING, drop: { row: "VCP-1128", on: "Cycle 45" } },
      say("Pick Noah Foster with 8 points: the Due Date estimates to 20/11, inside his leave, so he can't be assigned (in the list he's under Unavailable, free from Nov 21). Press Cancel, then Next.", PLANNING),
      press("Back to the Holiday Registry from the rail.", "Holiday Registry", PLANNING),
      press("Delete Noah's leave.", "Delete Annual leave, Noah Foster"),
      say("Confirm with Delete, then Next."),
      press("Open Planning List again.", "Planning List"),
      { text: "Drag VCP-1128 onto Cycle 45 again.", target: "step:planning", path: PLANNING, drop: { row: "VCP-1128", on: "Cycle 45" } },
      say("Pick Noah with 8 points again: now he's free (no caption), and Confirm plans it. The registry and the plan are one picture.", PLANNING),
    ],
    name: "Leave and planning",
    demonstrates: "The registry feeding the Planning List: leave makes an assignee unavailable; removing it frees them.",
    conditions,
    simulated: "Both pages read the same sample data, until a scenario starts again.",
    expected: "Noah unavailable while his leave stands; available once it's removed.",
    task: "As an admin, see why Noah can't take the comment-export AV, then clear his leave and give it to him.",
  },
];

export const HOLIDAYS_FLOW: FlowDef = {
  id: "planning-03-holidays",
  area: "Planning",
  number: "03",
  name: "Holiday registry",
  actor: "Admin edits, User views",
  goal: "Keep holidays and leave in one place, so planning knows who is away.",
  figjam: "https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=61-284",
  doc: "flows/planning-03-holidays.md",
  status: "Implemented",
  scenarios: HOLIDAY_SCENARIOS,
};
