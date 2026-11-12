"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  AcceptPendingAVModal,
  ChildPartModal,
  MultipartParentChip,
  MultipartSection,
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
import { MEMBERS, forViewer } from "@/components/comments";
import { useAddedValues } from "@/components/av-store";
import { TODAY } from "@/data/gantt";
import { CHAINS, CYCLE_OPTIONS, VIEWER, daysOverdue, stageLabel, type AddedValue } from "@/data/added-values";

type Dialog = "accept" | "reject" | "handoff" | "review" | "delete" | "backlog" | "add-part" | "rename-part" | null;

/* Decided 6 Nov 2026 (DS #272): the Multipart info glyph's words. */
const MULTIPART_HINT =
  "This Added Value is split into parts. Each part is tracked on its own; the Added Value is done when every part is completed.";
/** A part's default title, Figma's "(3/3) Parent AV Title" (ChildPartModal: a blank title means this). */
const defaultPartTitle = (position: number, total: number, parentTitle: string) => `(${position}/${total}) ${parentTitle}`;


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
  const { get, moveTo: storeMoveTo, addComment, react, remove, update, createMany } = useAddedValues();
  /* AV · 10: the part being renamed. */
  const [renaming, setRenaming] = React.useState<string>();
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
          {/* AV · 08 (Figma 1144:46613): a copy rejected or backlogged in its own
              domain says so on the original, whose own status stays. */}
          {av.duplicates?.map((d) =>
            d.status === "Rejected" ? (
              <Banner key={d.domain} tone="critical" title={`This Task was rejected in ${d.domain} Domain`}>
                {d.rejection ?? "No reason was given"}
              </Banner>
            ) : d.status === "Backlog" ? (
              <Banner key={d.domain} tone="warning" title={`This Task was backlogged in ${d.domain} Domain`}>
                {d.remarks ?? "No feedback was given"}
              </Banner>
            ) : null,
          )}
          {/* AV · 10: a part links back to its parent (DS #275's chip). */}
          {av.parent && get(av.parent) && (
            <div data-flow-step="parent">
              <MultipartParentChip parentRef={get(av.parent)!.ref} onOpen={() => router.push(`/added-values/${av.parent}`)} />
            </div>
          )}
          <DescriptionCardTitle reference={av.ref} title={av.title} />
          {av.problems.length > 0 && (
            <DescriptionSection type="problem" data-flow-step="multipart-source">
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
          {/* AV · 10: a multipart AV's parts (DS #272), each its own AV. Add Part
              and renaming are for editors (decided 6 Nov 2026): an admin or the initiator. */}
          {av.parts && av.parts.length > 0 && (
            <div data-flow-step="multipart">
              <MultipartSection
                hint={MULTIPART_HINT}
                parts={av.parts
                  .map((id) => get(id))
                  .filter((p): p is AddedValue => !!p)
                  .map((p) => ({
                    id: p.id,
                    title: p.title,
                    assignee: p.assignees[0] ? { name: p.assignees[0].name } : undefined,
                    capacityPoints: p.capacityPoints,
                    dueDate: p.dueDate,
                    ...(p.step ? { customStatus: stageLabel(p) } : { status: p.status }),
                  }))}
                onOpenPart={(part) => router.push(`/added-values/${part.id}`)}
                {...(admin || av.initiator === VIEWER.name
                  ? {
                      onEditPartTitle: (part: { id: string | number }) => {
                        setRenaming(String(part.id));
                        setDialog("rename-part");
                      },
                      onAddPart: () => setDialog("add-part"),
                    }
                  : {})}
              />
            </div>
          )}
          <StatusHistory headingLevel={2} entries={av.history} />
          {/* Where a guided scenario's step points (Activity · 01): see src/flows/types.ts. */}
          <div data-flow-step="comments">
            <CommentSection
              currentUser={VIEWER}
              members={MEMBERS}
              comments={forViewer(av.comments)}
              /* Activity · 01: the reaction row (Figma 634:68928). A pick and a pill toggle are the same thing:
                 yours is added, or taken back (Figma's "Removing Your Reaction", from a pill or the popover). */
              onReact={(id, emoji) => react(av.id, id, emoji)}
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
        </div>

        <div className="col-span-1 flex min-w-0 flex-col gap-4">
          {/* Initiated to other domains (AV · 08): Figma's "Viewing Initiated AV"
              uses the duplicate card, with each copy's domain and status. */}
          <div data-flow-step="details">
            <DetailCard
              type={av.duplicates?.length ? "duplicate" : "viewing"}
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
                duplicates: av.duplicates?.map(({ domain, status }) => ({ domain, status })),
              }}
              options={{ cycles: CYCLE_OPTIONS }}
            />
          </div>
          {!["Draft", "Pending", "Rejected"].includes(av.status) && (
            <DeliverablesCard domain={av.domain} mode="view" links={av.links} files={av.files} />
          )}
        </div>
      </div>

      <AcceptPendingAVModal
        open={dialog === "accept"}
        onClose={close}
        /* AV · 10: Multipart is Development's (a Dev Admin's choice, Figma 1404:132249). */
        showMultipart={av.domain === "development"}
        multipart={multipart}
        onMultipartChange={setMultipart}
        /* One part per problem set, each with its problem as the preview (DS #332). */
        parts={av.problems.map((problem, i) => ({ label: `Problem Set ${i + 1}`, preview: problem }))}
        onConfirm={({ multipart: split, titles }) => {
          if (split && av.domain === "development") {
            const total = av.problems.length;
            const parts = createMany(
              av.problems.map((problem, i) => ({
                ...av,
                title: titles?.[i] || defaultPartTitle(i + 1, total, av.title),
                status: "Accepted",
                step: undefined,
                dateAccepted: TODAY,
                problems: [problem],
                solutions: av.solutions[i] ? [av.solutions[i]] : [],
                assignees: [],
                startDate: undefined,
                dueDate: undefined,
                capacityPoints: undefined,
                comments: [],
                files: [],
                parts: undefined,
                duplicates: undefined,
                remarks: undefined,
                parent: av.id,
                history: [{ actor: VIEWER.name, from: "Initial Creation", to: "Accepted", when: "Just now" }],
                updatedAt: new Date().toISOString(),
                updatedLabel: "Just now",
              })),
            );
            moveTo(av.id, "Accepted", { dateAccepted: TODAY, remarks: undefined, parts: parts.map((p) => p.id) });
            close();
            setMultipart(false);
            toast({ tone: "success", title: `${av.ref} accepted, in ${total} parts`, description: "Each part is tracked on its own." });
            return;
          }
          moveTo(av.id, "Accepted", { dateAccepted: TODAY, remarks: undefined });
          close();
          toast({ tone: "success", title: `${av.ref} accepted`, description: "It's ready to be worked on." });
        }}
      />
      {/* AV · 10: adding a part, and renaming one (DS #272's ChildPartModal). */}
      <ChildPartModal
        open={dialog === "add-part"}
        onClose={close}
        mode="new"
        statusChange={av.status === "Completed" ? { from: "Completed", to: "In Progress" } : undefined}
        onConfirm={(title) => {
          const total = (av.parts?.length ?? 0) + 1;
          const [part] = createMany([
            {
              ...av,
              title: title || defaultPartTitle(total, total, av.title),
              status: "Accepted",
              step: undefined,
              dateAccepted: TODAY,
              assignees: [],
              startDate: undefined,
              dueDate: undefined,
              capacityPoints: undefined,
              comments: [],
              files: [],
              parts: undefined,
              duplicates: undefined,
              remarks: undefined,
              parent: av.id,
              history: [{ actor: VIEWER.name, from: "Initial Creation", to: "Accepted", when: "Just now" }],
              updatedAt: new Date().toISOString(),
              updatedLabel: "Just now",
            },
          ]);
          const wasCompleted = av.status === "Completed";
          /* Decided 9 Nov 2026: default titles are renumbered to the new count; typed ones stay. */
          (av.parts ?? []).forEach((id, i) => {
            const p = get(id);
            if (p && /^\(\d+\/\d+\) /.test(p.title) && p.title.endsWith(av.title)) update(id, { title: defaultPartTitle(i + 1, total, av.title) });
          });
          if (wasCompleted) moveTo(av.id, "In Progress", { parts: [...(av.parts ?? []), part.id] });
          else update(av.id, { parts: [...(av.parts ?? []), part.id] });
          close();
          toast({
            tone: "success",
            title: `${part.ref} added as part ${total}`,
            description: wasCompleted ? `${av.ref} is back In Progress.` : undefined,
          });
        }}
      />
      <ChildPartModal
        open={dialog === "rename-part"}
        onClose={close}
        mode="edit"
        initialTitle={renaming ? get(renaming)?.title : undefined}
        onConfirm={(title) => {
          if (renaming) {
            const position = (av.parts ?? []).indexOf(renaming) + 1;
            /* Decided 6 Nov 2026: a blank renamed title restores the default. */
            update(renaming, { title: title || defaultPartTitle(position, av.parts?.length ?? position, av.title) });
          }
          close();
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
