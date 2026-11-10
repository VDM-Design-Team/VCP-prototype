"use client";

import * as React from "react";
import {
  ACCOUNT_STATUS_OPTIONS,
  AccountsTable,
  Button,
  ConfirmDeleteModal,
  PageTitle,
  UserAccountModal,
  useToast,
  type DataTableSort,
  type UserAccountDraft,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { SEARCH, neighbours, useFocusAfterRemove } from "@/components/focus-after-remove";
import { useSettings } from "@/components/settings-store";
import { TODAY } from "@/data/gantt";
import { accessRows, ago, type Account } from "@/data/settings";

/* Admin · 04: the super admin's Accounts (Figma 921:123385): everyone, their domains, and the user dialog with
   Domain Access & Admin Rights (Edit User 921:153865, Add New User 921:154349). */
const PAGE_SIZE = 10;
const PROFICIENCY = ["Junior", "Mid", "Senior"];

export default function AccountsScreen() {
  const { accounts, saveAccount, removeAccount, domains } = useSettings();
  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const [sort, setSort] = React.useState<DataTableSort>({ key: "name", direction: "asc" });
  const [page, setPage] = React.useState(1);
  const [open, setOpen] = React.useState<"new" | Account | null>(null);
  const [deleting, setDeleting] = React.useState<Account | null>(null);
  const editing = open && open !== "new" ? open : null;
  /* Never drop focus: after a delete, the next row's Delete, the previous one's, or the search. */
  const searchRef = React.useRef<HTMLDivElement>(null);
  const focusAfter = useFocusAfterRemove(searchRef);

  const domainsOf = (a: Account) => domains.filter((d) => a.access[d.id]?.access).map((d) => d.label);
  const q = search.trim().toLowerCase();
  const all = accounts
    .filter((a) => !q || `${a.name} ${a.email} ${domainsOf(a).join(" ")}`.toLowerCase().includes(q))
    .sort((a, b) => (sort.key === "dateAdded" ? a.added.localeCompare(b.added) : a.name.localeCompare(b.name)) * (sort.direction === "asc" ? 1 : -1));
  const pageCount = Math.max(Math.ceil(all.length / PAGE_SIZE), 1);
  const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((a) => ({ id: a.id, name: a.name, email: a.email, domains: domainsOf(a), dateAdded: ago(a.added, TODAY) }));

  const onSubmit = (draft: UserAccountDraft) => {
    /* The latest saved copy: the capacity's own Save may have changed it since the dialog opened. */
    const base: Account = (editing && accounts.find((a) => a.id === editing.id)) ?? editing ?? { id: `u-${Date.now()}`, name: "", email: "", status: "pending", added: TODAY, proficiency: "Junior", capacityPoints: null, roles: {}, access: {} };
    saveAccount({
      ...base,
      name: draft.name,
      email: draft.email,
      status: draft.status as Account["status"],
      proficiency: (draft.proficiency || base.proficiency) as Account["proficiency"],
      access: Object.fromEntries(draft.access.map((r) => [String(r.id), { access: r.access, admin: r.admin }])),
    });
    setOpen(null);
    toast({ tone: "success", title: editing ? "Changes Saved" : "Account added", description: `${draft.name}: ${draft.access.filter((r) => r.access).length} domain(s).` });
  };

  return (
    <Screen
      active="accounts"
      header={<PageTitle title="Accounts" />}
      primaryAction={<Button onClick={() => setOpen("new")}>Add Account</Button>}
    >
      <div className="flex flex-col gap-4 py-6" data-flow-step="accounts" ref={searchRef}>
        <AccountsTable
          rows={rows}
          search={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          sort={sort}
          onSortChange={setSort}
          onEdit={(row) => setOpen(accounts.find((a) => a.id === row.id) ?? null)}
          onDelete={(row) => setDeleting(accounts.find((a) => a.id === row.id) ?? null)}
          page={page}
          pageCount={pageCount}
          onPageChange={setPage}
          itemCount={all.length}
          pageSize={PAGE_SIZE}
        />
      </div>
      <UserAccountModal
        key={editing?.id ?? String(open)}
        open={!!open}
        onClose={() => setOpen(null)}
        mode={editing ? "edit" : "new"}
        title={editing ? editing.name : "Add New User"}
        initial={
          editing
            ? { status: editing.status, name: editing.name, email: editing.email, proficiency: editing.proficiency, capacityPoints: editing.capacityPoints }
            : { status: "pending", name: "", email: "", proficiency: "", capacityPoints: null }
        }
        domains={accessRows(editing ?? undefined, domains)}
        statusOptions={ACCOUNT_STATUS_OPTIONS}
        proficiencyOptions={PROFICIENCY}
        onSubmit={onSubmit}
        onSaveCapacity={(points) => {
          if (!editing) return;
          saveAccount({ ...(accounts.find((a) => a.id === editing.id) ?? editing), capacityPoints: points });
          toast({ tone: "success", title: "Capacity saved", description: `${editing.name}: ${points ?? 0} points a cycle.` });
        }}
      />
      <ConfirmDeleteModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        itemLabel="User"
        itemName={deleting?.name ?? ""}
        onConfirm={() => {
          if (!deleting) return;
          const gone = deleting;
          focusAfter(neighbours(rows.map((r) => r.name), gone.name, SEARCH));
          removeAccount(gone.id);
          setDeleting(null);
          /* The confirm says it can't be undone (Figma's copy), so there is no Undo. */
          toast({ tone: "info", title: "Account deleted", description: `${gone.name} can no longer sign in.` });
        }}
      />
    </Screen>
  );
}
