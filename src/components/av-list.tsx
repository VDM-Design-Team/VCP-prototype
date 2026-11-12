"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AVTable,
  EmptyState,
  FilterBar,
  Icon,
  PageTitle,
  type AVTableRow,
  type DataTableSort,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "./screen";
import { BulkActions } from "./bulk-actions";
import { useAddedValues } from "./av-store";
import { PEOPLE, TODAY } from "@/data/gantt";
import { isInitiator, stageLabel, updatedLabel, type AddedValue } from "@/data/added-values";

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY);

/** A multipart AV's tag (AV · 10, DS #275): the parent's progress, or a part's place and parent. */
function multipartOf(av: AddedValue, all: readonly AddedValue[]): AVTableRow["multipart"] {
  if (av.parts?.length) {
    const parts = av.parts.map((id) => all.find((x) => x.id === id)).filter(Boolean) as AddedValue[];
    return { kind: "parent", completed: parts.filter((p) => p.status === "Completed").length, total: av.parts.length };
  }
  const parent = av.parent ? all.find((x) => x.id === av.parent) : undefined;
  if (parent?.parts) return { kind: "child", position: parent.parts.indexOf(av.id) + 1, total: parent.parts.length, parentRef: parent.ref };
  return undefined;
}

/**
 * A person's home domain, for the members' tooltips (Admin · 03, Figma 2007:182516: "Jack (Development) —
 * Assignee"). The prototype's rule: the planning team (the Gantt's people) is Development's; anyone else is Design
 * (Figma writes "Design").
 */
const homeDomain = (name: string) => (PEOPLE.some((p) => p.name === name) ? "Development" : "Design");

/** Members, as Figma's Manage table lists them: the initiators first, then the assignees; someone who is both says so. */
function membersOf(av: AddedValue): NonNullable<AVTableRow["members"]> {
  const assignees = av.assignees.map((a) => a.name);
  const people = [...av.initiators, ...assignees.filter((n) => !isInitiator(av, n))];
  return people.map((name) => ({
    name,
    domain: homeDomain(name),
    role: isInitiator(av, name) ? (assignees.includes(name) ? "Initiator, Assignee" : "Initiator") : "Assignee",
  }));
}

/** One AV as AVTable draws it. */
function toRow(av: AddedValue, all: readonly AddedValue[] = []): AVTableRow {
  const left = av.dueDate ? dayOf(av.dueDate) - dayOf(TODAY) : undefined;
  return {
    id: av.id,
    ref: av.ref,
    title: av.title,
    domain: av.project,
    attachments: av.files.length,
    comments: av.comments.length,
    due: av.dueDate
      ? { date: av.dueDate, proximity: left! < 0 ? "overdue" : left! <= 3 ? "due-soon" : "default" }
      : undefined,
    urgency: av.urgency,
    type: av.type,
    status: av.step ? { custom: stageLabel(av) } : { status: av.status },
    members: membersOf(av),
    lastUpdated: updatedLabel(av),
    multipart: multipartOf(av, all),
  };
}

/**
 * An Added Value's life: from the day it was initiated to the day it was completed or rejected (its history's
 * date, else its due date, else its last update); an open one is still live. It is in a period's filter when
 * that life overlaps the period, not by its due or start date alone (the user, 10 Nov 2026).
 */
function lifeOf(av: AddedValue): { start: string; end?: string } {
  if (av.status !== "Completed" && av.status !== "Rejected") return { start: av.dateInitiated };
  const closed = [...av.history].reverse().find((h) => h.to === av.status);
  const when = typeof closed?.when === "string" ? closed.when.match(/^(\d{2})\/(\d{2})\/(\d{4})$/) : null;
  return { start: av.dateInitiated, end: when ? `${when[3]}-${when[2]}-${when[1]}` : (av.dueDate ?? av.updatedAt.slice(0, 10)) };
}
const liveDuring = (av: AddedValue, start: string, end: string) => {
  const life = lifeOf(av);
  return life.start <= end && (life.end === undefined || life.end >= start);
};

/* Quick picks for the Date field, from the prototype's today (05/11/2026). The prototype's, not Figma's. */
const PERIODS = [
  { label: "This month", value: `${TODAY.slice(0, 7)}-01`, rangeEnd: new Date(Date.UTC(Number(TODAY.slice(0, 4)), Number(TODAY.slice(5, 7)), 0)).toISOString().slice(0, 10) },
  {
    label: "Last month",
    value: new Date(Date.UTC(Number(TODAY.slice(0, 4)), Number(TODAY.slice(5, 7)) - 2, 1)).toISOString().slice(0, 10),
    rangeEnd: new Date(Date.UTC(Number(TODAY.slice(0, 4)), Number(TODAY.slice(5, 7)) - 1, 0)).toISOString().slice(0, 10),
  },
];

/** Figma's Assignee list starts with "Unassigned". */
const UNASSIGNED = "__unassigned";
/* "All priorities": its own value, since `""` is the field's placeholder. */
const ALL = "__all";

const compare: Record<string, (a: AddedValue, b: AddedValue) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  due: (a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"),
  lastUpdated: (a, b) => a.updatedAt.localeCompare(b.updatedAt),
};

/**
 * A list screen of Added Values — Assigned, Manage, the Archive pages — as
 * Figma draws them: the page title, the filter row, and AVTable. Each row's
 * reference opens the AV's page.
 */
export function AVListScreen({
  active,
  title,
  include,
  empty,
  emptyAction,
  bulk,
  omit = [],
}: {
  active: string;
  title: string;
  /** Which AVs this list shows. */
  include: (av: AddedValue) => boolean;
  empty: { title: string; description: string };
  /** Under the empty state when there's nothing yet (not when filters hide everything). */
  emptyAction?: React.ReactNode;
  /** Row checkboxes and the bulk bar (AV · 09). */
  bulk?: boolean;
  /**
   * Filters that make no sense on this list (decided 10 Nov 2026: every list has Manage's filters and pages,
   * less these): Status where every row has one status, Assignee on your own Assigned list, Initiator on your
   * Drafts.
   */
  omit?: readonly ("status" | "assignee" | "initiator")[];
}) {
  const router = useRouter();
  const { avs } = useAddedValues();
  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<DataTableSort>({ key: "lastUpdated", direction: "desc" });
  const [selected, setSelected] = React.useState<string[]>([]);
  const [priority, setPriority] = React.useState("");
  const [tags, setTags] = React.useState<string[]>([]);
  const [period, setPeriod] = React.useState<{ start?: string; end?: string }>({});
  const [assignee, setAssignee] = React.useState("");
  const [initiator, setInitiator] = React.useState("");
  const [page, setPage] = React.useState(1);
  /* Real data starts at 50 a page (Figma, decided 10 Nov 2026); the prototype starts at 10 so its few AVs still show the pages. */
  const [pageSize, setPageSize] = React.useState(10);

  /* AV · 09: when the selection empties the bulk bar goes, and the button in it that had focus. Focus goes to the
     table's select-all checkbox, or to the search box when the list is left empty and has none to offer. */
  const listRef = React.useRef<HTMLDivElement>(null);
  const afterBulk = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    const list = listRef.current;
    afterBulk.current =
      list?.querySelector<HTMLElement>('input[aria-label="Select all rows"]:not(:disabled)') ?? list?.querySelector<HTMLElement>('input[type="search"]') ?? null;
  });

  const mine = avs.filter(include);
  const statusOptions = [...new Set(mine.map(stageLabel))];
  const q = search.trim().toLowerCase();
  const all = mine
    .filter((av) => !q || av.title.toLowerCase().includes(q) || av.ref.toLowerCase().includes(q))
    .filter((av) => !statuses.length || statuses.includes(stageLabel(av)))
    .filter((av) => !priority || priority === ALL || av.urgency === priority)
    .filter((av) => !tags.length || tags.some((t) => av.tags.includes(t)))
    /* Date (decided 10 Nov 2026): the Added Values that were live during the period picked. */
    .filter((av) => !period.start || liveDuring(av, period.start, period.end ?? period.start))
    .filter((av) => !assignee || (assignee === UNASSIGNED ? !av.assignees.length : av.assignees.some((a) => a.name === assignee)))
    .filter((av) => !initiator || isInitiator(av, initiator))
    .sort((a, b) => compare[sort.key](a, b) * (sort.direction === "asc" ? 1 : -1));
  const pageCount = Math.max(Math.ceil(all.length / pageSize), 1);
  const shownPage = Math.min(page, pageCount);
  const rows = all.slice((shownPage - 1) * pageSize, shownPage * pageSize).map((av) => toRow(av, avs));
  const filtered = !!q || statuses.length > 0 || (!!priority && priority !== ALL) || tags.length > 0 || !!period.start || !!assignee || !!initiator;
  /* Every filter change starts again from page 1. */
  const filter = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const people = (pick: (av: AddedValue) => string[]) =>
    [...new Set(mine.flatMap(pick))].sort().map((name) => ({ value: name, label: name }));

  const filterBar = (
    <FilterBar
      search={search}
      onSearchChange={filter(setSearch)}
      {...(!omit.includes("status") && { status: { options: statusOptions, value: statuses, onChange: filter(setStatuses) } })}
      {...{
        priority: {
          options: [{ value: ALL, label: "All priorities" }, ...["Urgent", "High", "Normal", "Low"].map((u) => ({ value: u, label: u }))],
          value: priority,
          onChange: filter(setPriority),
          placeholder: "Search priority",
        },
        tags: { options: [...new Set(mine.flatMap((av) => av.tags))].sort(), value: tags, onChange: filter(setTags), placeholder: "Select tags" },
        period: { value: period, onChange: filter(setPeriod), placeholder: "Select period", presets: PERIODS },
        users: [
          ...(omit.includes("assignee")
            ? []
            : [
                {
                  label: "Assignee",
                  placeholder: "Select User",
                  options: [{ value: UNASSIGNED, label: "Unassigned" }, ...people((av) => av.assignees.map((a) => a.name))],
                  value: assignee,
                  onChange: filter(setAssignee),
                },
              ]),
          ...(omit.includes("initiator")
            ? []
            : [{ label: "Initiator", placeholder: "Select User", options: people((av) => av.initiators), value: initiator, onChange: filter(setInitiator) }]),
        ],
      }}
      onReset={() => {
        setSearch("");
        setStatuses([]);
        setPriority("");
        setTags([]);
        setPeriod({});
        setAssignee("");
        setInitiator("");
        setPage(1);
      }}
      resetLabel="Reset Filters"
    />
  );
  return (
    <Screen active={active} header={<PageTitle title={title} />}>
      <div className="flex flex-col gap-6 py-6">
        {/* Where a guided scenario's step points: see src/flows/types.ts. */}
        <div ref={listRef} data-flow-step="av-list">
          <AVTable
            rows={rows}
            sort={sort}
            onSortChange={setSort}
            onOpen={(row) => router.push(`/added-values/${row.id}`)}
            onOpenParent={(row) => {
              const parent = avs.find((x) => x.id === avs.find((a) => a.id === row.id)?.parent);
              if (parent) router.push(`/added-values/${parent.id}`);
            }}
            caption={title}
            {...(bulk ? { selectable: true, selected, onSelectedChange: setSelected } : {})}
            {...{
              /* Every list draws its filters in the table's card, as Manage does (Figma 940:167946). */
              filters: filterBar,
              page: shownPage,
              pageCount,
              onPageChange: setPage,
              itemCount: all.length,
              pageSize,
              pageSizeOptions: [10, 25, 50, 100],
              onPageSizeChange: (size: number) => {
                setPageSize(size);
                setPage(1);
              },
            }}
            empty={
              <EmptyState
                headingLevel={2}
                icon={<Icon name={filtered ? "magnifying-glass" : "file"} size="lg" />}
                title={filtered ? "No Added Values match these filters" : empty.title}
                description={filtered ? "Try another search, or reset the filters." : empty.description}
                action={filtered ? undefined : emptyAction}
              />
            }
          />
        </div>
        {/* Mounted while the list is, so its failure summary outlives the cleared selection. */}
        {bulk && <BulkActions selected={avs.filter((av) => selected.includes(av.id))} onClear={() => setSelected([])} returnFocusRef={afterBulk} />}
      </div>
    </Screen>
  );
}
