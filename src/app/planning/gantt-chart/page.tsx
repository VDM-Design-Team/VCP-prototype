"use client";

import * as React from "react";
import { GanttChart, type GanttView } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { CYCLES, PROJECTS, TASKS, TODAY, USERS } from "@/data/gantt";

/* Planning → Gantt Chart (Admin). Figma "VCP Pages - Flows", page Gantt Chart
   (1006:25630): the cycle, month and year views, the bar tooltip, and the
   project and user filters, which regroup the rows. The chart is the whole
   page — it carries its own title — so there is no title band above it. */
export default function GanttChartScreen() {
  const [view, setView] = React.useState<GanttView>("cycle");
  const [date, setDate] = React.useState(TODAY);
  const [projectIds, setProjectIds] = React.useState<string[]>([]);
  const [userIds, setUserIds] = React.useState<string[]>([]);

  return (
    <Screen active="planning/gantt-chart">
      <div className="py-6">
        <GanttChart
          title="Gantt Chart"
          infoText="Each bar is an Added Value, from its start to its due date. A closed row sums up a person's work; open it to see each task and their availability. Pick projects to group the rows by project. The hatched column is today."
          tasks={TASKS}
          users={USERS}
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
