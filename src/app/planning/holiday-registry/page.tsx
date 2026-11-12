"use client";

import * as React from "react";
import {
  ConfirmDeleteModal,
  HolidayModal,
  HolidayTable,
  PageTitle,
  useToast,
  type DataTableSort,
  type HolidayDraft,
  type HolidayFilters,
  type HolidayRow,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useHolidays } from "@/components/holiday-store";
import { useShellState } from "@/components/shell-state";
import { CYCLES, PEOPLE, TODAY } from "@/data/gantt";
import { VIEWER } from "@/data/added-values";
import { EVERYONE, type Holiday } from "@/data/holidays";
import { TEAMS } from "@/data/teams";

/* Planning → Holiday Registry (Planning · 03). Figma "VCP Pages - Flows",
   Holiday Registry (3:7732): the table for an admin (3:8484) and a user
   (1234:179617), the Add / Edit Holiday dialog (3:8583, 3:8584) and its
   errors (3:8582). An admin adds, edits and removes entries; a user only
   reads. Leave here makes a person unavailable on the Planning List. */

const NO_FILTERS: HolidayFilters = { type: "", period: null, user: "" };
const overlaps = (a: { start: string; end: string }, b: { start: string; end: string }) => a.start <= b.end && b.start <= a.end;

const toRow = (h: Holiday): HolidayRow => ({
  id: h.id,
  name: h.name,
  duplicateOfHubstaff: h.duplicateOfHubstaff,
  start: h.start,
  ...(h.end !== h.start && { end: h.end }),
  type: h.type,
  appliesTo: h.people,
  allDay: h.allDay,
  recurring: h.recurring,
  addedBy: h.addedBy === "system" ? "system" : { name: h.addedBy },
  source: h.source,
});

/* The cycles of the year, as the Period filter's presets (Figma's "Sprint 34 (19-22 May)"). */
const PERIODS = CYCLES.filter((c) => c.start.startsWith("2026")).map((c) => ({ label: c.label, value: c.start, rangeEnd: c.end }));

export default function HolidayRegistryScreen() {
  const { holidays, add, update, remove } = useHolidays();
  const { role } = useShellState();
  const { toast } = useToast();
  const admin = role !== "user";
  const [filters, setFilters] = React.useState(NO_FILTERS);
  const [sort, setSort] = React.useState<DataTableSort>({ key: "date", direction: "asc" });
  /* The dialog: adding (no id) or editing one entry. */
  const [editing, setEditing] = React.useState<{ id?: string } | null>(null);
  const [removing, setRemoving] = React.useState<Holiday | null>(null);

  const rows = holidays
    .filter((h) => !filters.type || h.type === filters.type)
    .filter((h) => !filters.period || overlaps(h, filters.period))
    /* "all" is the filter's All Users. */
    .filter((h) => !filters.user || filters.user === "all" || h.people.includes(filters.user))
    .sort((a, b) => a.start.localeCompare(b.start) * (sort.direction === "asc" ? 1 : -1))
    .map(toRow);

  const current = editing?.id ? holidays.find((h) => h.id === editing.id) : undefined;
  /* The dialog's Applies to holds teams for a Team holiday and people for an Individual one; a Public one has none. */
  const draftOf = (h: Holiday): HolidayDraft => ({
    name: h.name,
    recurring: h.recurring,
    start: h.start,
    end: h.end,
    type: h.type,
    appliesTo: h.type === "team" ? [...(h.teams ?? [])] : h.type === "individual" ? [...h.people] : [],
    allDay: h.allDay,
    ...(!h.allDay && { from: h.from, to: h.to }),
  });

  const submit = ({ appliesTo, ...d }: HolidayDraft) => {
    /* Who it covers (decided 9 Nov 2026): a Public holiday everyone, a Team one its teams' members, an Individual one the people picked. */
    const people =
      d.type === "public"
        ? EVERYONE
        : d.type === "team"
          ? [...new Set(TEAMS.filter((t) => appliesTo.includes(t.id)).flatMap((t) => t.people))]
          : appliesTo;
    /* An all-day holiday keeps no times, so an edit back to All Day drops them. */
    const entry = { ...d, from: d.from, to: d.to, people, teams: d.type === "team" ? appliesTo : undefined };
    if (current) {
      update(current.id, entry);
      toast({ tone: "success", title: "Holiday saved", description: d.name });
    } else {
      add({ ...entry, addedBy: VIEWER.name, source: "manual" });
      toast({ tone: "success", title: "Holiday added", description: d.name });
    }
    setEditing(null);
  };

  /* The row's Delete button leaves with the row: focus goes to Add Holiday rather than the page. */
  const focusAdd = () =>
    window.setTimeout(() => {
      const el = document.activeElement;
      if (el && el !== document.body && el.isConnected) return;
      [...document.querySelectorAll<HTMLElement>('[data-flow-step="holidays"] button')]
        .find((b) => b.textContent?.trim() === "Add Holiday")
        ?.focus();
    }, 150);

  return (
    <Screen active="planning/holiday-registry" header={<PageTitle title="Holiday Registry" />}>
      {/* Where a guided scenario's step points (Planning · 03): see src/flows/types.ts. */}
      <div className="py-6" data-flow-step="holidays">
        <HolidayTable
          rows={rows}
          filters={filters}
          onFiltersChange={setFilters}
          users={PEOPLE.map((p) => ({ value: p.name, label: p.name }))}
          periodPresets={PERIODS}
          today={TODAY}
          onResetFilters={() => setFilters(NO_FILTERS)}
          sort={sort}
          onSortChange={setSort}
          admin={admin}
          onAdd={() => setEditing({})}
          onEdit={(row) => setEditing({ id: row.id })}
          onDelete={(row) => setRemoving(holidays.find((h) => h.id === row.id) ?? null)}
          onImport={() =>
            toast({ tone: "info", title: "Import from Hubstaff", description: "Not in the prototype: Figma doesn't draw the import yet." })
          }
          caption="Holidays"
        />
      </div>
      <HolidayModal
        key={editing ? (editing.id ?? "new") : "closed"}
        open={!!editing}
        onClose={() => setEditing(null)}
        holiday={current && draftOf(current)}
        teams={TEAMS.map((t) => ({ value: t.id, label: t.name }))}
        people={PEOPLE.map((p) => ({ value: p.name, label: p.name }))}
        onSubmit={submit}
      />
      {removing && (
        <ConfirmDeleteModal
          open
          onClose={() => setRemoving(null)}
          onConfirm={() => {
            remove(removing.id);
            toast({ tone: "success", title: "Holiday removed", description: removing.name });
            setRemoving(null);
            focusAdd();
          }}
          itemLabel="Holiday"
          itemName={removing.name}
          /* A duplicate of a Hubstaff entry: Figma's "(Future)" popup copy (3:8586). */
          {...(removing.duplicateOfHubstaff && {
            title: "Remove Manual Holiday Entry?",
            description:
              "This entry is already covered by Hubstaff. Removing it from VCP avoids duplicate holiday coverage and won’t affect capacity calculations.",
            confirmLabel: "Remove",
          })}
        />
      )}
    </Screen>
  );
}
