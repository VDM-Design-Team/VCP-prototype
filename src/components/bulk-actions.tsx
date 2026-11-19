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
import { TODAY } from "@/data/gantt";
import { CHAINS, CYCLE_OPTIONS, stageLabel, type AddedValue } from "@/data/added-values";

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

/**
 * Figma's "Move to Status" list (Bulk_Actions_Dropdowns, 1707:169333), with
 * only the domain steps every selected AV's domain has (decided 9 Nov 2026).
 * Save as Draft and Submit are left out (decided), and Handoff waits for the
 * shared handoff form (decided).
 */
const statusItems = (domains: ReadonlySet<AddedValue["domain"]>): MenuItem[] => {
  const common = domains.size === 1 ? CHAINS[[...domains][0]] : [];
  return [
    { key: "pending", label: "Pending Review", items: [{ key: "pending/accept", label: "Accept" }, { key: "pending/reject", label: "Reject" }] },
    { key: "in-progress", label: "In Progress" },
    ...common.map((s) => ({ key: s.id, label: s.label })),
    { key: "review", label: "Review", items: [{ key: "review/accept", label: "Accept" }, { key: "review/reject", label: "Reject" }] },
    { key: "backlog", label: "Backlog" },
  ] as MenuItem[];
};

const asReasons = (list: typeof PENDING_REJECTION_REASONS): BulkRejectionReason[] =>
  list.map((r) => ({ value: r.value, label: r.label, explanation: "description" in r ? r.description : undefined, other: "freeText" in r ? !!r.freeText : false }));

type Op =
  | { kind: "status"; key: string }
  | { kind: "urgency"; value: AVUrgency }
  | { kind: "type"; value: AVType }
  | { kind: "cycle"; value: string }
  | { kind: "delete" };

/**
 * Why `av` can't take `op`, or nothing when it can. Figma's bar (1707:166018)
 * offers the same changes to everyone and draws no rules, so there are no role
 * rules here (decided 9 Nov 2026). Kept where Figma is silent, because the
 * choice itself says so: Pending Review's Accept/Reject is for Pending AVs,
 * Review's for AVs in Review, and Design has no Cycle (DetailCard leaves it out).
 */
function refusal(av: AddedValue, op: Op): string | undefined {
  if (op.kind === "cycle") return av.domain === "design" ? "Design Added Values have no Cycle." : undefined;
  if (op.kind !== "status") return undefined;
  if (op.key.startsWith("pending/")) return av.status === "Pending" ? undefined : `It's ${stageLabel(av)}, not Pending.`;
  if (op.key.startsWith("review/")) return av.status === "Review" ? undefined : `It's ${stageLabel(av)}, not in Review.`;
  return undefined;
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

export function BulkActions({
  selected,
  onClear,
  returnFocusRef,
}: {
  selected: readonly AddedValue[];
  onClear: () => void;
  /** Where focus goes when the selection empties and the bar goes with it: the list's select-all checkbox. */
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
  const { moveTo, update, remove } = useAddedValues();
  const { toast } = useToast();
  const [op, setOp] = React.useState<Op | null>(null);
  const [failed, setFailed] = React.useState<{ failures: BulkActionFailure[]; total: number; property: string; value: string } | null>(null);

  /* The failure summary opens after the selection has emptied, so the button its dialog hands focus back to is gone.
     When it closes and focus has fallen to the page, it goes where the bar's would. */
  const hadFailed = React.useRef(false);
  React.useEffect(() => {
    const had = hadFailed.current;
    hadFailed.current = !!failed;
    if (!had || failed || !returnFocusRef) return undefined;
    const timer = window.setTimeout(() => {
      const active = document.activeElement;
      if (!active || active === document.body) returnFocusRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [failed, returnFocusRef]);

  const items = selected.map((av) => ({ ref: av.ref, title: av.title, href: `/added-values/${av.id}` }));
  const domains = new Set(selected.map((av) => av.domain));
  const domain: BulkDomain = domains.size === 1 ? ([...domains][0] as BulkDomain) : "other";

  /** Apply `change` to every AV that can take it; summarise the rest. */
  const run = (change: (av: AddedValue) => void) => {
    if (!op) return;
    const ok: AddedValue[] = [];
    const failures: BulkActionFailure[] = [];
    for (const av of selected) {
      const why = refusal(av, op);
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
    { key: "status", label: "Status", heading: "Move to Status", items: statusItems(domains), onSelect: (key) => key && !["pending", "review"].includes(key) && setOp({ kind: "status", key }) },
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
    /* Feedback is required (decided 13 Nov 2026): the dialog refuses Confirm until every AV has some, the bulk one or its own. */
    if (key === "backlog")
      return (
        <BulkActionConfirmModal
          {...base}
          action="backlog"
          onConfirm={(choice) => run((av) => moveTo(av.id, "Backlog", { remarks: (choice.overrides[av.ref]?.trim() || choice.value).trim() }))}
        />
      );
    return <BulkActionConfirmModal {...base} action="status" value={describe(op).value} onConfirm={() => run((av) => moveTo(av.id, key === "in-progress" ? "In Progress" : key))} />;
  })();

  return (
    <>
      {/* Stuck to the bottom of the table, centred over it, as Figma draws it;
          raised clear of the prototype's own View as switch. The bar stays mounted
          with nothing selected (it draws nothing at 0): that is how it sees the
          selection empty and hands focus to `returnFocusRef`. */}
      <div
        data-flow-step={selected.length > 0 ? "bulk-bar" : undefined}
        className={selected.length > 0 ? "sticky bottom-20 z-10 flex justify-center" : "hidden"}
      >
        <BulkActionBar
          count={selected.length}
          onClear={onClear}
          actions={actions}
          onDelete={() => setOp({ kind: "delete" })}
          returnFocusRef={returnFocusRef}
        />
      </div>
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
