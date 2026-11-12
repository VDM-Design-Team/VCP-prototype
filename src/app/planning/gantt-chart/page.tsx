"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GanttChart, type GanttView } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useAddedValues } from "@/components/av-store";
import { CYCLES, PROJECTS, TODAY } from "@/data/gantt";
import { ganttTasks, ganttUsers } from "@/data/gantt-tasks";

/* Planning → Gantt Chart (Admin). Figma "VCP Pages - Flows", page Gantt Chart
   (1006:25630): the cycle, month and year views, the bar tooltip, and the
   project and user filters, which regroup the rows. The chart is the whole
   page — it carries its own title — so there is no title band above it.
   Each bar is an Added Value and links to its page (Planning · 01). */
export default function GanttChartScreen() {
  const router = useRouter();
  const { avs } = useAddedValues();
  const tasks = React.useMemo(() => ganttTasks(avs), [avs]);
  const users = React.useMemo(() => ganttUsers(tasks), [tasks]);
  const [view, setView] = React.useState<GanttView>("cycle");
  const [date, setDate] = React.useState(TODAY);
  const [projectIds, setProjectIds] = React.useState<string[]>([]);
  const [userIds, setUserIds] = React.useState<string[]>([]);

  /* A bar is a real link (it opens in a new tab with a modifier). A plain
     click stays in the app, so the prototype keeps its state. */
  const openInApp = (e: React.MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = (e.target as Element).closest("a")?.getAttribute("href");
    if (!href?.startsWith("/")) return;
    e.preventDefault();
    router.push(href);
  };

  return (
    <Screen active="planning/gantt-chart">
      {/* Where a guided scenario's step points (Planning · 01): see src/flows/types.ts. */}
      <div className="py-6" data-flow-step="gantt" onClick={openInApp}>
        <GanttChart
          title="Gantt Chart"
          infoText="Each bar is an Added Value, from its start to its due date; select it to open the Added Value. A closed row sums up a person's work; open it to see each task and their availability. Pick projects to group the rows by project. The hatched column is today."
          tasks={tasks}
          users={users}
          projects={PROJECTS}
          cycles={CYCLES}
          today={TODAY}
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          projectIds={projectIds}
          onProjectIdsChange={setProjectIds}
          userIds={userIds}
          onUserIdsChange={setUserIds}
        />
      </div>
    </Screen>
  );
}
