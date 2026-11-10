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
import { stageLabel, updatedLabel, type AddedValue } from "@/data/added-values";

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY);
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

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

/** Members, as Figma's Manage table lists them: the initiator first, then the assignees; someone who is both says so. */
function membersOf(av: AddedValue): NonNullable<AVTableRow["members"]> {
  const assignees = av.assignees.map((a) => a.name);
  const people = [av.initiator, ...assignees.filter((n) => n !== av.initiator)];
  return people.map((name) => ({
    name,
    domain: homeDomain(name),
    role: name === av.initiator ? (assignees.includes(name) ? "Initiator, Assignee" : "Initiator") : "Assignee",
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
      ? { label: formatDate(av.dueDate), proximity: left! < 0 ? "overdue" : left! <= 3 ? "due-soon" : "default" }
      : undefined,
    urgency: av.urgency,
    type: av.type,
    status: av.step ? { custom: stageLabel(av) } : { status: av.status },
    members: membersOf(av),
    lastUpdated: updatedLabel(av),
    multipart: multipartOf(av, all),
  };
}

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
  manage,
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
   * Manage's extras (Admin · 03, Figma 940:167946): Priority, Tags, Date, Assignee and Initiator filters, and
   * pages with the Items select.
   */
  manage?: boolean;
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
  /* The prototype's default is 10 a page, so its few AVs still show the pages (Figma's default is 50). */
  const [pageSize, setPageSize] = React.useState(10);

  const mine = avs.filter(include);
  const statusOptions = [...new Set(mine.map(stageLabel))];
  const q = search.trim().toLowerCase();
  const all = mine
    .filter((av) => !q || av.title.toLowerCase().includes(q) || av.ref.toLowerCase().includes(q))
    .filter((av) => !statuses.length || statuses.includes(stageLabel(av)))
    .filter((av) => !priority || priority === ALL || av.urgency === priority)
    .filter((av) => !tags.length || tags.some((t) => av.tags.includes(t)))
    /* Date: the due date in the period picked (the prototype's reading of Figma's "Select period"). */
    .filter((av) => !period.start || (!!av.dueDate && av.dueDate >= period.start && av.dueDate <= (period.end ?? period.start)))
    .filter((av) => !assignee || (assignee === UNASSIGNED ? !av.assignees.length : av.assignees.some((a) => a.name === assignee)))
    .filter((av) => !initiator || av.initiator === initiator)
    .sort((a, b) => compare[sort.key](a, b) * (sort.direction === "asc" ? 1 : -1));
  const pageCount = Math.max(Math.ceil(all.length / pageSize), 1);
  const shownPage = Math.min(page, pageCount);
  const rows = (manage ? all.slice((shownPage - 1) * pageSize, shownPage * pageSize) : all).map((av) => toRow(av, avs));
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
      status={{ options: statusOptions, value: statuses, onChange: filter(setStatuses) }}
      {...(manage && {
        priority: {
          options: [{ value: ALL, label: "All priorities" }, ...["Urgent", "High", "Normal", "Low"].map((u) => ({ value: u, label: u }))],
          value: priority,
          onChange: filter(setPriority),
          placeholder: "Search priority",
        },
        tags: { options: [...new Set(mine.flatMap((av) => av.tags))].sort(), value: tags, onChange: filter(setTags), placeholder: "Select tags" },
        period: { value: period, onChange: filter(setPeriod), placeholder: "Select period" },
        users: [
          {
            label: "Assignee",
            placeholder: "Select User",
            options: [{ value: UNASSIGNED, label: "Unassigned" }, ...people((av) => av.assignees.map((a) => a.name))],
            value: assignee,
            onChange: filter(setAssignee),
          },
          { label: "Initiator", placeholder: "Select User", options: people((av) => [av.initiator]), value: initiator, onChange: filter(setInitiator) },
        ],
      })}
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
        {/* Manage draws its filters in the table's card (Figma 940:167946); the other lists, above it. */}
        {!manage && filterBar}
        {/* Where a guided scenario's step points: see src/flows/types.ts. */}
        <div data-flow-step="av-list">
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
            {...(manage && {
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
            })}
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
        {bulk && <BulkActions selected={avs.filter((av) => selected.includes(av.id))} onClear={() => setSelected([])} />}
      </div>
    </Screen>
  );
}
