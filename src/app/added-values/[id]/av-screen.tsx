"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AcceptPendingAVModal,
  AVHeader,
  Banner,
  CommentSection,
  ConfirmDeleteAVModal,
  DeliverablesCard,
  DescriptionCard,
  DescriptionCardTitle,
  DescriptionSection,
  DetailCard,
  DetailCardMenu,
  EmptyState,
  HandoffAVModal,
  MoveToBacklogModal,
  HANDOFF_REJECTION_REASONS,
  Icon,
  PageTitle,
  PENDING_REJECTION_REASONS,
  RejectPendingAVModal,
  ReviewAVModal,
  StatusHistory,
  useToast,
  type AVProgressionRole,
  type AVTransition,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useShellState } from "@/components/shell-state";
import { useAddedValues } from "@/components/av-store";
import { TODAY } from "@/data/gantt";
import { CHAINS, CYCLE_OPTIONS, VIEWER, daysOverdue, stageLabel, type AddedValue } from "@/data/added-values";

type Dialog = "accept" | "reject" | "handoff" | "review" | "delete" | "backlog" | null;

const PEOPLE = [VIEWER, ...["Marvin Ode", "Alice Carter", "Jack Morgan", "Lena Novak", "Noah Foster"].map((name) => ({
  id: `u-${name.split(" ")[0].toLowerCase()}`,
  name,
}))];

/** "05-11-2026" — the handoff dialog's date format. */
const ddmmyyyy = (iso: string) => iso.split("-").reverse().join("-");

/** Who the viewer is to this AV, as AVHeader's buttons need it. */
function headerRole(av: AddedValue, admin: boolean): AVProgressionRole | undefined {
  if (admin) return "admin";
  const assignee = av.assignees.some((a) => a.name === VIEWER.name);
  const initiator = av.initiator === VIEWER.name;
  if (assignee && initiator) return "assignee-initiator";
  if (assignee) return "assignee";
  if (initiator) return "initiator";
  return undefined;
}

/**
 * An Added Value's page. Figma "AV Page: Viewing AVs" (153:13170): AVHeader
 * (the ID row, with the status buttons for who is looking), then the title
 * card and the description on the left, the details and deliverables on the
 * right. The status buttons open the design system's dialogs — accept,
 * reject, hand off, review — and the AV moves when they are answered.
 */
export function AVScreen({ id }: { id: string }) {
  const router = useRouter();
  const { role } = useShellState();
  const { get, moveTo: storeMoveTo, addComment, remove } = useAddedValues();
  const moveTo: typeof storeMoveTo = (...args) => {
    storeMoveTo(...args);
    setMoved((n) => n + 1);
  };
  const { toast } = useToast();
  const [dialog, setDialog] = React.useState<Dialog>(null);
  const [multipart, setMultipart] = React.useState(false);
  const [domainOption, setDomainOption] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  /* Set as a delete navigates away, so the page doesn't flash "not found" on the way out. */
  const [leaving, setLeaving] = React.useState(false);
  /* Bumped after every status move. The button that started a move — or the
     dialog's trigger — is gone once the AV moves, so focus would fall to the
     page. It goes to the header's last button instead: the next move, or the
     ⋮ menu when there is none. */
  const [moved, setMoved] = React.useState(0);
  React.useEffect(() => {
    if (!moved) return;
    /* After the dialog has tried to hand focus back to its vanished trigger. */
    const t = window.setTimeout(() => {
      const buttons = headerRef.current?.querySelectorAll<HTMLButtonElement>("button");
      buttons?.[buttons.length - 1]?.focus();
    });
    return () => window.clearTimeout(t);
  }, [moved]);
  const av = get(id);

  if (!av) {
    if (leaving) return null;
    return (
      <Screen active="" header={<PageTitle title="Added Value not found" />}>
        <div className="flex flex-1 items-center justify-center py-16">
          <EmptyState
            headingLevel={2}
            icon={<Icon name="file" size="lg" />}
            title="This Added Value isn't here"
            description="It may have been deleted. Reload the prototype to start from the sample data again."
          />
        </div>
      </Screen>
    );
  }

  const admin = role !== "user";
  const viewer = headerRole(av, admin);
  const chain = CHAINS[av.domain];
  const close = () => {
    /* A dialog opened from the ⋮ menu: its menu item is gone, so focus goes
       back to the ⋮ button rather than falling to the page. */
    const fromMenu = dialog === "backlog" || dialog === "delete";
    setDialog(null);
    if (fromMenu)
      window.setTimeout(() => headerRef.current?.querySelector<HTMLElement>('[data-flow-step="av-menu"] button')?.focus());
  };
  const archiveToast = (title: string, archive: string, description?: string) =>
    toast({
      tone: "success",
      title,
      description,
      actionLabel: "Open the archive",
      onAction: () => router.push(`/archive/${archive}`),
    });

  const onTransition = (t: AVTransition) => {
    if (t.kind === "accept") setDialog(av.status === "Review" ? "review" : "accept");
    else if (t.kind === "reject") setDialog(av.status === "Review" ? "review" : "reject");
    else if (t.kind === "handoff") setDialog("handoff");
    else if ((t.kind === "move" || t.kind === "return") && t.to) {
      /* `to` is a chain step's id or a spine status; say it by name. */
      const name = chain.find((s) => s.id === t.to)?.label ?? t.to;
      moveTo(av.id, t.to);
      toast({ tone: "success", title: `${av.ref} ${t.kind === "return" ? "moved back" : "moved"} to ${name}` });
    }
  };

  const back = () => {
    if (window.history.length > 1) router.back();
    else router.push(admin ? "/manage" : "/assigned");
  };

  const rejection = av.rejection && PENDING_REJECTION_REASONS.find((r) => r.value === av.rejection!.reason);

  return (
    <Screen
      active=""
      header={
        <AVHeader
          ref={headerRef}
          title={av.ref}
          onBack={back}
          backLabel="Back to the list"
          role={viewer}
          /* A draft's page has no status buttons (Figma 1331:26533): it's
             submitted from its edit page (AV · 04). */
          showStatusActions={!!viewer && av.status !== "Draft"}
          {...(av.step ? { step: av.step } : { status: av.status })}
          chain={chain}
          onTransition={onTransition}
          actions={
            /* Where a guided scenario's step points: see src/flows/types.ts. */
            <div data-flow-step="av-menu" className="flex">
              <DetailCardMenu
                role={admin ? "admin" : "user"}
                status={av.status}
                /* Decided 9 Nov 2026: the same edit page at every status (AV · 04). */
                onEdit={() => router.push(`/added-values/${av.id}/edit`)}
                onDelete={() => setDialog("delete")}
                /* AV · 05: the Feedback dialog first (DS #286). */
                onMoveToBacklog={() => setDialog("backlog")}
                onMoveToDraft={() => {
                  moveTo(av.id, "Draft", { remarks: undefined });
                  toast({ tone: "success", title: `${av.ref} moved back to Draft` });
                }}
                onMoveToPending={() => {
                  moveTo(av.id, "Pending", { remarks: undefined });
                  toast({ tone: "success", title: `${av.ref} moved to Pending` });
                }}
              />
            </div>
          }
        />
      }
    >
      <div className="grid grid-cols-3 items-start gap-4 py-6">
        <div className="col-span-2 flex min-w-0 flex-col gap-4">
          {av.status === "Rejected" && (
            <Banner tone="critical" title="This Task was rejected">
              {rejection?.label ?? "No reason was given"}
              {av.rejection?.detail ? `: ${av.rejection.detail}` : ""}
            </Banner>
          )}
          {/* Figma (1090:27191): a backlogged AV shows why, as Remarks. No feedback, no banner (inferred). */}
          {av.status === "Backlog" && av.remarks && (
            <div data-flow-step="remarks">
              <Banner tone="warning" title="Remarks">
                {av.remarks}
              </Banner>
            </div>
          )}
          <DescriptionCardTitle reference={av.ref} title={av.title} />
          {av.problems.length > 0 && (
            <DescriptionSection type="problem">
              {av.problems.map((p) => (
                <DescriptionCard key={p}>{p}</DescriptionCard>
              ))}
            </DescriptionSection>
          )}
          {av.solutions.length > 0 && (
            <DescriptionSection type="solution">
              {av.solutions.map((s) => (
                <DescriptionCard key={s}>{s}</DescriptionCard>
              ))}
            </DescriptionSection>
          )}
          {av.deliverables.length > 0 && (
            <DescriptionSection type="deliverable">
              {av.deliverables.map((d) => (
                <DescriptionCard key={d}>{d}</DescriptionCard>
              ))}
            </DescriptionSection>
          )}
          {/* A draft can leave any of these blank: a section with nothing in it isn't drawn. */}
          {av.desiredOutcome && (
            <DescriptionSection type="desired-outcome">
              <DescriptionCard>{av.desiredOutcome}</DescriptionCard>
            </DescriptionSection>
          )}
          <StatusHistory headingLevel={2} entries={av.history} />
          <CommentSection
            currentUser={VIEWER}
            members={PEOPLE}
            comments={av.comments}
            onAddComment={(body) =>
              addComment(av.id, {
                id: `c-${Date.now()}`,
                author: VIEWER,
                time: "Just now",
                createdAt: new Date().toISOString(),
                body,
              })
            }
          />
        </div>

        <div className="col-span-1 flex min-w-0 flex-col gap-4">
          <DetailCard
            type="viewing"
            domain={av.domain}
            value={{
              initiators: [{ name: av.initiator }],
              /* An empty list would still draw the Assignee heading. */
              assignees: av.assignees.length ? av.assignees : undefined,
              startDate: av.startDate,
              dueDate: av.dueDate,
              cycle: av.cycle,
              status: stageLabel(av),
              urgency: av.urgency,
              type: av.type,
              projects: av.project ? [av.project] : undefined,
              category: av.category,
              tags: av.tags,
              capacityPoints: av.capacityPoints,
              dateInitiated: av.dateInitiated,
              dateAccepted: av.dateAccepted,
            }}
            options={{ cycles: CYCLE_OPTIONS }}
          />
          {!["Draft", "Pending", "Rejected"].includes(av.status) && (
            <DeliverablesCard domain={av.domain} mode="view" links={av.links} files={av.files} />
          )}
        </div>
      </div>

      <AcceptPendingAVModal
        open={dialog === "accept"}
        onClose={close}
        multipart={multipart}
        onMultipartChange={setMultipart}
        onConfirm={() => {
          moveTo(av.id, "Accepted", { dateAccepted: TODAY, remarks: undefined });
          close();
          toast({ tone: "success", title: `${av.ref} accepted`, description: "It's ready to be worked on." });
        }}
      />
      <RejectPendingAVModal
        open={dialog === "reject"}
        onClose={close}
        onReject={({ reason, detail }) => {
          moveTo(av.id, "Rejected", { rejection: { reason, detail }, remarks: undefined });
          close();
          archiveToast(
            `${av.ref} rejected`,
            "rejected",
            PENDING_REJECTION_REASONS.find((r) => r.value === reason)?.label,
          );
        }}
      />
      <HandoffAVModal
        open={dialog === "handoff"}
        onClose={close}
        domain={av.domain === "design" ? "design-governance" : "development"}
        overdueDays={daysOverdue(av) || undefined}
        attachments={av.files.map((f) => ({ id: f.id, name: f.name, kind: f.kind }))}
        defaultDate={TODAY}
        onHandoff={(draft, { publish }) => {
          const kept = av.files.filter((f) => !draft.removedAttachments.includes(f.id));
          moveTo(av.id, "Review", {
            handoff: {
              date: ddmmyyyy(draft.date),
              links: draft.links.filter(Boolean),
              attachments: [...kept.map((f) => f.name), ...draft.attachments.map((f) => f.name)],
              overdueReason: draft.overdueReason,
            },
          });
          close();
          toast({
            tone: "success",
            title: publish ? `${av.ref} handed off and published` : `${av.ref} handed off`,
            description: `${av.initiator} reviews it next.`,
          });
        }}
      />
      <ReviewAVModal
        open={dialog === "review"}
        onClose={close}
        domain={av.domain}
        avName={av.title}
        estimate={av.dueDate && ddmmyyyy(av.dueDate)}
        completionDate={av.handoff?.date}
        links={av.handoff?.links ?? []}
        attachments={(av.handoff?.attachments ?? []).map((name) => ({ name }))}
        domainOption={domainOption}
        onDomainOptionChange={setDomainOption}
        onAccept={() => {
          moveTo(av.id, "Completed");
          close();
          archiveToast(`${av.ref} completed`, "completed");
        }}
        onReject={({ reason }) => {
          const last = chain[chain.length - 1];
          moveTo(av.id, last.id);
          close();
          toast({
            tone: "success",
            title: `${av.ref} sent back to ${last.label}`,
            description: HANDOFF_REJECTION_REASONS.find((r) => r.value === reason)?.label,
          });
        }}
      />
      <MoveToBacklogModal
        open={dialog === "backlog"}
        onClose={close}
        onMove={(feedback) => {
          moveTo(av.id, "Backlog", { remarks: feedback || undefined });
          close();
          /* Figma keeps the AV open, now Backlog; the toast is inferred. */
          archiveToast(`${av.ref} moved to the Backlog`, "backlogs", feedback ? undefined : "No feedback was given.");
        }}
      />
      <ConfirmDeleteAVModal
        open={dialog === "delete"}
        onClose={close}
        avTitle={`${av.ref} — ${av.title}`}
        onConfirm={() => {
          close();
          setLeaving(true);
          router.push(admin ? "/manage" : "/assigned");
          remove(av.id);
          toast({ tone: "success", title: `${av.ref} deleted` });
        }}
      />
    </Screen>
  );
}
