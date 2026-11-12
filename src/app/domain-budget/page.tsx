"use client";

import * as React from "react";
import {
  BudgetTable,
  Button,
  Modal,
  PageTitle,
  SegmentedControl,
  Select,
  useToast,
  type BudgetRow,
  type Quarter,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useAddedValues } from "@/components/av-store";
import { useBudgets } from "@/components/budget-store";
import { useShellState } from "@/components/shell-state";
import { BUDGET_DOMAINS, CURRENT, YEARS, consumedFor, quarterKey, type DomainBudget } from "@/data/budgets";

/* Admin · 01: a super admin sets every domain's points for a quarter (Figma's Domain Budget Edit, 696:54963):
   Q1–Q4 and the year above the table, the allocation and a note per domain, and one Save Changes. The table
   saves nothing; this page saves (the DS BudgetTable's flow: loading, "Changes Saved"). Any quarter, past ones
   included, can be edited; whole points only (decided 10 Nov 2026). With unsaved edits, switching quarter or
   leaving asks first, with the AV edit page's dialog (decided); closing the tab, the browser's own prompt. */
export default function DomainBudgetScreen() {
  const { avs } = useAddedValues();
  const { budgets, save } = useBudgets();
  const { toast } = useToast();
  const [year, setYear] = React.useState(CURRENT.year);
  const [quarter, setQuarter] = React.useState<Quarter>(CURRENT.quarter);
  const key = quarterKey(year, quarter);
  /* Edits not yet saved, for the quarter shown. */
  const [drafts, setDrafts] = React.useState<Record<string, Record<string, DomainBudget>>>({});
  const [saving, setSaving] = React.useState(false);
  const saved = budgets[key] ?? {};
  const shown = drafts[key] ?? saved;
  const dirty = !!drafts[key];
  /* Where to go once "Leave" is pressed: another quarter, or another page. */
  const [leaving, setLeaving] = React.useState<(() => void) | null>(null);
  const ask = (go: () => void) => (dirty ? (setLeaving(() => go), true) : false);
  const { setLeaveGuard } = useShellState();
  React.useEffect(() => {
    setLeaveGuard((go) => ask(go));
    return () => setLeaveGuard(null);
  });
  const switchTo = (next: { year?: number; quarter?: Quarter }) => {
    const go = () => {
      setDrafts({});
      if (next.year) setYear(next.year);
      if (next.quarter) setQuarter(next.quarter);
    };
    if (!ask(go)) go();
  };

  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const rows: BudgetRow[] = BUDGET_DOMAINS.map((d) => ({
    id: d.id,
    domain: d.name,
    allocated: shown[d.id]?.allocated ?? null,
    consumed: consumedFor(d.id, key, avs),
    notes: shown[d.id]?.notes,
  }));
  const edit = (id: string, change: Partial<DomainBudget>) =>
    setDrafts((all) => {
      const base = all[key] ?? saved;
      return { ...all, [key]: { ...base, [id]: { ...(base[id] ?? { allocated: null }), ...change } } };
    });

  const onSave = () => {
    setSaving(true);
    /* The prototype has no server: a moment's wait stands in for one. */
    window.setTimeout(() => {
      save(key, drafts[key] ?? saved);
      setDrafts((all) => {
        const rest = { ...all };
        delete rest[key];
        return rest;
      });
      setSaving(false);
      toast({ tone: "success", title: "Changes Saved", description: "Your updates have been saved successfully!" });
    }, 800);
  };

  return (
    <Screen
      active="domain-budget"
      header={<PageTitle title="Domain Budget" subtitle="Each domain's development points for a quarter." />}
    >
      {/* Where a guided scenario's step points (Admin · 01): see src/flows/types.ts. */}
      <div className="flex flex-col gap-4 py-6" data-flow-step="budgets">
        <div className="flex flex-wrap items-center justify-end gap-3">
          <SegmentedControl
            aria-label="Quarter"
            size="lg"
            /* Locked while saving, an option at a time (the control has no `disabled` of its own). */
            options={["Q1", "Q2", "Q3", "Q4"].map((q) => ({ value: q, label: q, disabled: saving }))}
            value={`Q${quarter}`}
            onChange={(v) => switchTo({ quarter: Number(v.slice(1)) as Quarter })}
          />
          <Select
            aria-label="Year"
            size="md"
            options={YEARS.map(String)}
            value={String(year)}
            onChange={(v) => switchTo({ year: Number(v) })}
            disabled={saving}
          />
        </div>
        <BudgetTable
          rows={rows}
          disabled={saving}
          onAllocatedChange={(id, allocated) => edit(String(id), { allocated })}
          onNotesChange={(id, notes) => edit(String(id), { notes })}
          caption={`Domain budget, Q${quarter} ${year}`}
        />
        <div className="flex justify-end">
          <Button loading={saving} onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </div>
      <Modal
        open={!!leaving}
        onClose={() => setLeaving(null)}
        title="Leave without saving?"
        tone="critical"
        size="sm"
        actions={{
          cancelLabel: "Keep editing",
          confirm: {
            label: "Leave",
            onClick: () => {
              const go = leaving;
              setDrafts({});
              setLeaving(null);
              go?.();
            },
          },
        }}
      >
        <p className="text-body-md-regular text-text-secondary">
          Your changes to Q{quarter} {year}&apos;s budgets aren&apos;t saved. If you leave now, they&apos;re lost.
        </p>
      </Modal>
    </Screen>
  );
}
