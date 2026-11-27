"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Chip, Field, IconButton, Select, Tag, type TagProps } from "@vdm-design-team/vcp-design-system";
import { useScenario } from "@/components/scenario";
import { ROLES, type Role } from "@/components/roles";
import { rolesOf, startPageOf } from "@/flows/scenario-tags";
import { FLOWS } from "@/flows/catalogue";
import type { FlowDef, ScenarioDef } from "@/flows/types";

/**
 * The Flows & Scenarios list: the prototype's second way in (the first is
 * Explore, the Dashboard). Every runnable scenario as a card, under its flow;
 * the flows with none yet are listed as planned. A scenario's card and its
 * start read the same definition.
 */
const built = FLOWS.filter((f) => f.scenarios.length > 0);
const planned = FLOWS.filter((f) => f.scenarios.length === 0);
/* Every page a scenario starts on, for the "Starts on" filter. */
const START_PAGES = [...new Set(built.flatMap((f) => f.scenarios.map(startPageOf)))].sort();
/* A role's tag: one tone each, so a card's people read at a glance. */
const ROLE_TONE: Record<Role, TagProps["tone"]> = { user: "neutral", admin: "info", "super-admin": "brand" };
const roleLabel = (role: Role) => ROLES.find((r) => r.value === role)!.label;

export function Catalogue() {
  const router = useRouter();
  const { clear } = useScenario();
  /* Filters: any of the picked roles (a scenario can be seen as several), and the page it starts on. */
  const [roles, setRoles] = React.useState<ReadonlySet<Role>>(new Set());
  const [page, setPage] = React.useState("");
  const filtering = roles.size > 0 || page !== "";
  const shown = React.useMemo(
    () =>
      built
        .map((f) => ({
          ...f,
          scenarios: f.scenarios.filter(
            (s) => (roles.size === 0 || rolesOf(s).some((r) => roles.has(r))) && (!page || startPageOf(s) === page),
          ),
        }))
        .filter((f) => f.scenarios.length > 0),
    [roles, page],
  );
  const areas = [...new Set(shown.map((f) => f.area))];
  const count = shown.reduce((n, f) => n + f.scenarios.length, 0);
  const toggleRole = (role: Role) =>
    setRoles((was) => {
      const next = new Set(was);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  /* Back from a scenario (Finish, Leave scenario) the address names its card: show it, and put focus on its Start,
     so the list doesn't open at the top again. */
  React.useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const card = id ? document.getElementById(id) : null;
    if (!card) return;
    card.scrollIntoView({ block: "center" });
    card.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }, []);
  /* The contents mark the flow being read: the last one whose heading has scrolled past the top third. */
  const [current, setCurrent] = React.useState(shown[0]?.id);
  /* Each area of the contents opens and closes. Until you open or close one yourself, the one being read is open
     and the others closed, so the contents follow you down the page. */
  const [chosen, setChosen] = React.useState<Readonly<Record<string, boolean>>>({});
  const currentArea = shown.find((f) => f.id === current)?.area;
  const isOpenArea = (area: string) => chosen[area] ?? area === currentArea;
  const toggle = (area: string, to?: boolean) => setChosen((was) => ({ ...was, [area]: to ?? !isOpenArea(area) }));
  React.useEffect(() => {
    const onScroll = () => {
      const line = window.innerHeight / 3;
      let at = shown[0]?.id;
      for (const f of shown) {
        const el = document.getElementById(`flow-${f.id}`);
        if (el && el.getBoundingClientRect().top <= line) at = f.id;
      }
      setCurrent(at);
    };
    onScroll();
    /* The page scrolls in the app's own container, not the window: listen for any scroll, in the capture phase. */
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", onScroll, { capture: true });
  }, [shown]);
  return (
    <main className="min-h-screen bg-surface-canvas px-6 py-10">
      {/* Not centred: the contents sit at the window's left edge, with the list beside them. */}
      <div className="flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
        {/* Contents: every flow by area, a jump to each, and the way out. Sticky beside the list on a wide window;
            above it on a narrow one. */}
        <nav aria-label="Flows" className="flex shrink-0 flex-col gap-4 lg:sticky lg:top-10 lg:max-h-screen lg:w-64 lg:overflow-y-auto lg:pb-10">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              clear();
              router.push("/");
            }}
          >
            Explore the prototype
          </Button>
          {areas.map((area) => {
            const flows = shown.filter((f) => f.area === area);
            const isOpen = isOpenArea(area);
            const listId = `contents-${area}`;
            return (
              <div key={area} className="flex flex-col gap-1">
                {/* The area's name jumps to its first flow (and opens it here); the caret only opens and closes it.
                    Two controls, because one that both links and toggles would be neither (DS sidebar-item: a
                    disclosure is not a link). */}
                <div className="flex items-center gap-1">
                  <a
                    href={`#flow-${flows[0].id}`}
                    onClick={() => toggle(area, true)}
                    className="flex-1 rounded-sm px-2 py-1 text-label-sm-semibold text-text-secondary hover:bg-surface-neutral-subtle"
                  >
                    {area} <span className="text-text-tertiary">· {flows.length}</span>
                  </a>
                  <IconButton
                    size="xs"
                    variant="tonal"
                    icon={isOpen ? "caret-up" : "caret-down"}
                    label={isOpen ? `Hide ${area} flows` : `Show ${area} flows`}
                    aria-expanded={isOpen}
                    aria-controls={listId}
                    onClick={() => toggle(area)}
                  />
                </div>
                {isOpen && (
              <ul id={listId} className="flex flex-col">
                {flows.map((f) => (
                    <li key={f.id}>
                      <a
                        href={`#flow-${f.id}`}
                        aria-current={current === f.id ? "location" : undefined}
                        className={`flex justify-between gap-2 rounded-sm px-2 py-1 text-body-sm-regular hover:bg-surface-neutral-subtle ${
                          current === f.id ? "bg-surface-neutral-subtle text-text-primary" : "text-text-secondary"
                        }`}
                      >
                        <span>
                          {f.number} {f.name}
                        </span>
                        <span className="text-text-tertiary">{f.scenarios.length}</span>
                      </a>
                    </li>
                  ))}
              </ul>
                )}
              </div>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-heading-lg-semibold text-text-primary">Flows &amp; Scenarios</h1>
          <p className="text-body-md-regular text-text-secondary">
            Pick a scenario to be walked through it step by step, or explore the prototype freely.
          </p>
        </header>
        <section aria-label="Filter the scenarios" className="flex flex-wrap items-end gap-4">
          <div role="group" aria-labelledby="filter-roles" className="flex flex-col gap-2">
            <span id="filter-roles" className="text-label-sm-medium text-text-secondary">
              Roles
            </span>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((r) => (
                <Chip key={r.value} label={r.label} selected={roles.has(r.value)} onClick={() => toggleRole(r.value)} />
              ))}
            </div>
          </div>
          <Field label="Starts on">
            <Select
              size="sm"
              edge="neutral"
              value={page}
              onChange={setPage}
              options={[{ value: "", label: "Any page" }, ...START_PAGES.map((p) => ({ value: p, label: p }))]}
            />
          </Field>
          {filtering && (
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => {
                setRoles(new Set());
                setPage("");
              }}
            >
              Clear filters
            </Button>
          )}
          <p aria-live="polite" className="text-body-sm-regular text-text-secondary">
            {count} {count === 1 ? "scenario" : "scenarios"}
          </p>
        </section>
        {shown.map((flow) => (
          <FlowGroup key={flow.id} flow={flow} />
        ))}
        {planned.length > 0 && (
          <section aria-labelledby="planned" className="flex flex-col gap-2">
            <h2 id="planned" className="text-title-sm-semibold text-text-secondary">
              Planned flows
            </h2>
            <p className="text-body-sm-regular text-text-tertiary">
              {planned.map((f) => `${f.area} · ${f.number} ${f.name}`).join("  ·  ")}
            </p>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}

function FlowGroup({ flow }: { flow: FlowDef }) {
  const headingId = `flow-${flow.id}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id={headingId} className="scroll-mt-10 text-title-md-semibold text-text-primary">
          {flow.area} · {flow.number} {flow.name}
        </h2>
        {flow.figjam && (
          <a href={flow.figjam} target="_blank" rel="noreferrer" className="text-body-sm-medium text-text-link-default underline">
            FigJam flow<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flow.scenarios.map((s) => (
          <ScenarioCard key={s.id} flow={flow} scenario={s} />
        ))}
      </ul>
    </section>
  );
}

function ScenarioCard({ flow, scenario }: { flow: FlowDef; scenario: ScenarioDef }) {
  const router = useRouter();
  const headingId = React.useId();
  const href = `/flows/${flow.id}/${scenario.id.slice(flow.id.length + 1)}`;
  return (
    <li
      /* Leaving the scenario comes back to this card (`/flows#<id>`). */
      id={scenario.id}
      aria-labelledby={headingId}
      className="flex flex-col gap-2 rounded-md border border-stroke-default bg-surface-elevated p-4"
    >
      <h3 id={headingId} className="text-body-md-semibold text-text-primary">
        {scenario.name}
      </h3>
      {/* Who it's seen as (each role it switches to too), and where it starts. */}
      <ul aria-label="Roles and start page" className="flex flex-wrap gap-1">
        {rolesOf(scenario).map((role) => (
          <li key={role}>
            <Tag size="xs" tone={ROLE_TONE[role]}>{roleLabel(role)}</Tag>
          </li>
        ))}
        <li>
          <Tag size="xs" variant="outline">{startPageOf(scenario)}</Tag>
        </li>
      </ul>
      <p className="flex-1 text-body-sm-regular text-text-secondary">{scenario.demonstrates}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => router.push(href)}>
          Start<span className="sr-only"> {scenario.name}</span>
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => router.push(`${href}?view=participant`)}>
          As participant<span className="sr-only">: {scenario.name}</span>
        </Button>
      </div>
    </li>
  );
}
