"use client";

import * as React from "react";
import {
  BulkActionBar,
  BulkActionConfirmModal,
  BulkActionFailedModal,
  ConfirmDeleteAVModal,
  formatDate,
  HANDOFF_REJECTION_REASONS,
  PENDING_REJECTION_REASONS,
  useToast,
  type AVType,
  type AVUrgency,
  type BulkAction,
  type BulkActionFailure,
  type BulkDomain,
  type BulkRejectionReason,
  type MenuItem,
} from "@vdm-design-team/vcp-design-system";
import { useAddedValues } from "./av-store";
import { useShellState } from "./shell-state";
import { TODAY } from "@/data/gantt";
import { CHAINS, CYCLE_OPTIONS, VIEWER, stageLabel, type AddedValue } from "@/data/added-values";

/**
 * AV · 09 Bulk actions: the bar under a list's selected rows (DS #279's
 * `BulkActionBar`), the confirmation each choice opens
 * (`BulkActionConfirmModal`, `ConfirmDeleteAVModal`), and, when some of the
 * selection can't take the change, `BulkActionFailedModal` naming them and why.
 * Every choice only asks; Confirm makes the change. Handoff isn't offered: it
 * waits for the shared handoff form (decided 9 Nov 2026).
 */

const URGENCIES: AVUrgency[] = ["Low", "Normal", "High", "Urgent"];
const TYPES: AVType[] = ["Type 1", "Type 2", "Type 3"];
const cycleLabel = (c: (typeof CYCLE_OPTIONS)[number]) => `${c.code} (${formatDate(c.start)} - ${formatDate(c.end)})`;
const STEPS = [...CHAINS.development, ...CHAINS.design];
const stepLabel = (id: string) => STEPS.find((s) => s.id === id)?.label ?? id;

/** Development's list, with Design's steps after it (a selection can mix domains; a step the AV's domain lacks fails). */
const STATUS_ITEMS: MenuItem[] = [
  { key: "pending", label: "Pending Review", items: [{ key: "pending/accept", label: "Accept" }, { key: "pending/reject", label: "Reject" }] },
  { key: "in-progress", label: "In Progress" },
  ...STEPS.map((s) => ({ key: s.id, label: s.label })),
  { key: "review", label: "Review", items: [{ key: "review/accept", label: "Accept" }, { key: "review/reject", label: "Reject" }] },
  { key: "backlog", label: "Backlog" },
] as MenuItem[];

const asReasons = (list: typeof PENDING_REJECTION_REASONS): BulkRejectionReason[] =>
  list.map((r) => ({ value: r.value, label: r.label, explanation: "description" in r ? r.description : undefined, other: "freeText" in r ? !!r.freeText : false }));

type Op =
  | { kind: "status"; key: string }
  | { kind: "urgency"; value: AVUrgency }
  | { kind: "type"; value: AVType }
  | { kind: "cycle"; value: string }
  | { kind: "delete" };

/** Why `av` can't take `op`, or nothing when it can. Simulated: the server's rules aren't drawn. */
function refusal(av: AddedValue, op: Op, admin: boolean): string | undefined {
  if (op.kind === "urgency" || op.kind === "type") return undefined;
  if (op.kind === "cycle") return av.domain === "design" ? "Design Added Values have no Cycle." : undefined;
  if (op.kind === "delete") return admin || av.initiator === VIEWER.name ? undefined : "Only its initiator or an admin can delete it.";
  const key = op.key;
  if (key.startsWith("pending/")) {
    if (!admin) return "Only an admin can accept or reject a Pending Added Value.";
    return av.status === "Pending" || av.status === "Backlog" ? undefined : `It's ${stageLabel(av)}, not Pending.`;
  }
  if (key.startsWith("review/")) {
    if (!admin && av.initiator !== VIEWER.name) return "Only its initiator or an admin can decide its review.";
    return av.status === "Review" ? undefined : `It's ${stageLabel(av)}, not in Review.`;
  }
  if (key === "backlog") {
    if (admin) return av.status === "Draft" || av.status === "Pending" ? undefined : "Only a Draft or Pending Added Value can go to the Backlog.";
    return av.status === "Draft" && av.initiator === VIEWER.name ? undefined : "Only its initiator's own Draft can go to the Backlog.";
  }
  if (key === "in-progress") return av.status === "Accepted" ? undefined : `It's ${stageLabel(av)}: only an Accepted one moves to In Progress.`;
  /* A domain step. */
  if (!CHAINS[av.domain].some((s) => s.id === key)) return `${av.domain === "design" ? "Design" : "Development"} has no ${stepLabel(key)} step.`;
  return av.status === "In Progress" ? undefined : `It's ${stageLabel(av)}: only one In Progress moves between steps.`;
}

/** What the confirmation shows, and what it's called in the toast and the failure summary. */
const describe = (op: Op): { property: string; value: string } => {
  if (op.kind === "urgency") return { property: "Urgency", value: op.value };
  if (op.kind === "type") return { property: "Type", value: op.value };
  if (op.kind === "cycle") return { property: "Cycle", value: CYCLE_OPTIONS.find((c) => c.value === op.value)?.code ?? op.value };
  /* The failure summary has one sentence, "failed to update {property} to {value}". */
  if (op.kind === "delete") return { property: "Status", value: "Deleted" };
  const map: Record<string, string> = { "pending/accept": "Accepted", "pending/reject": "Rejected", "review/accept": "Completed", "review/reject": "sent back", backlog: "Backlog", "in-progress": "In Progress" };
  return { property: "Status", value: map[op.key] ?? stepLabel(op.key) };
};

export function BulkActions({ selected, onClear }: { selected: readonly AddedValue[]; onClear: () => void }) {
  const { moveTo, update, remove } = useAddedValues();
  const { role } = useShellState();
  const { toast } = useToast();
  const admin = role !== "user";
  const [op, setOp] = React.useState<Op | null>(null);
  const [failed, setFailed] = React.useState<{ failures: BulkActionFailure[]; total: number; property: string; value: string } | null>(null);

  const items = selected.map((av) => ({ ref: av.ref, title: av.title, href: `/added-values/${av.id}` }));
  const domains = new Set(selected.map((av) => av.domain));
  const domain: BulkDomain = domains.size === 1 ? ([...domains][0] as BulkDomain) : "other";

  /** Apply `change` to every AV that can take it; summarise the rest. */
  const run = (change: (av: AddedValue) => void) => {
    if (!op) return;
    const ok: AddedValue[] = [];
    const failures: BulkActionFailure[] = [];
    for (const av of selected) {
      const why = refusal(av, op, admin);
      if (why) failures.push({ ref: av.ref, title: av.title, href: `/added-values/${av.id}`, reason: why });
      else ok.push(av);
    }
    ok.forEach(change);
    const { property, value } = describe(op);
    setOp(null);
    onClear();
    if (ok.length) {
      toast({
        tone: "success",
        title: "Added Values Updated",
        description:
          op.kind === "delete"
            ? `${ok.length} Added Value${ok.length === 1 ? "" : "s"} deleted.`
            : `${property} changed to ${value} for ${ok.length} Added Value${ok.length === 1 ? "" : "s"}.`,
      });
    }
    if (failures.length) setFailed({ failures, total: selected.length, property, value });
  };

  const actions: BulkAction[] = [
    { key: "status", label: "Status", heading: "Move to Status", items: STATUS_ITEMS, onSelect: (key) => key && !["pending", "review"].includes(key) && setOp({ kind: "status", key }) },
    { key: "urgency", label: "Urgency", heading: "Urgency", items: URGENCIES.map((u) => ({ key: u, label: u })), onSelect: (key) => key && setOp({ kind: "urgency", value: key as AVUrgency }) },
    { key: "type", label: "Type", heading: "Type", items: TYPES.map((t) => ({ key: t, label: t })), onSelect: (key) => key && setOp({ kind: "type", value: key as AVType }) },
    { key: "cycle", label: "Cycle", searchable: true, items: CYCLE_OPTIONS.map((c) => ({ key: c.value, label: cycleLabel(c) })), onSelect: (key) => key && setOp({ kind: "cycle", value: key }) },
  ];

  const close = () => setOp(null);
  const base = { open: true, onClose: close, items };
  const confirm = (() => {
    if (!op || op.kind === "delete") return null;
    if (op.kind === "urgency") return <BulkActionConfirmModal {...base} action="urgency" value={op.value} onConfirm={() => run((av) => update(av.id, { urgency: op.value }))} />;
    if (op.kind === "type") return <BulkActionConfirmModal {...base} action="type" value={op.value} onConfirm={() => run((av) => update(av.id, { type: op.value }))} />;
    if (op.kind === "cycle") {
      const c = CYCLE_OPTIONS.find((x) => x.value === op.value)!;
      return <BulkActionConfirmModal {...base} action="cycle" value={{ code: c.code, start: c.start, end: c.end }} onConfirm={() => run((av) => update(av.id, { cycle: c.value }))} />;
    }
    const key = op.key;
    if (key === "pending/accept")
      return <BulkActionConfirmModal {...base} action="accept-pending" domain={domain} onConfirm={() => run((av) => moveTo(av.id, "Accepted", { dateAccepted: TODAY, remarks: undefined }))} />;
    if (key === "pending/reject")
      return (
        <BulkActionConfirmModal
          {...base}
          action="reject-pending"
          reasons={asReasons(PENDING_REJECTION_REASONS)}
          onConfirm={(choice) =>
            run((av) => moveTo(av.id, "Rejected", { rejection: { reason: choice.overrides[av.ref] ?? choice.value, detail: choice.overrideDetails?.[av.ref] ?? choice.detail }, remarks: undefined }))
          }
        />
      );
    if (key === "review/accept") return <BulkActionConfirmModal {...base} action="accept" domain={domain} onConfirm={() => run((av) => moveTo(av.id, "Completed"))} />;
    if (key === "review/reject")
      return (
        <BulkActionConfirmModal
          {...base}
          action="reject"
          reasons={asReasons(HANDOFF_REJECTION_REASONS as typeof PENDING_REJECTION_REASONS)}
          onConfirm={() => run((av) => moveTo(av.id, CHAINS[av.domain][CHAINS[av.domain].length - 1].id))}
        />
      );
    if (key === "backlog")
      return <BulkActionConfirmModal {...base} action="backlog" onConfirm={(choice) => run((av) => moveTo(av.id, "Backlog", { remarks: (choice.overrides[av.ref] ?? choice.value) || undefined }))} />;
    return <BulkActionConfirmModal {...base} action="status" value={describe(op).value} onConfirm={() => run((av) => moveTo(av.id, key === "in-progress" ? "In Progress" : key))} />;
  })();

  return (
    <>
      {/* Stuck to the bottom of the table, centred over it, as Figma draws it;
          raised clear of the prototype's own View as switch. */}
      {selected.length > 0 && (
        <div data-flow-step="bulk-bar" className="sticky bottom-20 z-10 flex justify-center">
          <BulkActionBar count={selected.length} onClear={onClear} actions={actions} onDelete={() => setOp({ kind: "delete" })} />
        </div>
      )}
      {confirm}
      <ConfirmDeleteAVModal
        open={op?.kind === "delete"}
        onClose={close}
        avTitles={selected.map((av) => `${av.ref} ${av.title}`)}
        onConfirm={() => run((av) => remove(av.id))}
      />
      {failed && (
        <BulkActionFailedModal
          open
          onClose={() => setFailed(null)}
          total={failed.total}
          property={failed.property}
          value={failed.value}
          failures={failed.failures}
        />
      )}
    </>
  );
}
