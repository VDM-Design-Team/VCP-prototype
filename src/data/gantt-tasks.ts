import type { GanttStatus, GanttTask, GanttUser } from "@vdm-design-team/vcp-design-system";
import { stageLabel, type AddedValue } from "./added-values";
import { PEOPLE, PROJECTS, TODAY } from "./gantt";

/* The Gantt Chart reads the Added Values (Planning · 01, decided 9 Nov 2026):
   one bar per assignee of every AV that is scheduled (a start and a due date)
   and under way or done, linking to that AV's page. So a change on an AV —
   its status, its dates, its assignees — shows on the chart. */

const SCHEDULED = new Set(["Accepted", "In Progress", "Review", "Completed"]);
/** Steps past the build: delivered, waiting to go live. */
const PRE_DELIVERED = new Set(["ready-for-deploy", "confirmed-prod"]);

function ganttStatus(av: AddedValue): GanttStatus {
  if (av.status === "Completed") return "completed";
  if (av.step && PRE_DELIVERED.has(av.step)) return "pre-delivered";
  if (av.dueDate! < TODAY) return "overdue";
  if (av.status === "Accepted") return "planned";
  return "in-progress";
}

export function ganttTasks(avs: readonly AddedValue[]): GanttTask[] {
  return avs.flatMap((av) => {
    if (!av.startDate || !av.dueDate || !SCHEDULED.has(av.status)) return [];
    const projectId = PROJECTS.find((p) => p.name === av.project)?.id;
    if (!projectId) return [];
    return av.assignees.flatMap((a) => {
      const user = PEOPLE.find((p) => p.name === a.name);
      if (!user) return [];
      return [
        {
          id: `${av.id}:${user.id}`,
          userId: user.id,
          projectId,
          title: av.title,
          status: ganttStatus(av),
          statusLabel: stageLabel(av),
          initiator: av.initiators.join(", "),
          points: a.points ?? 0,
          start: av.startDate!,
          end: av.dueDate!,
          href: `/added-values/${av.id}`,
        },
      ];
    });
  });
}

const DAY = 86_400_000;
const dayOf = (iso: string) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY);
const isoOf = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);

/* Each person's panel figures, worked out from their bars so the numbers on
   screen agree with them: WIP is what is under way (overdue included),
   EAD the day after their last open task ends. */
export function ganttUsers(tasks: readonly GanttTask[]): GanttUser[] {
  const today = dayOf(TODAY);
  return PEOPLE.map((person) => {
    const mine = tasks.filter((t) => t.userId === person.id);
    const open = mine.filter((t) => t.status !== "completed");
    const free = Math.max(today, ...open.map((t) => dayOf(t.end) + 1));
    return {
      ...person,
      wip: mine.filter((t) => t.status === "in-progress" || t.status === "overdue").length,
      planned: mine.filter((t) => t.status === "planned").length,
      ead: isoOf(free),
      eadTd: free - today,
    };
  });
}
