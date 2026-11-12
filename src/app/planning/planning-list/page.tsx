"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Banner,
  MoveAVToCycleModal,
  PageTitle,
  PlanningFilters,
  PlanningTable,
  formatCycleRange,
  formatDate,
  useToast,
  type DataTableSort,
  type MoveAVToCycleDraft,
  type MoveAVToCycleResult,
  type PlanningFiltersValue,
  type PlanningRow,
  type PlanningSection,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useAddedValues } from "@/components/av-store";
import { useHolidays } from "@/components/holiday-store";
import { useSettings } from "@/components/settings-store";
import { pointsIn } from "@/data/dashboard";
import { publicDays } from "@/data/holidays";
import { CYCLE_OPTIONS, stageLabel, type AddedValue } from "@/data/added-values";
import { CYCLES, PEOPLE, TODAY } from "@/data/gantt";
import {
  capacityOf,
  availability,
  cycleOf,
  cycleStart,
  estimateDue,
  estimateStart,
  freeFrom,
  inBacklog,
  inCycle,
  pointsOf,
  shownCycles,
} from "@/data/planning";

/* Planning → Planning List (Planning · 02). Figma "VCP Pages - Flows", Planning
   Page (147:9972): Development's cycles, each with its capacity, and the
   Backlog under them. Dragging a Backlog row onto a cycle plans it: Accepted,
   with its dates — its own, or the cycle's estimated ones — or, when it lacks
   an assignee or points, Add Required Details first (Assignee Availability,
   142:4943). Dates and points edit in place, and each recalculates the other. */

const NO_FILTERS: PlanningFiltersValue = { search: "", status: "", priority: "" };
type Field = "start" | "due";
const key = (id: string, field: Field) => `${id}:${field}`;
/** The assignee pill's date, dd/mm/yyyy as every date. */
const shortDate = (iso: string) => formatDate(iso);

export default function PlanningListScreen() {
  const router = useRouter();
  const { avs, get, moveTo, update } = useAddedValues();
  const { toast } = useToast();
  /* Leave and holidays come from the Holiday Registry (Planning · 03). */
  const { holidays } = useHolidays();
  /* Admin · 04 (decided 10 Nov 2026): a person's Capacity Points are the most they can take in one cycle;
     the Planning List warns when someone's work in an open cycle goes past it. */
  const { accounts } = useSettings();
  const daysOff = React.useMemo(() => publicDays(holidays), [holidays]);
  const [filters, setFilters] = React.useState(NO_FILTERS);
  const [sort, setSort] = React.useState<DataTableSort | undefined>();
  /* Dates this session just worked out: they play the table's animation once. */
  const [animated, setAnimated] = React.useState<ReadonlySet<string>>(new Set());
  const [details, setDetails] = React.useState<{ id: string; cycle: string } | null>(null);

  const animate = (id: string, ...fields: Field[]) =>
    setAnimated((s) => new Set([...s, ...fields.map((f) => key(id, f))]));

  const toRow = (av: AddedValue): PlanningRow => {
    const first = av.assignees[0];
    const points = pointsOf(av);
    return {
      id: av.id,
      ref: av.ref,
      title: av.title,
      urgency: av.urgency,
      type: av.type,
      /* The table has one Initiator column: the first of them. */
      initiator: { name: av.initiators[0] },
      ...(first && {
        assignee: {
          name: first.name,
          availability: availability(first.name, { start: av.startDate, end: av.dueDate }, avs, holidays, av.id),
        },
      }),
      ...(av.startDate && {
        start: { value: av.startDate, estimated: av.startEstimated, animated: animated.has(key(av.id, "start")) },
      }),
      ...(points > 0 && { points }),
      ...(av.dueDate && {
        due: { value: av.dueDate, estimated: av.dueEstimated, animated: animated.has(key(av.id, "due")) },
      }),
      status: av.step ? { custom: stageLabel(av) } : { status: av.status },
    };
  };

  const q = filters.search.trim().toLowerCase();
  const shown = (av: AddedValue) =>
    (!q || av.title.toLowerCase().includes(q) || av.ref.toLowerCase().includes(q)) &&
    (!filters.status || stageLabel(av) === filters.status) &&
    (!filters.priority || av.urgency === filters.priority);
  const order = (list: AddedValue[]) =>
    sort
      ? [...list].sort((a, b) => a.title.localeCompare(b.title) * (sort.direction === "asc" ? 1 : -1))
      : [...list].sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""));

  const overCap = shownCycles(avs)
    .filter((c) => c.end >= TODAY)
    .flatMap((c) =>
      accounts
        .filter((a) => a.capacityPoints != null && a.access.development?.access)
        .map((a) => ({ name: a.name, cycle: c.short ?? c.label, points: pointsIn(avs, c.id, a.name), cap: a.capacityPoints! }))
        .filter((o) => o.points > o.cap),
    );

  const overPeople = new Set(overCap.map((o) => o.name)).size;

  const sections: PlanningSection[] = [
    ...shownCycles(avs).map((c) => {
      const mine = avs.filter((av) => inCycle(av) && av.cycle === c.id);
      return {
        id: c.id,
        kind: "cycle" as const,
        title: c.label,
        dates: `(${formatCycleRange(c.start, c.end)})`,
        totalCapacity: capacityOf(c.id),
        remainingCapacity: capacityOf(c.id) - mine.reduce((sum, av) => sum + pointsOf(av), 0),
        /* A cycle that has ended takes no more work; its own late AVs can still move on (DS #335). */
        acceptsRows: c.end >= TODAY,
        rows: order(mine.filter(shown)).map(toRow),
      };
    }),
    {
      id: "backlog",
      kind: "backlog" as const,
      title: "Backlog",
      rows: (sort ? order(avs.filter(inBacklog).filter(shown)) : avs.filter(inBacklog).filter(shown).sort((a, b) => a.ref.localeCompare(b.ref))).map(toRow),
    },
  ];

  const statusOptions = [...new Set(avs.filter((av) => inCycle(av) || inBacklog(av)).map(stageLabel))];
  const cycleLabel = (id: string) => CYCLES.find((c) => c.id === id)?.label ?? id;

  const planned = (av: AddedValue, cycle: string, dropped: string) =>
    toast({
      tone: "success",
      title: `${av.ref} planned into ${cycleLabel(cycle)}`,
      description:
        cycle === dropped
          ? "It's Accepted, with its dates."
          : `Its Start Date is in ${cycleLabel(cycle)}, so it went there.`,
    });

  const moved = (av: AddedValue, to: string) =>
    toast({
      tone: "success",
      title: to === "backlog" ? `${av.ref} moved to the Backlog` : `${av.ref} moved to ${cycleLabel(to)}`,
      description: to === "backlog" ? "It's no longer planned." : "Its dates are estimated for that cycle.",
    });

  /* A row dragged onto a section, or sent there from its "Move … to…" button (DS #335): one handler. */
  const onMoveRow = (row: PlanningRow, from: PlanningSection, to: PlanningSection) => {
    const av = get(row.id);
    if (!av) return;
    const points = pointsOf(av);
    /* Back to the Backlog (decided 9 Nov 2026): no longer planned. It keeps its assignee and points. */
    if (to.kind === "backlog") {
      moveTo(av.id, "Backlog", { cycle: undefined });
      moved(av, "backlog");
      return;
    }
    /* Missing who or how much: Add Required Details asks (142:4943). */
    if (!av.assignees.length || points <= 0) {
      setDetails({ id: av.id, cycle: to.id });
      return;
    }
    /* From one cycle to another (decided): it keeps its status, with that cycle's estimated dates. */
    if (from.kind === "cycle") {
      const start = cycleStart(to.id, daysOff);
      update(av.id, { cycle: to.id, startDate: start, dueDate: estimateDue(start, points, daysOff), startEstimated: true, dueEstimated: true });
      animate(av.id, "start", "due");
      moved(av, to.id);
      return;
    }
    /* From the Backlog (Figma 1155:77276), with its own dates: it joins their cycle, shown on the page or
       not (1155:77333, 1155:77350). Dates in a cycle that has ended count as none (Figma doesn't say). */
    const own = av.startDate && av.dueDate ? cycleOf(av.startDate) : undefined;
    if (own && own.end >= TODAY) {
      moveTo(av.id, "Accepted", { cycle: own.id });
      planned(av, own.id, to.id);
      return;
    }
    /* No dates: the cycle's estimated ones, highlighted (1155:77293). */
    const start = cycleStart(to.id, daysOff);
    moveTo(av.id, "Accepted", {
      cycle: to.id,
      startDate: start,
      dueDate: estimateDue(start, points, daysOff),
      startEstimated: true,
      dueEstimated: true,
    });
    animate(av.id, "start", "due");
    planned(av, to.id, to.id);
  };

  /* The dialog opens from a drag, so it has no trigger to hand focus back to:
     focus goes to the AV's title wherever it is now (never to the page). */
  const focusRow = (ref: string) =>
    window.setTimeout(() => {
      const row = [...document.querySelectorAll<HTMLTableRowElement>('[data-flow-step="planning"] tbody tr')].find((r) =>
        r.cells[0]?.textContent?.startsWith(ref),
      );
      row?.querySelector<HTMLElement>("td:nth-child(2) button")?.focus();
    }, 50);
  const closeDetails = () => {
    if (detailsAV) focusRow(detailsAV.ref);
    setDetails(null);
  };

  const detailsAV = details ? get(details.id) : undefined;
  const people = (draft: MoveAVToCycleDraft) =>
    PEOPLE.map((p) => {
      const dates = { start: draft.start?.value, end: draft.due?.value };
      const free = freeFrom(p.name, dates, holidays);
      return {
        value: p.name,
        label: p.name,
        availability: availability(p.name, dates, avs, holidays, details?.id),
        ...(free && { until: shortDate(free) }),
      };
    });
  const estimate = (draft: MoveAVToCycleDraft) => {
    const start = draft.start && !draft.start.estimated ? draft.start.value : cycleStart(draft.cycle ?? details!.cycle, daysOff);
    const points = draft.points ?? draft.assignees.reduce((sum, a) => sum + (a.points ?? 0), 0);
    const anyone = draft.assignees.some((a) => a.person);
    return anyone && points > 0 ? { start, due: estimateDue(start, points, daysOff) } : { start };
  };
  const confirmDetails = (r: MoveAVToCycleResult) => {
    if (!detailsAV || !details) return;
    const cycle = r.cycle ?? (r.start ? cycleOf(r.start.value)?.id : undefined) ?? details.cycle;
    const change = {
      assignees: r.assignees.map((a) => ({ name: a.person, points: a.points })),
      capacityPoints: r.points,
      cycle,
      startDate: r.start?.value,
      dueDate: r.due?.value,
      startEstimated: !!r.start?.estimated,
      dueEstimated: !!r.due?.estimated,
    };
    /* From the Backlog it is Accepted; a planned AV moving cycles keeps its status. */
    if (detailsAV.status === "Backlog") moveTo(detailsAV.id, "Accepted", change);
    else update(detailsAV.id, change);
    animate(detailsAV.id, ...(["start", "due"] as Field[]).filter((f) => r[f]?.estimated));
    closeDetails();
    planned(detailsAV, cycle, details.cycle);
  };

  /* An edit can move the row to another cycle's table, which drops the focus
     with it: put it back on the same control in the row's new place. */
  const refocus = (label: string) =>
    /* After the picker has handed focus back to its pen — which may be the old, removed one. */
    window.setTimeout(() => {
      const el = document.activeElement;
      if (el && el !== document.body && el.isConnected) return;
      const named = (b: HTMLElement) => (b.getAttribute("aria-label") || b.title || b.textContent || "").trim() === label;
      [...document.querySelectorAll<HTMLElement>('[data-flow-step="planning"] tbody button')].find(named)?.focus();
    }, 200);

  /* In place: each date and the points recalculate the other date (the column hints). */
  const onStartChange = (row: PlanningRow, iso: string) => {
    const av = get(row.id)!;
    update(av.id, {
      startDate: iso,
      startEstimated: false,
      dueDate: estimateDue(iso, pointsOf(av), daysOff),
      dueEstimated: true,
      ...(av.status !== "Backlog" && { cycle: cycleOf(iso)?.id }),
    });
    animate(av.id, "due");
    refocus(`Change start date for ${av.ref}`);
  };
  const onDueChange = (row: PlanningRow, iso: string) => {
    const av = get(row.id)!;
    const start = estimateStart(iso, pointsOf(av), daysOff);
    update(av.id, {
      dueDate: iso,
      dueEstimated: false,
      startDate: start,
      startEstimated: true,
      ...(av.status !== "Backlog" && { cycle: cycleOf(start)?.id }),
    });
    animate(av.id, "start");
    refocus(`Change due date for ${av.ref}`);
  };
  const onPointsChange = (row: PlanningRow, points: number) => {
    const av = get(row.id)!;
    update(av.id, {
      capacityPoints: points,
      ...(av.assignees.length === 1 && { assignees: [{ ...av.assignees[0], points }] }),
      ...(av.startDate && { dueDate: estimateDue(av.startDate, points, daysOff), dueEstimated: true }),
    });
    if (av.startDate) animate(av.id, "due");
  };

  return (
    <Screen active="planning/planning-list" header={<PageTitle title="Planning List" />}>
      <div className="flex flex-col gap-6 py-6">
        <PlanningFilters
          value={filters}
          onChange={setFilters}
          statusOptions={statusOptions}
          onReset={() => setFilters(NO_FILTERS)}
        />
        {overCap.length > 0 && (
          <div data-flow-step="over-cap">
            <Banner tone="warning" title={overPeople === 1 ? "Someone is over their cap" : `${overPeople} people are over their cap`}>
              {overCap.map((o) => `${o.name}: ${o.points} of ${o.cap} points in ${o.cycle}`).join(" · ")}. A person&apos;s cap is their
              Capacity Points in Settings; move work to another cycle or person.
            </Banner>
          </div>
        )}
        {/* Where a guided scenario's step points (Planning · 02): see src/flows/types.ts. */}
        <div data-flow-step="planning" className="flex flex-col gap-6">
          <PlanningTable
            sections={sections}
            sort={sort}
            onSortChange={setSort}
            onOpen={(row) => router.push(`/added-values/${row.id}`)}
            onMoveRow={onMoveRow}
            moves="anywhere"
            canMove={(row) => get(row.id)?.status !== "Completed"}
            onStartChange={onStartChange}
            onDueChange={onDueChange}
            onPointsChange={onPointsChange}
            onAnimationDismiss={(row, field) =>
              setAnimated((s) => new Set([...s].filter((k) => k !== key(row.id, field))))
            }
            empty="No Added Values here."
          />
        </div>
      </div>
      {detailsAV && details && (
        <MoveAVToCycleModal
          key={detailsAV.id}
          open
          onClose={closeDetails}
          onConfirm={confirmDetails}
          onInvalid={(reason) => {
            if (reason === "unavailable-assignee")
              toast({
                tone: "critical",
                title: "Unavailable Assignee",
                description:
                  "A selected assignee is unavailable during the chosen dates. Please change the dates or remove this assignee before submitting.",
              });
          }}
          people={people}
          cycles={CYCLE_OPTIONS}
          initial={{
            start: { value: cycleStart(details.cycle, daysOff), estimated: true },
            cycle: details.cycle,
            ...(pointsOf(detailsAV) > 0 && { points: pointsOf(detailsAV) }),
          }}
          estimate={estimate}
        />
      )}
    </Screen>
  );
}
