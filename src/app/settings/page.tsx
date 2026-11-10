"use client";

import * as React from "react";
import {
  ACCOUNT_STATUS_OPTIONS,
  ChangePasswordForm,
  DomainCard,
  EmptyState,
  Field,
  Icon,
  Input,
  ManualsTable,
  Button,
  SystemChangelog,
  Modal,
  PageTitle,
  PersonalInfoForm,
  SearchSelect,
  TagManagementModal,
  Tabs,
  tabId,
  tabPanelId,
  UserAccountModal,
  UsersTable,
  useToast,
  type DataTableSort,
  type UserAccountDraft,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { neighbours, useFocusAfterRemove } from "@/components/focus-after-remove";
import { useShellState } from "@/components/shell-state";
import { useSettings } from "@/components/settings-store";
import { useAddedValues } from "@/components/av-store";
import { DOMAINS, VIEWER } from "@/data/added-values";
import { TODAY } from "@/data/gantt";
import { IN_PROGRESS, ago, type Account, type PanelItem, type Team } from "@/data/settings";

/* Admin · 04: Settings (Figma's Settings Pages (Admin), 806:102049). An admin's tabs: Personal Info, Users, Admin
   Panel, Announcements, Manuals, Password; anyone else's: Personal Info and Password. Users and Admin Panel are the
   domain picked in the rail's switcher. The Admin Panel's Teams card is decided, not drawn (Admin · 02, 10 Nov 2026). */

const ADMIN_TABS = [
  { key: "personal-info", label: "Personal Info" },
  { key: "users", label: "Users" },
  { key: "admin-panel", label: "Admin Panel" },
  { key: "announcements", label: "Announcements" },
  { key: "manuals", label: "Manuals" },
  { key: "password", label: "Password" },
];
/* Decided 10 Nov 2026: everyone reads the manuals and the System Changelog; only admins manage them. */
const OWN_TABS = [ADMIN_TABS[0], ADMIN_TABS[4], { key: "changelog", label: "Changelog" }, ADMIN_TABS[5]];
const RELEASES = [
  { id: "r3", title: "Domain budgets", version: "v1.20.0", kind: "feature" as const, date: "2026-11-02", description: "A super admin sets each domain's points for a quarter; an admin sees what's left.", features: ["Domain Budget page", "The budget card on the dashboard"] },
  { id: "r2", title: "Bulk actions on lists", version: "v1.19.2", kind: "update" as const, date: "2026-10-19", description: "Change the status, urgency or cycle of several Added Values at once.", features: ["The bulk bar on Assigned and Manage", "A summary of what couldn't change"] },
  { id: "r1", title: "Gantt chart", version: "v1.19.0", kind: "experimental" as const, date: "2026-10-05", description: "Planned work over time, by person.", features: ["Cycle, month and year views"] },
];
const PAGE_SIZE = 10;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function SettingsScreen() {
  const { role, domain } = useShellState();
  const domainValue: string = DOMAINS.find((d) => d.name === domain)?.value ?? "development";
  const tabs = role === "admin" ? ADMIN_TABS : OWN_TABS;
  const [tab, setTab] = React.useState("personal-info");
  const shown = tabs.some((t) => t.key === tab) ? tab : "personal-info";
  const { toast } = useToast();

  return (
    <Screen
      active="settings"
      header={<PageTitle title="Settings" />}
      /* Figma's admin Manuals tab has Add Manual in the top bar (1046:242262); its dialog isn't drawn yet. */
      primaryAction={
        role === "admin" && shown === "manuals" ? (
          <Button onClick={() => toast({ tone: "info", title: "Add Manual", description: "Its dialog isn't designed yet (Figma draws the button, not the dialog)." })}>Add Manual</Button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-6 py-6">
        <Tabs aria-label="Settings" tabs={tabs} value={shown} onChange={setTab} idPrefix="settings" />
        <div role="tabpanel" id={tabPanelId("settings", shown)} aria-labelledby={tabId("settings", shown)} data-flow-step="settings">
          {shown === "personal-info" && (
            <PersonalInfoForm
              initial={{ name: VIEWER.name, email: "eve.kestrel@example.com" }}
              emailReadOnly
              onSave={() => toast({ tone: "success", title: "Changes Saved", description: "Your details are saved." })}
            />
          )}
          {shown === "users" && <UsersTab domainValue={domainValue} />}
          {shown === "admin-panel" && <AdminPanel domainValue={domainValue} />}
          {shown === "announcements" && (
            <EmptyState
              headingLevel={2}
              icon={<Icon name="megaphone" size="lg" />}
              title="Announcements"
              description="Not in the prototype yet: the announcements table and its dialog are still being built."
            />
          )}
          {shown === "manuals" && <ManualsTab />}
          {shown === "changelog" && <SystemChangelog releases={RELEASES} />}
          {shown === "password" && (
            <ChangePasswordForm onSubmit={() => toast({ tone: "success", title: "Password changed", description: "Use the new one next time you sign in." })} />
          )}
        </div>
      </div>
    </Screen>
  );
}

/** The domain's people (Figma's Users Tab, 992:3002): the table, then Create New User and View. */
function UsersTab({ domainValue }: { domainValue: string }) {
  const { accounts, saveAccount, panel } = useSettings();
  const { toast } = useToast();
  const roles = (panel[domainValue]?.roles ?? []).map((r) => ({ value: r.id, label: r.label }));
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<DataTableSort>({ key: "name", direction: "asc" });
  const [page, setPage] = React.useState(1);
  /* "new", an account being viewed, or closed. */
  const [open, setOpen] = React.useState<"new" | Account | null>(null);

  const q = search.trim().toLowerCase();
  const roleLabel = (a: Account) => (a.roles[domainValue] ?? []).map((id) => roles.find((r) => r.value === id)?.label ?? "").join(" ");
  const mine = accounts
    .filter((a) => a.access[domainValue]?.access || (a.status === "pending" && !Object.keys(a.access).length))
    .filter((a) => !q || `${a.name} ${a.email} ${roleLabel(a)}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const by = sort.key === "dateAdded" ? a.added.localeCompare(b.added) : sort.key === "status" ? a.status.localeCompare(b.status) : a.name.localeCompare(b.name);
      return by * (sort.direction === "asc" ? 1 : -1);
    });
  const pageCount = Math.max(Math.ceil(mine.length / PAGE_SIZE), 1);
  const rows = mine.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((a) => ({ id: a.id, name: a.name, email: a.email, status: a.status, dateAdded: ago(a.added, TODAY) }));
  const editing = open && open !== "new" ? open : null;

  const onSubmit = (draft: UserAccountDraft) => {
    /* The latest saved copy: the capacity's own Save may have changed it since the dialog opened. */
    const base: Account = (editing && accounts.find((a) => a.id === editing.id)) ?? editing ?? {
      id: `u-${Date.now()}`,
      name: "",
      email: "",
      status: "pending",
      added: TODAY,
      proficiency: "Junior",
      capacityPoints: null,
      roles: {},
      access: { [domainValue]: { access: true, admin: false } },
    };
    saveAccount({
      ...base,
      name: draft.name,
      email: draft.email,
      status: draft.status as Account["status"],
      roles: { ...base.roles, [domainValue]: draft.roles ?? [] },
    });
    setOpen(null);
    toast({ tone: "success", title: editing ? "Changes Saved" : "User created", description: editing ? `${draft.name}'s account is saved.` : `${draft.name} is added, ${draft.status === "approved" ? "approved" : "waiting for approval"}.` });
  };

  return (
    <>
      <UsersTable
        rows={rows}
        search={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        sort={sort}
        onSortChange={setSort}
        onNewUser={() => setOpen("new")}
        onView={(row) => setOpen(accounts.find((a) => a.id === row.id) ?? null)}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        itemCount={mine.length}
        pageSize={PAGE_SIZE}
      />
      <UserAccountModal
        key={editing?.id ?? String(open)}
        open={!!open}
        onClose={() => setOpen(null)}
        mode={editing ? "edit" : "new"}
        title={editing ? editing.name : "Create New User"}
        initial={
          editing
            ? { status: editing.status, name: editing.name, email: editing.email, proficiency: editing.proficiency, capacityPoints: editing.capacityPoints, roles: editing.roles[domainValue] ?? [] }
            : { status: "pending", name: "", email: "", proficiency: "", capacityPoints: null }
        }
        roles={roles}
        statusOptions={ACCOUNT_STATUS_OPTIONS}
        onSubmit={onSubmit}
        onSaveCapacity={(points) => {
          if (!editing) return;
          saveAccount({ ...(accounts.find((a) => a.id === editing.id) ?? editing), capacityPoints: points });
          toast({ tone: "success", title: "Capacity saved", description: `${editing.name}: ${points ?? 0} points a cycle in this domain.` });
        }}
      />
    </>
  );
}

type PanelList = "roles" | "statuses" | "assigneeTypes";

/**
 * The domain's lists (Figma's Admin Panel, 806:102342): Roles, Status (the shared steps locked, the domain's own
 * dragged into order) and Assignee Types, and Development's Teams (decided, not drawn).
 */
function AdminPanel({ domainValue }: { domainValue: string }) {
  const { panel, setPanelList, teams, setTeams, accounts } = useSettings();
  const { toast } = useToast();
  const lists = panel[domainValue] ?? { roles: [], statuses: [], assigneeTypes: [] };
  /* The tag dialog: which list, and the item being renamed (or none: a new one). */
  const [tagFor, setTagFor] = React.useState<{ list: PanelList; item?: PanelItem } | null>(null);
  const [teamFor, setTeamFor] = React.useState<Team | "new" | null>(null);
  /* Never drop focus: after a delete, the next row's Delete, the previous one's, or the card's Add New. */
  const area = React.useRef<HTMLDivElement>(null);
  const focusAfter = useFocusAfterRemove(area);

  const { avs } = useAddedValues();
  /* Decided 10 Nov 2026: what's still in use can't be deleted; the message says what uses it. */
  const inUse = (list: PanelList, item: PanelItem): string | null => {
    if (list === "roles") {
      const n = accounts.filter((a) => a.roles[domainValue]?.includes(item.id)).length;
      return n ? `${item.label} is held by ${n} ${n === 1 ? "person" : "people"}. Take it off them first.` : null;
    }
    if (list === "statuses") {
      const n = avs.filter((av) => av.domain === domainValue && (item.id === IN_PROGRESS ? av.status === "In Progress" && !av.step : av.step === item.id)).length;
      return n ? `${item.label} is used by ${n} Added ${n === 1 ? "Value" : "Values"}. Move them to another step first.` : null;
    }
    return null;
  };
  const remove = (list: PanelList, item: PanelItem) => {
    const why = inUse(list, item);
    if (why) {
      toast({ tone: "critical", title: `Can't delete ${item.label}`, description: why });
      return;
    }
    const before = lists[list];
    /* Only rows with a bin: the locked ones have none. */
    focusAfter(neighbours(before.filter((i) => i.variant !== "locked").map((i) => i.label), item.label, "Add New"));
    setPanelList(domainValue, list, before.filter((i) => i.id !== item.id));
    toast({ tone: "info", title: "Deleted", description: `${item.label} is deleted.`, actionLabel: "Undo", onAction: () => setPanelList(domainValue, list, before) });
  };
  const card = (list: PanelList, title: string) => (
    <DomainCard
      title={title}
      items={lists[list]}
      onAdd={() => setTagFor({ list })}
      onEdit={(item) => setTagFor({ list, item: lists[list].find((i) => i.id === item.id) })}
      onDelete={(item) => remove(list, lists[list].find((i) => i.id === item.id)!)}
      {...(list === "statuses" && {
        /* Only the domain's own steps move; the shared ones keep their places around them. */
        onReorder: (ids: string[]) => setPanelList(domainValue, list, ids.map((id) => lists[list].find((i) => i.id === id)!)),
      })}
    />
  );

  return (
    <div ref={area} className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      {card("roles", "Roles")}
      {card("statuses", "Status")}
      {card("assigneeTypes", "Assignee Types")}
      {domainValue === "development" && (
        <DomainCard
          title="Teams"
          items={teams.map((t) => ({ id: t.id, label: t.name }))}
          onAdd={() => setTeamFor("new")}
          onEdit={(item) => setTeamFor(teams.find((t) => t.id === item.id) ?? null)}
          onDelete={(item) => {
            const before = teams;
            focusAfter(neighbours(teams.map((t) => t.name), item.label, "Add New"));
            setTeams(teams.filter((t) => t.id !== item.id));
            toast({ tone: "info", title: "Deleted", description: `${item.label} is deleted.`, actionLabel: "Undo", onAction: () => setTeams(before) });
          }}
        />
      )}
      <TagManagementModal
        open={!!tagFor}
        type="tag"
        mode={tagFor?.item ? "edit" : "add"}
        initialName={tagFor?.item?.label ?? ""}
        onClose={() => setTagFor(null)}
        onSubmit={(name) => {
          if (!tagFor) return;
          const items = lists[tagFor.list];
          if (tagFor.item) setPanelList(domainValue, tagFor.list, items.map((i) => (i.id === tagFor.item!.id ? { ...i, label: name } : i)));
          else if (tagFor.list === "statuses") {
            /* A new status is one of the domain's own steps: after the last one, before Review. */
            const at = items.findIndex((i) => i.label === "Review");
            const next = [...items];
            next.splice(at < 0 ? next.length : at, 0, { id: `${slug(name)}-${Date.now()}`, label: name, variant: "draggable" });
            setPanelList(domainValue, tagFor.list, next);
          } else setPanelList(domainValue, tagFor.list, [...items, { id: `${slug(name)}-${Date.now()}`, label: name }]);
          setTagFor(null);
          toast({ tone: "success", title: tagFor.item ? "Renamed" : "Added", description: `${name} is saved.` });
        }}
      />
      {teamFor && (
        <TeamModal
          team={teamFor === "new" ? undefined : teamFor}
          people={accounts.filter((a) => a.access.development?.access).map((a) => a.name)}
          onClose={() => setTeamFor(null)}
          onSave={(team) => {
            setTeams(teamFor === "new" ? [...teams, team] : teams.map((t) => (t.id === team.id ? team : t)));
            setTeamFor(null);
            toast({ tone: "success", title: teamFor === "new" ? "Team added" : "Team saved", description: `${team.name}: ${team.people.length} ${team.people.length === 1 ? "person" : "people"}. The dashboard's team filter has it.` });
          }}
        />
      )}
    </div>
  );
}

/** A team's name and people (decided 10 Nov 2026; Figma draws no team dialog, so it's DS Modal, Field and SearchSelect). */
function TeamModal({ team, people, onClose, onSave }: { team?: Team; people: string[]; onClose: () => void; onSave: (team: Team) => void }) {
  const [name, setName] = React.useState(team?.name ?? "");
  const [members, setMembers] = React.useState<string[]>(team?.people ?? []);
  const [tried, setTried] = React.useState(false);
  const nameError = tried && !name.trim() ? "Give the team a name." : undefined;
  return (
    <Modal
      open
      onClose={onClose}
      title={team ? `Edit ${team.name}` : "Add a new Team"}
      size="sm"
      actions={{
        cancelLabel: "Cancel",
        confirm: {
          label: team ? "Save" : "Submit",
          onClick: () => {
            setTried(true);
            if (!name.trim()) return;
            onSave({ id: team?.id ?? `team-${Date.now()}`, name: name.trim(), people: members });
          },
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <Field label="Team Name" htmlFor="team-name" error={nameError}>
          <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} invalid={!!nameError} />
        </Field>
        <Field label="People" htmlFor="team-people">
          <SearchSelect
            id="team-people"
            multiple
            display="tags"
            rows="avatar"
            searchPlaceholder="Search by name"
            placeholder="Select people"
            options={people.map((p) => ({ value: p, label: p }))}
            value={members}
            onChange={setMembers}
          />
        </Field>
      </div>
    </Modal>
  );
}

/** Figma's Manuals Tab (1046:242262): the manuals, with who uploaded them. Sample rows; nothing opens. */
function ManualsTab() {
  const [page, setPage] = React.useState(1);
  const rows = [
    { id: "m1", name: "Writing a good Added Value", uploadedBy: { name: "Eve Kestrel", email: "eve.kestrel@example.com" }, attachmentCount: 2, dateAdded: "2 months ago" },
    { id: "m2", name: "How planning cycles work", uploadedBy: { name: "John Mason Smith", email: "john.mason.smith@example.com" }, attachmentCount: 1, dateAdded: "4 months ago" },
    { id: "m3", name: "Handing off for review", uploadedBy: { name: "Alice Carter", email: "alice.carter@example.com" }, attachmentCount: 3, dateAdded: "6 months ago" },
  ];
  return <ManualsTable rows={rows} page={page} pageCount={1} onPageChange={setPage} />;
}
