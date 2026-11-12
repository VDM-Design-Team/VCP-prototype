"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CycleBurndown,
  CyclePerformance,
  CycleSummary,
  DashboardFilters,
  DashboardHeader,
  DomainBudgetSummary,
  InCaseYouMissedIt,
  PageTitle,
  SprintMetrics,
  StatCard,
  TeamCapacity,
  UserCapacity,
  ValueCards,
  formatDateRange,
  useToast,
  type Quarter,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { Panel } from "@/components/panel";
import { useAddedValues } from "@/components/av-store";
import { useNotifications } from "@/components/notification-store";
import { useShellState } from "@/components/shell-state";
import { missedFor, stateKey } from "@/data/missed";
import { DOMAINS } from "@/data/added-values";
import { useBudgets } from "@/components/budget-store";
import { CURRENT, YEARS, consumedFor, periodOf, quarterKey } from "@/data/budgets";
import { useHolidays } from "@/components/holiday-store";
import { CYCLES } from "@/data/gantt";
import { CURRENT_CYCLE } from "@/data/planning";
import {
  TEAMS,
  WHOSE,
  burndown,
  cycleById,
  cyclePerformance,
  cycleSummary,
  sprintMetrics,
  teamCapacity,
  userCapacity,
  valueCards,
  type TeamId,
  type Whose,
} from "@/data/dashboard";

const VIEWS = [
  { value: "cycle", label: "Cycle" },
  { value: "quarter", label: "Quarter" },
];
/** A cycle option: "C37 (21/07/2026 - 03/08/2026)", dates as everywhere (Figma writes "Jul 20, 2026"). */
const cycleOption = (c: (typeof CYCLES)[number]) => ({ value: c.id, label: `${c.short} (${formatDateRange(c.start, c.end)})` });
const CYCLE_YEARS = [...new Set(CYCLES.map((c) => c.start.slice(0, 4)))].sort().reverse();

/* A user's dashboard (an admin's is Admin · 02, below): the Value Cards, "In Case You Missed it" (Activity · 03; Figma 1552:13937, placed
   under the Value Cards as on the admin dashboard 951:370905), then recent activity. Sample data. */
export default function DashboardScreen() {
  const router = useRouter();
  const { avs } = useAddedValues();
  const { dismissed, dismiss, undoDismiss } = useNotifications();
  const { role, domain, dashboardView, setDashboardView } = useShellState();
  const { holidays } = useHolidays();
  const domainValue: string = DOMAINS.find((d) => d.name === domain)?.value ?? "development";
  const { toast } = useToast();
  /* Admin · 01: the budget of the domain picked in the rail's switcher (Figma 696:55584), with the super admin's note. */
  const { budgets } = useBudgets();
  const [budgetQ, setBudgetQ] = React.useState<{ year: number; quarter: Quarter }>(CURRENT);
  const budgetKey = quarterKey(budgetQ.year, budgetQ.quarter);
  const keyOf = (id: string) => {
    const av = avs.find((a) => a.id === id);
    return av ? stateKey(av) : "";
  };
  /* Decided 9 Nov 2026: a dismissed card stays away until its AV's status or due date changes. */
  /* An admin's strip is their domain's (decided 10 Nov 2026: the switcher picks the lists). */
  const missed = missedFor(role === "admin" ? avs.filter((av) => av.domain === domainValue) : avs, role !== "user").filter(
    (item) => !dismissed.some((d) => d.id === item.id && d.key === keyOf(item.id)),
  );
  /* Undo brings the card back; the toast's button goes with the toast, so focus goes to the card. */
  const restore = (id: string, title: string) => {
    undoDismiss(id);
    window.setTimeout(() => {
      [...document.querySelectorAll<HTMLElement>('[data-flow-step="icymi"] button')]
        .find((b) => !b.getAttribute("aria-label") && b.textContent?.includes(title))
        ?.focus();
    }, 100);
  };
  /* Admin · 02: the Development admin's dashboard (Figma 947:304368), Cycle or Quarter. */
  const [cycleId, setCycleId] = React.useState(CURRENT_CYCLE.id);
  const [team, setTeam] = React.useState<TeamId>("all");
  /* Figma draws "Assigned" chosen. */
  const [whose, setWhose] = React.useState<Whose>("Assigned");
  const [perf, setPerf] = React.useState<{ team: TeamId; year: number; quarter: Quarter }>({ team: "all", ...CURRENT });
  const cycleYear = cycleById(cycleId).start.slice(0, 4);

  const strip = (
    /* Where a guided scenario's step points (Activity · 03): see src/flows/types.ts. */
    <div className="pb-6" data-flow-step="icymi">
      <InCaseYouMissedIt
        items={missed}
        onOpen={(item) => router.push(`/added-values/${item.id}`)}
        onDismiss={(item) => {
          dismiss(item.id, keyOf(item.id));
          toast({
            tone: "info",
            title: "Dismissed",
            description: `${item.title} comes back if its status or due date changes.`,
            actionLabel: "Undo",
            onAction: () => restore(item.id, item.title),
          });
        }}
      />
    </div>
  );

  if (role === "admin") {
    /* Only Development plans in cycles (Planning · 02); another domain's dashboard is its budget, its Value
       Cards and the strip (Figma's Design Admin dashboard page is empty: the prototype's rule). */
    const dev = domainValue === "development";
    const view = dev ? dashboardView : "quarter";
    const budget = (
      /* Where a guided scenario's step points (Admin · 01): see src/flows/types.ts. */
      <div className="pb-6" data-flow-step="budget-card">
        <DomainBudgetSummary
          allocated={budgets[budgetKey]?.[domainValue]?.allocated ?? 0}
          consumed={consumedFor(domainValue, budgetKey, avs)}
          note={budgets[budgetKey]?.[domainValue]?.notes}
          quarter={budgetQ.quarter}
          year={budgetQ.year}
          years={YEARS}
          period={periodOf(budgetQ.year, budgetQ.quarter)}
          onQuarterChange={(quarter) => setBudgetQ((b) => ({ ...b, quarter }))}
          onYearChange={(year) => setBudgetQ((b) => ({ ...b, year }))}
          onGoToCurrent={() => setBudgetQ(CURRENT)}
        />
      </div>
    );
    const cards = (
      <div className="pb-6" data-flow-step="value-cards">
        <ValueCards
          items={valueCards(avs, domainValue, whose)}
          filter={{ label: "Whose Added Values", value: whose, options: [...WHOSE], onChange: (v) => setWhose(v as Whose) }}
        />
      </div>
    );
    const summary = cycleSummary(avs, cycleId, team, holidays);
    const capacity = teamCapacity(avs, cycleId, team);
    const burn = burndown(avs, cycleId, team, holidays);
    return (
      <Screen
        active="dashboard"
        header={
          <div data-flow-step="dashboard-header">
            <DashboardHeader
              views={dev ? VIEWS : undefined}
              view={view}
              onViewChange={(v) => setDashboardView(v as "cycle" | "quarter")}
              filters={
                dev && view === "cycle" ? (
                  <DashboardFilters
                    filters={[
                      {
                        key: "cycle",
                        label: "Cycle",
                        value: cycleId,
                        options: CYCLES.filter((c) => c.start.startsWith(cycleYear)).map(cycleOption),
                        onChange: setCycleId,
                        searchable: true,
                        searchPlaceholder: "Search...",
                      },
                      {
                        key: "year",
                        label: "Year",
                        value: cycleYear,
                        options: CYCLE_YEARS,
                        /* A year's first cycle, or the running one in this year. */
                        onChange: (y) => setCycleId(CURRENT_CYCLE.start.startsWith(y) ? CURRENT_CYCLE.id : CYCLES.find((c) => c.start.startsWith(y))!.id),
                      },
                      { key: "team", label: "Team", value: team, options: TEAMS.map((t) => ({ value: t.value, label: t.label })), onChange: (v) => setTeam(v as TeamId) },
                    ]}
                    resetLabel="Reset Filters"
                    onReset={() => {
                      setCycleId(CURRENT_CYCLE.id);
                      setTeam("all");
                    }}
                    exportLabel="Export Cycle Report"
                    exportOptions={[
                      { key: "pdf", label: "PDF (.pdf)" },
                      { key: "csv", label: "CSV (.csv)" },
                    ]}
                    /* No file in the prototype: the toast says what the file would hold (decided 10 Nov 2026). */
                    onExport={(key) => {
                      const c = cycleById(cycleId).short;
                      const who = TEAMS.find((t) => t.value === team)!.label;
                      toast({
                        tone: "success",
                        title: "Cycle Report exported",
                        description:
                          key === "csv"
                            ? `CSV: one row per Added Value in ${c} (${who}), with its status, points, assignees and dates.`
                            : `PDF: the ${c} dashboard as shown, for ${who}.`,
                      });
                    }}
                  />
                ) : undefined
              }
            />
          </div>
        }
      >
        <div className="flex flex-col pt-6">
          {view === "cycle" ? (
            <>
              <div className="pb-6" data-flow-step="cycle-summary">
                <CycleSummary
                  committed={summary.committed}
                  completed={summary.completed}
                  carriedOver={summary.carriedOver}
                  completion={summary.completion}
                  /* A running cycle is measured against the even burn to date (decided 10 Nov 2026). */
                  completionLabel={summary.running ? "Of plan to date" : "Completion"}
                />
              </div>
              {cards}
              {strip}
              <div className="pb-6" data-flow-step="team-capacity">
                <TeamCapacity
                  segments={capacity.segments}
                  remaining={capacity.remaining}
                  hint="The team's points this cycle by where they stand, and what's left of its Total Capacity, the Planning List's for the cycle."
                />
              </div>
              <div className="pb-6" data-flow-step="user-capacity">
                <UserCapacity
                  members={userCapacity(avs, cycleId, team, holidays)}
                  hint="Each person's points this cycle, their leave from the Holiday Registry, and what's left."
                />
              </div>
              <div className="pb-6" data-flow-step="sprint-metrics">
                <SprintMetrics data={sprintMetrics(avs, cycleId, team)} description={`Current: ${cycleById(cycleId).short}`} />
              </div>
              <div className="pb-6" data-flow-step="burndown">
                <CycleBurndown
                  data={burn.data}
                  stats={burn.stats}
                  /* No Available line: a burndown is what's left, not what's free. */
                  series={["completed", "committed", "overdue"]}
                  hint="What's left of the cycle's points each working day, against an even burn to zero."
                />
              </div>
            </>
          ) : (
            <>
              {budget}
              {cards}
              {dev ? (
                <div className="pb-6" data-flow-step="cycle-performance">
                  <CyclePerformance
                    data={cyclePerformance(avs, perf.year, perf.quarter, perf.team)}
                    filters={[
                      { key: "team", label: "Show", value: perf.team, options: TEAMS.map((t) => ({ value: t.value, label: t.value === "all" ? "All" : t.label })), onChange: (v) => setPerf((p) => ({ ...p, team: v as TeamId })) },
                      { key: "quarter", label: "Quarter", value: `Q${perf.quarter}`, options: ["Q1", "Q2", "Q3", "Q4"], onChange: (v) => setPerf((p) => ({ ...p, quarter: Number(v.slice(1)) as Quarter })) },
                      { key: "year", label: "Year", value: String(perf.year), options: CYCLE_YEARS, onChange: (v) => setPerf((p) => ({ ...p, year: Number(v) })) },
                    ]}
                  />
                </div>
              ) : (
                strip
              )}
            </>
          )}
        </div>
      </Screen>
    );
  }

  return (
    <Screen
      active="dashboard"
      header={<PageTitle title="Dashboard" subtitle="Everything you own, and everything waiting on you." />}
    >
      <div className="flex flex-wrap gap-4 py-6">
        <StatCard className="flex-1" label="Completed" value="12" accent="success" />
        <StatCard className="flex-1" label="In Review" value="6" accent="brand" />
        <StatCard className="flex-1" label="Overdue" value="3" accent="critical" />
        <StatCard className="flex-1" label="In Progress" value="8" accent="brand" />
        <StatCard className="flex-1" label="Pending" value="4" accent="yellow" />
        <StatCard className="flex-1" label="Draft" value="5" accent="neutral" />
      </div>
      {strip}
      <Panel title="Recent activity">Nothing yet this cycle.</Panel>
    </Screen>
  );
}
