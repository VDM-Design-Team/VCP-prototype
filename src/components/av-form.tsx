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
  DuplicateToOtherDomain,
  Field,
  formatDate,
  Input,
  Modal,
  PageTitle,
  StatusHistory,
  useToast,
  type DetailCardField,
  type DetailCardValue,
  ConfirmDeleteModal,
} from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { useAddedValues } from "@/components/av-store";
import { useScenario, useScenarioSetup } from "@/components/scenario";
import { TODAY } from "@/data/gantt";
import { useShellState } from "@/components/shell-state";
import { useNotifications } from "@/components/notification-store";
import { CYCLE_OPTIONS, DOMAINS, VIEWER, stageLabel, type AddedValue, type AVDomain, type Duplicate } from "@/data/added-values";
import {
  availabilityClash,
  DOMAIN_NAMES,
  DOMAIN_TAG_SETS,
  EMPTY_DRAFT,
  GLOBAL_TAGS,
  SUBMIT_FLOW,
  SUBMIT_PEOPLE,
  tagOptions,
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
  /** A copy for another domain with no title (AV · 08), by domain value. */
  copies: Record<string, string>;
}

const EMPTY_FIELD = "You need to fill in this field before submitting the Added Value";
const PAIR = "Problem and solution should be filled together";
const blank = (s: string) => !s.trim();
const range = (from: string, to: string) => `${formatDate(from)}–${formatDate(to)}`;

function check(d: SubmitDraft, avDomain: AVDomain): Problems {
  const p: Problems = { problems: {}, solutions: {}, deliverables: {}, details: {}, toasts: [], warnings: [], copies: {} };
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
  const domainName = DOMAIN_NAMES[avDomain];
  const tags = d.details.tags ?? [];
  if (tags.length === 0) {
    p.details.tags = "Please select at least one tag before submitting";
    p.toasts.push("Please select at least one Tag before submitting");
  } else {
    const global = tags.some((t) => (GLOBAL_TAGS as readonly string[]).includes(t));
    const domain = tags.some((t) => DOMAIN_TAG_SETS[avDomain].includes(t));
    if (!global || !domain) {
      p.details.tags = `Add ${!global ? "one global tag" : ""}${!global && !domain ? " and " : ""}${!domain ? `at least one ${domainName} tag` : ""} before submitting`;
      p.toasts.push(`Tags need one global tag and at least one ${domainName} tag before submitting`);
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
  const p: Problems = { problems: {}, solutions: {}, deliverables: {}, details: {}, toasts: [], warnings: [], copies: {} };
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

/** The copy of the AV for another domain (AV · 08): its own description, prefilled from the AV's. */
type Copy = Pick<SubmitDraft, "title" | "problems" | "solutions" | "deliverables" | "desiredOutcome">;
const copyOf = (d: SubmitDraft): Copy => structuredClone({
  title: d.title,
  problems: d.problems,
  solutions: d.solutions,
  deliverables: d.deliverables,
  desiredOutcome: d.desiredOutcome,
});
const domainName = (value: string) => DOMAINS.find((d) => d.value === value)?.name ?? value;

/**
 * The Added Value form: Added Value Creation (Figma 2:11984; AV · 01 Submit,
 * AV · 03 Save as Draft) and, given `editing`, an AV's edit page at any status
 * (Figma 1026:166675 and 1043:239669; AV · 04 Edit an AV). The
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
  const { create, update, moveTo, remove } = useAddedValues();
  const setup = useScenarioSetup<SubmitDraft>([SUBMIT_FLOW.id, DRAFT_FLOW.id]);
  const [initial] = React.useState<SubmitDraft>(() => structuredClone(editing ? fromAV(editing) : (setup ?? EMPTY_DRAFT)));
  const [draft, setDraft] = React.useState<SubmitDraft>(() => structuredClone(initial));
  /* AV · 04, decided 9 Nov 2026: the back arrow asks before dropping unsaved edits. */
  const [askLeave, setAskLeave] = React.useState(false);
  /* AV · 02 Discard (Figma 1026:166776): the confirm before an AV is removed for good. */
  const [askDiscard, setAskDiscard] = React.useState(false);
  const { role } = useShellState();
  const { markDiscarded } = useNotifications();
  /* Figma: Discard is there while the AV is a Draft or Pending, and on a new one not yet saved.
     Decided 10 Nov 2026: only for whoever raised it and the domain's admins. */
  const canDiscard =
    !editing || ((editing.status === "Draft" || editing.status === "Pending") && (editing.initiator === VIEWER.name || role === "admin"));
  const discard = () => {
    setAskDiscard(false);
    if (editing) {
      remove(editing.id);
      /* Decided 10 Nov 2026: whoever was told of it keeps the row, which now says it was discarded and opens nothing. */
      markDiscarded(editing.id, editing.title, "You");
    }
    dismissAll();
    /* Figma: with an ID the toast names it; a new AV has none yet. */
    toast({
      tone: "success",
      title: "Deleted!",
      description: editing ? `Added Value “${editing.ref}” has been discarded successfully.` : "Added Value has been discarded successfully.",
    });
    /* Figma goes to My Values, which isn't built yet: the Dashboard, where Submit goes (AV · 01). */
    router.push("/");
  };
  /* Errors show from the first Submit (or Save as draft) on, and each clears as
     its field is fixed. Which one was pressed last decides which checks show. */
  const [attempted, setAttempted] = React.useState<"submit" | "draft">();
  const [links, setLinks] = React.useState<Link[]>(() =>
    (editing?.links ?? []).map((l) => ({ ...l, domain: (l.domain ?? "development") as Link["domain"] })),
  );
  /* A new AV is Development's for now (the prototype's viewer is a developer). */
  const avDomain: AVDomain = editing?.domain ?? "development";
  /* AV · 08: the domains ticked in "Duplicate to other Domains", and each one's copy. */
  const [initiate, setInitiate] = React.useState<string[]>([]);
  const [copies, setCopies] = React.useState<Record<string, Copy>>({});
  /* Each copy needs a title, on Submit and on Save as draft alike (both send it). */
  const withCopies = React.useCallback(
    (p: Problems, before: string) => {
      for (const d of initiate) {
        if (blank(copies[d]?.title ?? "")) {
          p.copies[d] = before === "submitting" ? EMPTY_FIELD : DRAFT_TITLE;
          p.toasts.push(`The copy in ${domainName(d)} domain needs a title before ${before}.`);
        }
      }
      return p;
    },
    [initiate, copies],
  );
  const problems = React.useMemo(() => withCopies(check(draft, avDomain), "submitting"), [draft, avDomain, withCopies]);
  const draftProblems = React.useMemo(() => withCopies(checkDraft(draft), "saving a draft"), [draft, withCopies]);
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
      domain: avDomain,
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

  /* AV · 08: Submit, or Save as draft (decided 9 Nov 2026), initiates a copy
     in each ticked domain, "Initiated" there. The original keeps its own status. */
  const initiated = (): Duplicate[] => [
    ...(editing?.duplicates ?? []),
    ...initiate.map((d) => ({ domain: domainName(d), status: "Initiated", title: copies[d].title.trim() })),
  ];
  const initiatedNote = initiate.length ? ` Initiated to ${initiate.map(domainName).join(" and ")}.` : "";

  const submit = () => {
    if (!press("submit")) return;
    if (!editing) return submitted(createAs("Pending"));
    if (editing.status === "Draft") {
      moveTo(editing.id, "Pending", { ...content(), duplicates: initiated() });
      return submitted(editing);
    }
    update(editing.id, { ...content(), duplicates: initiated() });
    backToAV(editing, `${editing.ref}: changes saved`, `It stays ${stageLabel(editing)}.${initiatedNote}`);
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
    /* Decided 9 Nov 2026: a Backlog AV comes back to Draft this way (Figma
       1090:27191, AV · 05); everywhere else Save as draft only saves the
       changes and the status stays. */
    if (editing.status === "Backlog") {
      moveTo(editing.id, "Draft", { ...content(), remarks: undefined, duplicates: initiated() });
      return backToAV(editing, `${editing.ref} moved back to Draft`, `It's out of the Backlog. Only you can see it until it's submitted.${initiatedNote}`);
    }
    update(editing.id, { ...content(), duplicates: initiated() });
    backToAV(
      editing,
      `${editing.ref}: changes saved`,
      (editing.status === "Draft" ? "It's still a Draft. Only you can see it until it's submitted." : `It stays ${stageLabel(editing)}.`) + initiatedNote,
    );
  };

  /** Edits not saved yet: what the back arrow asks about. */
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(initial) || links.length !== (editing?.links.length ?? 0) || initiate.length > 0;

  /* AV · 08: one copy's description, as editable as the AV's own. */
  const setCopy = (d: string, change: Partial<Copy>) => setCopies((c) => ({ ...c, [d]: { ...c[d], ...change } }));
  const copySection = (d: string, key: ListKey, type: "problem" | "solution" | "deliverable", noun: string) => (
    <DescriptionSection type={type} onAdd={() => setCopy(d, { [key]: [...copies[d][key], ""] })} addLabel={`Add ${noun} to the ${domainName(d)} copy`}>
      {copies[d][key].map((value, i) => (
        <DescriptionCard
          key={i}
          editing
          value={value}
          onChange={(v) => setCopy(d, { [key]: copies[d][key].map((x, j) => (j === i ? v : x)) })}
          onRemove={copies[d][key].length > 1 ? () => setCopy(d, { [key]: copies[d][key].filter((_, j) => j !== i) }) : undefined}
          removeLabel={`Remove ${noun} ${i + 1} from the ${domainName(d)} copy`}
        />
      ))}
    </DescriptionSection>
  );

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
    /* Where a guided scenario's step points: see src/flows/types.ts. */
    <div data-flow-step="back">
      <PageTitle
        title={`Edit ${editing.ref}`}
        onBack={() => (dirty ? setAskLeave(true) : router.push(`/added-values/${editing.id}`))}
        backLabel={`Back to ${editing.ref}`}
      />
    </div>
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
          {/* AV · 08 Initiate to another domain (Figma 1141:138917): tick a domain,
              its copy appears; Submit initiates it there. */}
          {editing && (
            <div data-flow-step="duplicate">
              <DuplicateToOtherDomain
                options={DOMAINS.filter((d) => d.value !== avDomain).map((d) => ({
                  value: d.value,
                  name: d.name,
                  /* Already initiated there: it can't go twice. */
                  disabled: editing.duplicates?.some((x) => x.domain === d.name),
                }))}
                value={initiate}
                onChange={(value, change) => {
                  setInitiate(value);
                  if (change.checked && !copies[change.value]) setCopies((c) => ({ ...c, [change.value]: copyOf(draft) }));
                }}
              />
            </div>
          )}
          {initiate.map((d) => (
            <section
              key={d}
              data-flow-step={`copy-${d}`}
              aria-labelledby={`copy-${d}-heading`}
              className="overflow-hidden rounded-md border border-stroke-default"
            >
              <h2 id={`copy-${d}-heading`} className="bg-surface-neutral-subtle px-4 py-2 text-center text-body-md-semibold text-text-primary">
                The copy in {domainName(d)} domain
              </h2>
              <div className="flex flex-col gap-4 p-4">
                <section className="rounded-md bg-surface-elevated p-6">
                  <Field label="Title" error={shown?.copies[d]}>
                    <Input fullWidth value={copies[d].title} onChange={(e) => setCopy(d, { title: e.target.value })} />
                  </Field>
                </section>
                {copySection(d, "problems", "problem", "problem")}
                {copySection(d, "solutions", "solution", "solution")}
                {copySection(d, "deliverables", "deliverable", "acceptance criterion")}
                <DescriptionSection type="desired-outcome">
                  <DescriptionCard editing value={copies[d].desiredOutcome} onChange={(v) => setCopy(d, { desiredOutcome: v })} />
                </DescriptionSection>
              </div>
            </section>
          ))}
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
                tags: tagOptions(avDomain),
              }}
              errors={shown?.details}
              /* AV · 10 (DS #333): a part takes these from its parent, so they're
                 locked on its edit page, as Figma 1404:132644 greys them. */
              readOnly={editing?.parent ? ["projects", "category", "type", "urgency"] : undefined}
            />
          </div>
          <DeliverablesCard
            domain={avDomain}
            mode="edit"
            links={links}
            onAddLinks={(_section, added) =>
              setLinks((list) => {
                /* A free id each: one counted from the list's length can repeat one after a removal, and removing
                   either link would then remove both. */
                const taken = new Set(list.map((l) => l.id));
                let n = list.length;
                const fresh = added.map((l) => {
                  do n += 1;
                  while (taken.has(`link-${n}`));
                  taken.add(`link-${n}`);
                  return { ...l, id: `link-${n}`, domain: avDomain };
                });
                return [...list, ...fresh];
              })
            }
            onEditLink={(_section, id, edited) =>
              setLinks((list) => list.map((l) => (l.id === id ? { ...l, title: edited.title, url: edited.url } : l)))
            }
            onRemoveLink={(_section, id) => setLinks((list) => list.filter((l) => l.id !== id))}
          />
          <div data-flow-step="actions" className="flex justify-end gap-3">
            {/* AV · 02: Discard, in red text (DS danger-tertiary, #365), while the AV is a Draft or Pending. */}
            {canDiscard && (
              <Button variant="danger-tertiary" onClick={() => setAskDiscard(true)}>
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
      {/* Figma: "the same modal used to delete AVs in the AV table" (1026:169657), with the discard's words. */}
      <ConfirmDeleteModal
        open={askDiscard}
        onClose={() => setAskDiscard(false)}
        onConfirm={discard}
        title="Are you sure you want to discard this Added Value?"
        description="This action cannot be undone. The item will be permanently removed."
        confirmLabel="Confirm"
        itemLabel="Added Value"
        itemName={editing ? `${editing.ref}: ${editing.title}` : draft.title || "Untitled Added Value"}
      />
      {editing && (
        <Modal
          open={askLeave}
          onClose={() => setAskLeave(false)}
          title="Leave without saving?"
          tone="critical"
          size="sm"
          actions={{
            cancelLabel: "Keep editing",
            confirm: { label: "Leave", onClick: () => router.push(`/added-values/${editing.id}`) },
          }}
        >
          <p className="text-body-md-regular text-text-secondary">
            Your changes to {editing.ref} aren&apos;t saved. If you leave now, they&apos;re lost.
          </p>
        </Modal>
      )}
    </Screen>
  );
}
