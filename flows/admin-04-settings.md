# Admin · 04 Users, tags and domains

**ID:** `admin-04-settings` (stable; never reused)
**Status:** Implemented in the prototype · Not approved as product behaviour yet · Every piece is on DS `main` (Eve's #264, #267, #268 among them) but **Add Manual's dialog, DS #367** (`AddManualModal`), not merged; the local DS build also carries the open PRs earlier flows use
**FigJam:** [Admin · 04 Users, tags and domains](https://www.figma.com/board/Jl6ANWtBbRbTTo4ItjtdoQ/VCP-Flows---Scenarios?node-id=85-257) (decision diagram, then screen by screen, drawn from the prototype's screens)
**Figma sources:** VCP Pages - Flows: Settings Pages (Admin) `806:102049` (Admin Panel `806:102342`, Add New Tag `985:377854`, Add New Domain `985:377864`, Delete Domain `985:377874`, Users Tab `992:3002`: New User `1119:112831`, View User `1119:112835`, Manuals Tab `1046:242262`, Password Tab `1037:238069`, Personal Info Tab `1037:238081`) · Accounts Page `921:123385` (Edit User `921:153865`, New User `921:154349`) · Domain Page `808:104305` (Tag Management `808:104308`, Add New Tag `984:376450`, Add New Domain `984:376997`, Delete Domain `984:377443`)
**Scenarios:** [`src/flows/admin-04-settings.ts`](../src/flows/admin-04-settings.ts), runnable from the Flows & Scenarios catalogue (`/flows`)

## User goal
Keep each domain's people, lists and teams right (an admin), and everyone's accounts and the domains themselves (the super admin).

## Actor, entry points and starting conditions
- **An admin**, from **Settings** in the menu under their name (top right). Users and Admin Panel are the domain picked in the rail's switcher (Admin · 01).
- **Anyone else** gets Settings with Personal Info, **Manuals** (read-only), **Changelog** (the System Changelog) and Password (decided 10 Nov 2026).
- **The super admin**, from **Accounts** and **Domains** in their rail.

## Main steps and decision points
1. **Settings** (Figma `806:102049`, DS `Tabs`): Personal Info, **Users**, **Admin Panel**, Announcements, Manuals, Password.
2. **Users** (DS `UsersTable`, Figma `992:3002`): the domain's people, their status (DS `AccountStatusTag`) and when they were added; a search, sorting, pages.
   - **+ New User** (DS `UserAccountModal`, "Create New User"): Status, Name, Email, Roles. Submit: "User created".
   - **View** (the same dialog, filled): Status, Name, Email, **Capacity Points** with its own **Save** (it saves the points alone), Roles. Submit: "Changes Saved".
   - **Capacity Points are a per-person cap** (decided 10 Nov 2026): the most that person can take in one cycle. The cycle's fixed total stays separate. **The Planning List warns** when someone's work in an open cycle goes past their cap ("Jack Morgan: 12 of 8 points in C44"); the dashboard's User Capacity row is capped by it.
3. **Admin Panel** (DS `DomainCard`, Figma `806:102342`): **Roles**, **Status** and **Assignee Types**, each with Add New, a pencil (rename) and a bin (delete).
   - **Status**: the shared steps are locked ("Default"); the domain's own steps have a grip and move by dragging, or by Space, ↑ ↓, Space. **Renaming or reordering them shows on every Added Value in the domain at once**, and on the AV page's progression (decided 10 Nov 2026).
   - **Something in use can't be deleted** (decided): a role someone holds ("held by 3 people"), a step Added Values are on ("used by 1 Added Value"), a project Added Values belong to. The message says what uses it; move them first.
   - **Add New / rename** (DS `TagManagementModal`, "Add a new Tag", Figma `985:377854`); a new status lands after the domain's last step.
   - **Teams** (Development; decided 10 Nov 2026, not in Figma): a name and its people (DS `Modal`, `Field`, `Input`, `SearchSelect`). The dashboard's team filter (Admin · 02) reads them.
4. **Accounts** (super admin; DS `AccountsTable`, Figma `921:152559`): everyone, their domains, when they were added; **Edit** and **Delete** per row; **Add Account** in the top bar.
   - **Edit / Add** (DS `UserAccountModal` with DS `DomainAccessTable`, Figma `921:153865`): Status, Name, Email, Proficiency, Capacity Points, and **Domain Access & Admin Rights**, a row per domain: Access, Admin, and the Role they add up to.
   - **Delete** (DS `ConfirmDeleteModal`): "Are you sure you want to delete?" with the name.
5. **Manuals** (Figma `1046:242262`, DS `ManualsTable`): the domain's manuals, who uploaded them, how many files, when. **Every user in the domain reads them** (decided 10 Nov 2026).
   - **Add Manual** (admins, in the top bar; DS `AddManualModal`, #367; decided 10 Nov 2026, Figma draws no dialog): a **Manual Name** and **one or more files** (DS `Attachments`, the shared drop area and file cards). Submit: "Manual added"; it's on top, uploaded by the admin, "Today".
6. **Domains** (super admin; DS `DomainCard`, Figma `808:104308`): **Domains** and **Projects**.
   - **Add New** on Domains: "Add a new Domain" (`984:376997`); on Projects: "Add a new Tag" (`984:376450`).
   - **Delete** a domain: "Are you sure you want to delete this domain?" with its name (`984:377443`). A project's bin deletes it with Undo.

## Alternatives, failures and recovery
| Condition | What the user sees | How they recover |
|---|---|---|
| A required field empty (name, email) | The dialog's own error under the field | Fill it in |
| A team with no name | "Give the team a name." | Name it |
| Add Manual with no name, or no file | "Give the manual a name." / "Add at least one file." | Fill them in |
| A row deleted with its bin (a tag, a status step, a team, a project) | "Deleted", with Undo; focus on the next row's Delete (or the previous one's, or Add New) | Undo |
| An account or a domain deleted after the confirm | "Account deleted" / "Domain deleted", no Undo (the confirm says it can't be undone); focus on the next row's Delete, or the previous one's, or the search | — |

## Completion or exit
- **Done:** the domain's people, lists and teams are right; the super admin's accounts and domains too.
- **Not in this flow:** Announcements (Eve's #269 and #270, open), the changelog, a user's own Personal Info and Password beyond the forms.

## The prototype's own rules (Figma doesn't say)
- **Who's on Users**: everyone with access to the domain, and pending accounts no domain has taken yet.
- **Roles are per domain**: each domain has its own list; a user's roles are per domain.
- **Statuses**: In Progress moves with the domain's own steps, as Figma draws it, but it stays on the shared spine; a new status lands after the domain's last step and becomes one of its steps.
- **The cap's warning** counts a person's own points (or an even share) in Development's open cycles, against their Capacity Points.
- **Teams** are Development's (the domain that plans in cycles). People are those with access to Development.
- **A delete by bin** has Undo; **a delete after a confirm** has none, because the confirm says it can't be undone.
- **Focus after a delete** moves on purpose: the next row's Delete, else the previous one's, else Add New or the search (the DS rule, `docs/accounts-table.md`).
- **Domains and projects** live on the Domains page only: the rail's domain switcher and the AV forms keep their own lists.
- **Personal Info, Manuals, Changelog, Password** are the DS forms, table and changelog with sample data; saving shows a toast. **Announcements** shows "Not in the prototype yet". **Add Manual** is in the admin's top bar on Manuals (Figma `1046:242262`); nothing is uploaded, and the manual is kept in the prototype only.

## What Figma shows, and what the prototype uses
| Where | Figma | Prototype |
|---|---|---|
| Settings title | "Page Title" (a placeholder) | "Settings" |
| Admin Panel tab bar | the Personal Info tab underlined, over the Admin Panel's content | the tab that's open is the one underlined |
| Teams | not drawn | a Teams card in the Admin Panel (decided), with its own dialog from DS parts |
| Add Manual's dialog | not drawn | a name and one or more files (decided; DS `AddManualModal`, #367) |
| Deleting a tag or a project | no confirm drawn | the bin deletes, with Undo |
| Domains page title | "Page Title" | "Domains"; Accounts: "Accounts" |
| Emails | `@vdm.technology` | `@example.com` (sample people) |

## Decided (10 Nov 2026)
- **Teams' dialog stays in the prototype**, page-level, until Figma settles the Teams design. No DS piece.
- **Status steps: renamed or reordered, they show everywhere at once**, on every Added Value in the domain and on the AV page's progression.
- **Deleting something in use is blocked, with why** ("Used by 1 Added Value"); the admin moves them first.
- **Capacity Points are a per-person cap** for one cycle; the cycle's total stays separate; the Planning List warns when someone goes over.
- **Everyone reads Manuals and the System Changelog**: users read-only (no Add Manual), admins also manage them.
- **Add Manual asks for a name and one or more files**, with the shared attachments (DS #364); every user in the domain can read it. The dialog is DS `AddManualModal` (#367).

## Unresolved questions
None.
