"use client";

import * as React from "react";
import { Field, FilterBar, Select, TaskLogPage } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { CYCLES } from "@/data/gantt";
import { TASK_LOG } from "@/data/task-log";

/* The Task Log Trail (DS 2.0 `TaskLogPage`, Figma `Task_Log_Trail`): every change made to an Added Value, newest
   first, with the DS's filters inside the table's card (search, the period, which field changed, and one Reset).
   Sample data; it doesn't follow the moves made in a scenario. */
const PAGE_SIZE = 10;
const PERIODS = CYCLES.filter((c) => c.start.startsWith("2026")).map((c) => ({ label: c.label, value: c.start, rangeEnd: c.end }));
const FIELDS = [{ value: "", label: "All Changes" }, "Status", "Workflow", "Assignee", "Start Date", "Due Date"];

export default function TaskLogScreen() {
  const [search, setSearch] = React.useState("");
  const [field, setField] = React.useState("");
  const [period, setPeriod] = React.useState<{ start?: string; end?: string }>({});
  const [page, setPage] = React.useState(1);

  const q = search.trim().toLowerCase();
  const all = TASK_LOG.filter((r) => {
    const day = r.changedAt.slice(0, 10);
    return (
      (!q || `${r.task} ${r.ref}`.toLowerCase().includes(q)) &&
      (!field || r.change.field === field) &&
      (!period.start || day >= period.start) &&
      (!period.end || day <= period.end)
    );
  });
  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  /* Any filter change starts again at page 1. */
  const narrow = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  return (
    <Screen
      active="task-log"
      /* DS 2.0's TaskLogPage is the whole page, title first, with its own 32 at the sides: it goes where the shell
         takes the title band, not in the body (inset 32 already), as the Domain Budget page does. */
      header={
        <TaskLogPage
          data-flow-step="task-log"
          table={{
            rows: all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
            page: current,
            pageCount,
            onPageChange: setPage,
            itemCount: all.length,
            pageSize: PAGE_SIZE,
            filtered: Boolean(q || field || period.start || period.end),
            caption: "Task log trail",
            filters: (
              <FilterBar
                search={search}
                onSearchChange={narrow(setSearch)}
                period={{ value: period, onChange: narrow(setPeriod), presets: PERIODS }}
                onReset={() => {
                  setSearch("");
                  setField("");
                  setPeriod({});
                  setPage(1);
                }}
              >
                {/* A field of the page's own, labelled above and on the lighter filter edge, as the bar's own are. */}
                <Field label="Change" className="min-w-0">
                  <Select edge="neutral" emphasis="regular" fullWidth options={FIELDS} value={field} onChange={narrow(setField)} />
                </Field>
              </FilterBar>
            ),
          }}
        />
      }
    >
      {null}
    </Screen>
  );
}
