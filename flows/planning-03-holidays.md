# Planning · 03 Holiday registry

**ID:** `planning-03-holidays` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · **Depends on DS #285** (Eve's `HolidayTable`, `HolidayModal`, `HolidayTypeTag`, `HolidaySourceBadge`; changes requested), not released
**FigJam:** [Planning · 03 Holiday registry](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=61-284) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows, Holiday Registry `3:7732`: Admin table `3:8484`, dropdowns and tooltips `3:8532`, sprint picker `3:8580` · User table `1234:179617`, empty `1261:12583` · Add `3:8583`, Edit `3:8584`, errors `3:8582`, tooltip and picker `16:11839` · (Future) Remove duplicate `3:8586`. Figma draws screens only, no flows.
**Scenarios:** [`src/flows/planning-03-holidays.ts`](../src/flows/planning-03-holidays.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Keep public holidays, team days off and personal leave in one place, so everyone can see who is away and planning knows who can't be assigned.

## Actor, entry points and starting conditions
- **An admin** adds, edits and removes entries. **A user** reads them (Figma's Normal User table: no Add, Import or Actions).
- An admin: Planning → **Holiday Registry**. A user: **Holiday Registry**, a top-level row of their rail (decided 9 Nov 2026; DS #337), the same page.
- Sample entries: Google Calendar's public holidays (New Year's Day, Labour Day, Christmas; yearly), personal leave (Noah 16–20/11, Lena 21–31/12), a partial day (Alice, 12/11), a team offsite (18/12), and Jack's leave twice, once by hand and once from Hubstaff.

## Main steps and decision points
1. **The table** (DS `HolidayTable`): Name, Date (with its day count), Holiday Type, Applies to, All Day / Partial Day, Recurring (Yearly / One-Time), Added By, Source (Manual Entry, Google Calendar, In Hubstaff), and for an admin, Actions. Filters: Holiday Type, Period (a month calendar with the cycles down its side) and Applies to.
2. **Add Holiday** (DS `HolidayModal`, Figma `3:8583`): Holiday Name, Recurring Yearly (on by default; ⓘ "Repeat this holiday every year, or keep it as a one-time event."), Date (a two-month range; Apply / Clear), Holiday Type (Public, Team, Individual). **Add** checks: "Enter the holiday’s name", "Select a date", "Select a holiday type"; the first to fail takes focus. Added: a toast, Added By the admin, Manual Entry.
3. **Edit** (`3:8584`): only manual entries; filled in; **Save**. System entries (Google Calendar, Hubstaff) can only be deleted.
4. **Delete**: "Are you sure you want to delete?" (DS `ConfirmDeleteModal`, decided in #285's review). For a **Hubstaff duplicate** (the amber flag: "Hubstaff already includes this entry. Remove it from VCP to avoid duplicate coverage.") it uses Figma's "Remove Manual Holiday Entry?" copy (`3:8586`) and **Remove**. Focus then goes to Add Holiday.
5. **What it changes elsewhere** (the prototype's rules, below): on the Planning List an assignee is **Unavailable** over all-day leave or a holiday that covers them, **Busy** over a partial day, and **public holidays aren't working days** in the estimated dates.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| Add or Save with fields missing | Each says what it needs; focus on the first | Fill them in |
| Filters match nothing | The empty table: "No holidays have been added yet." (#285's single message; its review decided a second one, "No holidays match your filters.") | Clear the filters |
| Import from Hubstaff | A toast: not in the prototype (Figma doesn't draw it) | — |

## Completion or exit
- **Done:** the registry is right, and the Planning List's availability follows it.

## The prototype's own rules (until #285 has the decided fields)
- **Who an entry covers** (stand-in): Public covers everyone (decided). Until the dialog's **Applies to** field lands in #285, a Team entry covers everyone and **a new Individual entry covers no one**; the samples name their person.
- **New entries are all-day** (stand-in) until #285's **All day** toggle and times land.
- **Availability:** all-day leave or a holiday that covers someone → Unavailable (cannot be assigned); a partial day → Busy (can be). Yearly entries count every year.
- **Estimates skip public holidays**, as they skip weekends.

## Decided (9 Nov 2026)
- **Applies to:** the dialog gets the field: **Team picks teams, Individual picks people, Public covers everyone.** Asked of Eve in #285; the prototype keeps its stand-in until it lands, then uses it.
- **Partial days:** the dialog gets an **All day** toggle with **from / to times**; a partial day makes someone **Busy**, not Unavailable (as built). Also asked of Eve in #285.
- **A user's rail:** Holiday Registry is a **top-level row** (DS #337).
- **Holiday types:** Public, Team and Individual, all three.
- **Deleting a synced entry** (Google Calendar, Hubstaff): **deleted stays deleted**; a later sync must not bring it back. (The prototype has no sync.)
- **Import from Hubstaff:** stays a toast for now.
- **Public holidays only push dates**; they don't cut a cycle's capacity.

## Unresolved questions
- None for this flow, beyond #285 landing the two fields.
