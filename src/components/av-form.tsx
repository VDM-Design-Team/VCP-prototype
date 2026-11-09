"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Banner,
  Button,
  DeliverablesCard,
  DescriptionCard,
  DescriptionSection,
  DetailCard,
  Field,
  formatDate,
  Input,
  PageTitle,
  StatusHistory,
  useToast,
  type DetailCardField,
  type DetailCardValue,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useAddedValues } from "@/components/av-store";
import { useScenario, useScenarioSetup } from "@/components/scenario";
import { TODAY } from "@/data/gantt";
import { CYCLE_OPTIONS, VIEWER, type AddedValue } from "@/data/added-values";
import {
  availabilityClash,
  DOMAIN_TAGS,
  EMPTY_DRAFT,
  GLOBAL_TAGS,
  SUBMIT_FLOW,
  SUBMIT_PEOPLE,
  TAG_OPTIONS,
  type SubmitDraft,
} from "@/flows/av-01-submit";
import { DRAFT_FLOW } from "@/flows/av-03-save-as-draft";

type ListKey = "problems" | "solutions" | "deliverables";

/** Everything Submit checks, at once. Each message stays until its field is fixed. */
interface Problems {
  title?: string;
  problems: Record<number, string>;
  solutions: Record<number, string>;
  deliverables: Record<number, string>;
  desiredOutcome?: string;
  details: Partial<Record<DetailCardField, string>>;
  /** One "Missing Input" toast each, in the page's order. */
  toasts: string[];
  /** Busy assignees: a warning, never a block. */
  warnings: string[];
  /** Assignees away during the AV's dates: a block. Shown as a banner, because DetailCard draws no error on its people fields. */
  unavailable?: string;
}

const EMPTY_FIELD = "You need to fill in this field before submitting the Added Value";
const PAIR = "Problem and solution should be filled together";
const blank = (s: string) => !s.trim();
const range = (from: string, to: string) => `${formatDate(from)}–${formatDate(to)}`;

function check(d: SubmitDraft): Problems {
  const p: Problems = { problems: {}, solutions: {}, deliverables: {}, details: {}, toasts: [], warnings: [] };
  if (blank(d.title)) {
    p.title = EMPTY_FIELD;
    p.toasts.push("Title Field can't be empty, please fill it in before submitting.");
  }

  /* Problems and solutions: at least one of each, and every problem with its solution. */
  const pairs = Math.max(d.problems.length, d.solutions.length);
  if (d.problems.every(blank)) {
    p.problems[0] = EMPTY_FIELD;
    p.toasts.push("Problem Field can't be empty, please fill it in before submitting.");
  }
  if (d.solutions.every(blank)) {
    p.solutions[0] = EMPTY_FIELD;
    p.toasts.push("Solution Field can't be empty, please fill it in before submitting.");
  }
  let unpaired = false;
  for (let i = 0; i < pairs; i++) {
    const problem = d.problems[i] ?? "";
    const solution = d.solutions[i] ?? "";
    if (blank(problem) !== blank(solution)) {
      unpaired = true;
      if (i < d.problems.length) p.problems[i] = PAIR;
      if (i < d.solutions.length) p.solutions[i] = PAIR;
    }
  }
  if (unpaired) p.toasts.push("Each problem needs its solution: fill in both, or remove the pair.");

  if (d.deliverables.every(blank)) {
    p.deliverables[0] = EMPTY_FIELD;
    p.toasts.push("Acceptance Criteria / Deliverables Field can't be empty, please fill it in before submitting.");
  }
  if (blank(d.desiredOutcome)) {
    p.desiredOutcome = EMPTY_FIELD;
    p.toasts.push("Desired Outcome Field can't be empty, please fill it in before submitting.");
  }

  /* Projects: Figma "“Projects” Field Error" (1026:166742). */
  if (!d.details.projects?.length) {
    p.details.projects = "Please select a project tag before submitting";
    p.toasts.push("Projects Field can't be empty, please fill it in before submitting.");
  }

  /* The tag rule: one global tag and at least one of the AV's own domain. */
  const tags = d.details.tags ?? [];
  if (tags.length === 0) {
    p.details.tags = "Please select at least one tag before submitting";
    p.toasts.push("Please select at least one Tag before submitting");
  } else {
    const global = tags.some((t) => (GLOBAL_TAGS as readonly string[]).includes(t));
    const domain = tags.some((t) => (DOMAIN_TAGS as readonly string[]).includes(t));
    if (!global || !domain) {
      p.details.tags = `Add ${!global ? "one global tag" : ""}${!global && !domain ? " and " : ""}${!domain ? "at least one Development tag" : ""} before submitting`;
      p.toasts.push("Tags need one global tag and at least one Development tag before submitting");
    }
  }

  /* An assignee away during the AV's dates blocks it; a busy one only warns. */
  const away: string[] = [];
  for (const a of d.details.assignees ?? []) {
    const clash = availabilityClash(a.name, d.details.startDate, d.details.dueDate);
    if (clash?.state === "unavailable") away.push(`${a.name} is ${clash.why} ${range(clash.from, clash.to)}`);
    else if (clash?.state === "busy") p.warnings.push(`${a.name} is ${clash.why} ${range(clash.from, clash.to)}, during this Added Value's dates.`);
  }
  if (away.length) {
    p.unavailable = `${away.join("; ")}, during this Added Value's dates. Change the dates or remove them.`;
    p.toasts.push(`Assignee unavailable: ${away.join("; ")}.`);
  }
  return p;
}

const blocked = (p: Problems) => p.toasts.length > 0;

/** Save as draft checks one thing: a Title, so the draft can be found on Drafts (AV · 03). */
const DRAFT_TITLE = "You need to fill in this field before saving the Added Value as a draft";
function checkDraft(d: SubmitDraft): Problems {
  const p: Problems = { problems: {}, solutions: {}, deliverables: {}, details: {}, toasts: [], warnings: [] };
  if (blank(d.title)) {
    p.title = DRAFT_TITLE;
    p.toasts.push("Title Field can't be empty, please fill it in before saving a draft.");
  }
  return p;
}

/** An AV as the form holds it (AV · 04 opens the form on it). An empty list keeps one blank card to type in. */
function fromAV(av: AddedValue): SubmitDraft {
  const list = (l: string[]) => (l.length ? [...l] : [""]);
  return {
    title: av.title,
    problems: list(av.problems),
    solutions: list(av.solutions),
    deliverables: list(av.deliverables),
    desiredOutcome: av.desiredOutcome,
    details: {
      initiators: [{ name: av.initiator }],
      assignees: av.assignees.map((a) => ({ name: a.name, description: "Assignee", points: a.points })),
      startDate: av.startDate,
      dueDate: av.dueDate,
      cycle: av.cycle,
      urgency: av.urgency,
      type: av.type,
      projects: av.project ? [av.project] : [],
      category: av.category,
      tags: [...av.tags],
      capacityPoints: av.capacityPoints,
    },
  };
}

type Link = { id: string; title: string; url: string; domain: "design" | "development" };

/**
 * The Added Value form: Added Value Creation (Figma 2:11984; AV · 01 Submit,
 * AV · 03 Save as Draft) and, given `editing`, the edit page of a Draft or
 * Pending AV (Figma 1026:166675 and 1043:239669; AV · 04 Edit an AV). The
 * description on the left, the details and deliverables on the right, the
 * buttons under them. Submit runs every check at once; a blocked Submit raises
 * one "Missing Input" toast per problem (not announced: the field errors
 * announce themselves) and an error under each field until it's fixed. Save as
 * draft checks only the Title.
 */
export function AVForm({ editing }: { editing?: AddedValue }) {
  const { run } = useScenario();
  /* A scenario's start or Reset remounts the form from its setup. */
  return <Form key={run} editing={editing} />;
}

function Form({ editing }: { editing?: AddedValue }) {
  const router = useRouter();
  const { toast, dismissAll } = useToast();
  const { create, update, moveTo } = useAddedValues();
  const setup = useScenarioSetup<SubmitDraft>([SUBMIT_FLOW.id, DRAFT_FLOW.id]);
  const [draft, setDraft] = React.useState<SubmitDraft>(() =>
    structuredClone(editing ? fromAV(editing) : (setup ?? EMPTY_DRAFT)),
  );
  /* Errors show from the first Submit (or Save as draft) on, and each clears as
     its field is fixed. Which one was pressed last decides which checks show. */
  const [attempted, setAttempted] = React.useState<"submit" | "draft">();
  const [links, setLinks] = React.useState<Link[]>(() =>
    (editing?.links ?? []).map((l) => ({ ...l, domain: (l.domain ?? "development") as Link["domain"] })),
  );
  const problems = React.useMemo(() => check(draft), [draft]);
  const draftProblems = React.useMemo(() => checkDraft(draft), [draft]);
  /* Each blocked press, once its inline errors are on screen: bring the first
     one into view and put the cursor in it (Figma: "scroll to the highest
     missing field"). An assignee the card can't mark is reached by its banner
     and toast. */
  const [blockedPresses, setBlockedPresses] = React.useState(0);
  React.useEffect(() => {
    if (!blockedPresses) return;
    const first = document.querySelector<HTMLElement>('main [aria-invalid="true"]');
    first?.scrollIntoView({ block: "center" });
    first?.focus({ preventScroll: true });
  }, [blockedPresses]);
  const shown = attempted === "submit" ? problems : attempted === "draft" ? draftProblems : undefined;

  const setList = (key: ListKey, list: string[]) => setDraft((d) => ({ ...d, [key]: list }));
  const setItem = (key: ListKey, i: number, value: string) =>
    setDraft((d) => ({ ...d, [key]: d[key].map((v, j) => (j === i ? value : v)) }));
  const removeItem = (key: ListKey, i: number) => setList(key, draft[key].filter((_, j) => j !== i));

  /* One press of Submit or Save as draft: its checks, its toasts. A new press
     replaces the last one's toasts rather than stacking on them. */
  const press = (kind: "submit" | "draft") => {
    const found = kind === "submit" ? problems : draftProblems;
    setAttempted(kind);
    dismissAll();
    if (!blocked(found)) return true;
    for (const message of found.toasts) {
      toast({ tone: "critical", title: "Missing Input", description: message, announce: false, duration: null });
    }
    setBlockedPresses((n) => n + 1);
    return false;
  };

  /** What the form holds, as the AV's fields. */
  const content = () => ({
    title: draft.title.trim(),
    urgency: draft.details.urgency ?? "Normal",
    type: draft.details.type ?? "Type 3",
    project: draft.details.projects?.[0] ?? "",
    category: draft.details.category ?? "Improvement",
    tags: [...(draft.details.tags ?? [])],
    initiator: draft.details.initiators?.[0]?.name ?? VIEWER.name,
    assignees: (draft.details.assignees ?? []).map((a) => ({ name: a.name, points: a.points })),
    startDate: draft.details.startDate,
    dueDate: draft.details.dueDate,
    cycle: draft.details.cycle,
    capacityPoints: draft.details.capacityPoints,
    problems: draft.problems.filter((s) => !blank(s)),
    solutions: draft.solutions.filter((s) => !blank(s)),
    deliverables: draft.deliverables.filter((s) => !blank(s)),
    desiredOutcome: draft.desiredOutcome.trim(),
    links: links.map((l) => ({ ...l })),
  });

  /** A new AV (Added Value Creation), in `status`. */
  const createAs = (status: "Pending" | "Draft") =>
    create({
      ...content(),
      domain: "development",
      status,
      dateInitiated: TODAY,
      files: [],
      history: [
        status === "Pending"
          ? { actor: VIEWER.name, from: "Draft", to: "Pending", when: "Just now" }
          : { actor: VIEWER.name, from: "Initial Creation", to: "Draft", when: "Just now" },
      ],
      comments: [],
      updatedAt: new Date().toISOString(),
      updatedLabel: "Just now",
    } satisfies Omit<AddedValue, "id" | "ref">);

  /* Decided 6 Nov 2026: a submitted AV closes, and the Dashboard opens with a
     success toast that can open it. (Figma draws no landing page.) */
  const submitted = (av: Pick<AddedValue, "id" | "ref">) => {
    router.push("/");
    toast({
      tone: "success",
      title: `${av.ref} submitted`,
      description: "It's Pending until an admin accepts or rejects it.",
      actionLabel: "Open it",
      onAction: () => router.push(`/added-values/${av.id}`),
    });
  };
  /* AV · 04: an edit that keeps the AV where it is, or moves it back, closes
     the form and opens the AV's page (inferred: Figma draws no landing page). */
  const backToAV = (av: Pick<AddedValue, "id" | "ref">, title: string, description: string) => {
    router.push(`/added-values/${av.id}`);
    toast({ tone: "success", title, description });
  };

  const submit = () => {
    if (!press("submit")) return;
    if (!editing) return submitted(createAs("Pending"));
    if (editing.status === "Draft") {
      moveTo(editing.id, "Pending", content());
      return submitted(editing);
    }
    update(editing.id, content());
    backToAV(editing, `${editing.ref}: changes saved`, "It's still Pending until an admin accepts or rejects it.");
  };

  /* AV · 03: only the Title is checked. A new draft closes the page and opens
     Drafts, where it waits until it's edited and submitted (inferred: Figma
     draws no landing page). */
  const saveDraft = () => {
    if (!press("draft")) return;
    if (!editing) {
      const av = createAs("Draft");
      router.push("/drafts");
      toast({
        tone: "success",
        title: `${av.ref} saved as a draft`,
        description: "Only you can see it until it's submitted.",
        actionLabel: "Open it",
        onAction: () => router.push(`/added-values/${av.id}`),
      });
      return;
    }
    if (editing.status === "Draft") {
      update(editing.id, content());
      return backToAV(editing, `${editing.ref}: changes saved`, "It's still a Draft. Only you can see it until it's submitted.");
    }
    moveTo(editing.id, "Draft", content());
    backToAV(editing, `${editing.ref} moved back to Draft`, "It leaves the admins' queue until it's submitted again.");
  };

  const section = (key: ListKey, type: "problem" | "solution" | "deliverable", noun: string) => (
    <DescriptionSection
      type={type}
      onAdd={() => setList(key, [...draft[key], ""])}
      addLabel={`Add ${noun}`}
      /* Where a guided scenario's step points: see src/flows/types.ts. */
      data-flow-step={key}
    >
      {draft[key].map((value, i) => (
        <DescriptionCard
          key={i}
          editing
          value={value}
          onChange={(v) => setItem(key, i, v)}
          error={shown?.[key][i]}
          onRemove={draft[key].length > 1 ? () => removeItem(key, i) : undefined}
          removeLabel={`Remove ${noun} ${i + 1}`}
        />
      ))}
    </DescriptionSection>
  );

  const header = editing ? (
    <PageTitle
      title={`Edit ${editing.ref}`}
      onBack={() => router.push(`/added-values/${editing.id}`)}
      backLabel={`Back to ${editing.ref}`}
    />
  ) : (
    <PageTitle title="Added Value Creation" onBack={() => router.back()} backLabel="Back" />
  );

  return (
    <Screen active="" header={header}>
      <div className="grid gap-4 lg:grid-cols-3">
        <div data-flow-step="form" className="flex flex-col gap-4 lg:col-span-2">
          <section data-flow-step="title" className="rounded-md bg-surface-elevated p-6">
            <Field label="Title" error={shown?.title}>
              <Input
                fullWidth
                placeholder="Type in the title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
            </Field>
          </section>
          {section("problems", "problem", "problem")}
          {section("solutions", "solution", "solution")}
          {section("deliverables", "deliverable", "acceptance criterion")}
          <DescriptionSection type="desired-outcome" data-flow-step="desired-outcome">
            <DescriptionCard
              editing
              value={draft.desiredOutcome}
              onChange={(v) => setDraft((d) => ({ ...d, desiredOutcome: v }))}
              error={shown?.desiredOutcome}
            />
          </DescriptionSection>
          {/* Figma's edit pages keep the log, closed. */}
          {editing && <StatusHistory headingLevel={2} entries={editing.history} />}
        </div>
        <div className="flex flex-col gap-4">
          {shown?.unavailable && (
            <div data-flow-step="assignee-unavailable">
              <Banner tone="critical" title="Assignee unavailable">
                {shown.unavailable}
              </Banner>
            </div>
          )}
          {problems.warnings.length > 0 && (
            <div data-flow-step="assignee-busy" className="flex flex-col gap-4">
              {problems.warnings.map((w) => (
                <Banner key={w} tone="warning" title="Assignee busy">
                  {w} You can still submit.
                </Banner>
              ))}
            </div>
          )}
          <div data-flow-step="details">
            <DetailCard
              type="editing"
              value={draft.details}
              onChange={(details: DetailCardValue) => setDraft((d) => ({ ...d, details }))}
              options={{
                people: SUBMIT_PEOPLE,
                cycles: CYCLE_OPTIONS,
                projects: ["VCP"],
                categories: ["Improvement", "New feature", "Fix"],
                tags: TAG_OPTIONS,
              }}
              errors={shown?.details}
            />
          </div>
          <DeliverablesCard
            domain="development"
            mode="edit"
            links={links}
            onAddLinks={(_section, added) =>
              setLinks((list) => [
                ...list,
                ...added.map((l, i) => ({ ...l, id: `link-${list.length + i + 1}`, domain: "development" as const })),
              ])
            }
            onRemoveLink={(_section, id) => setLinks((list) => list.filter((l) => l.id !== id))}
          />
          <div data-flow-step="actions" className="flex justify-end gap-3">
            {/* Figma: a draft's edit page also has Discard, in red text. The DS has
                no red text button yet; Discard is AV · 02, not drawn yet. */}
            {editing?.status === "Draft" && (
              <Button
                variant="tertiary"
                onClick={() =>
                  toast({ tone: "info", title: "Discard is its own flow", description: "AV · 02 Discard isn't in the prototype yet." })
                }
              >
                Discard
              </Button>
            )}
            <Button variant="secondary" onClick={saveDraft}>
              Save as draft
            </Button>
            <Button onClick={submit}>Submit</Button>
          </div>
        </div>
      </div>
    </Screen>
  );
}
