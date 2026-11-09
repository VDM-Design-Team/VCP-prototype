"use client";

import { useRouter } from "next/navigation";
import { InCaseYouMissedIt, PageTitle, StatCard, useToast } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { Panel } from "@/components/panel";
import { useAddedValues } from "@/components/av-store";
import { useNotifications } from "@/components/notification-store";
import { useShellState } from "@/components/shell-state";
import { missedFor, stateKey } from "@/data/missed";

/* A user's dashboard: the Value Cards, "In Case You Missed it" (Activity · 03; Figma 1552:13937, placed
   under the Value Cards as on the admin dashboard 951:370905), then recent activity. Sample data. */
export default function DashboardScreen() {
  const router = useRouter();
  const { avs } = useAddedValues();
  const { dismissed, dismiss, undoDismiss } = useNotifications();
  const { role } = useShellState();
  const { toast } = useToast();
  const keyOf = (id: string) => {
    const av = avs.find((a) => a.id === id);
    return av ? stateKey(av) : "";
  };
  /* Decided 9 Nov 2026: a dismissed card stays away until its AV's status or due date changes. */
  const missed = missedFor(avs, role !== "user").filter(
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
      {/* Where a guided scenario's step points (Activity · 03): see src/flows/types.ts. */}
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
      <Panel title="Recent activity">Nothing yet this cycle.</Panel>
    </Screen>
  );
}
