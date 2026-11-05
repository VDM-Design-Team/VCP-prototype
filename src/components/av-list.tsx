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
import { useAddedValues } from "./av-store";
import { TODAY } from "@/data/gantt";
import { stageLabel, updatedLabel, type AddedValue } from "@/data/added-values";

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY);
const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** One AV as AVTable draws it. */
function toRow(av: AddedValue): AVTableRow {
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
    members: (av.assignees.length ? av.assignees.map((a) => a.name) : [av.initiator]) as string[],
    lastUpdated: updatedLabel(av),
  };
}

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
}: {
  active: string;
  title: string;
  /** Which AVs this list shows. */
  include: (av: AddedValue) => boolean;
  empty: { title: string; description: string };
}) {
  const router = useRouter();
  const { avs } = useAddedValues();
  const [search, setSearch] = React.useState("");
  const [statuses, setStatuses] = React.useState<string[]>([]);
  const [sort, setSort] = React.useState<DataTableSort>({ key: "lastUpdated", direction: "desc" });

  const mine = avs.filter(include);
  const statusOptions = [...new Set(mine.map(stageLabel))];
  const q = search.trim().toLowerCase();
  const rows = mine
    .filter((av) => !q || av.title.toLowerCase().includes(q) || av.ref.toLowerCase().includes(q))
    .filter((av) => !statuses.length || statuses.includes(stageLabel(av)))
    .sort((a, b) => compare[sort.key](a, b) * (sort.direction === "asc" ? 1 : -1))
    .map(toRow);
  const filtered = !!q || statuses.length > 0;

  return (
    <Screen active={active} header={<PageTitle title={title} />}>
      <div className="flex flex-col gap-6 py-6">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          status={{ options: statusOptions, value: statuses, onChange: setStatuses }}
          onReset={() => {
            setSearch("");
            setStatuses([]);
          }}
          resetLabel="Reset Filters"
        />
        <AVTable
          rows={rows}
          sort={sort}
          onSortChange={setSort}
          onOpen={(row) => router.push(`/added-values/${row.id}`)}
          caption={title}
          empty={
            <EmptyState
              headingLevel={2}
              icon={<Icon name={filtered ? "magnifying-glass" : "file"} size="lg" />}
              title={filtered ? "No Added Values match these filters" : empty.title}
              description={filtered ? "Try another search, or reset the filters." : empty.description}
            />
          }
        />
      </div>
    </Screen>
  );
}
