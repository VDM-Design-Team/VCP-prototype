"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@vdm-design-team/vcp-design-system";
import { useScenario } from "@/components/scenario";
import { FLOWS } from "@/flows/catalogue";
import type { FlowDef, ScenarioDef } from "@/flows/types";

/**
 * The Flows & Scenarios list: the prototype's second way in (the first is
 * Explore, the Dashboard). Every runnable scenario as a card, under its flow;
 * the flows with none yet are listed as planned. A scenario's card and its
 * start read the same definition.
 */
export function Catalogue() {
  const router = useRouter();
  const { clear } = useScenario();
  const built = FLOWS.filter((f) => f.scenarios.length > 0);
  const planned = FLOWS.filter((f) => f.scenarios.length === 0);
  /* Back from a scenario (Finish, Leave scenario) the address names its card: show it, and put focus on its Start,
     so the list doesn't open at the top again. */
  React.useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const card = id ? document.getElementById(id) : null;
    if (!card) return;
    card.scrollIntoView({ block: "center" });
    card.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }, []);
  return (
    <main className="min-h-screen bg-surface-canvas px-6 pb-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        {/* Stays at the top while the list scrolls, so the way out is always in reach. */}
        <header className="sticky top-0 z-10 flex flex-col gap-2 border-b border-stroke-default bg-surface-canvas pb-4 pt-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-heading-lg-semibold text-text-primary">Flows &amp; Scenarios</h1>
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
          </div>
          <p className="text-body-md-regular text-text-secondary">
            Pick a scenario to be walked through it step by step, or explore the prototype freely.
          </p>
        </header>
        {built.map((flow) => (
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
    </main>
  );
}

function FlowGroup({ flow }: { flow: FlowDef }) {
  const headingId = `flow-${flow.id}`;
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 id={headingId} className="text-title-md-semibold text-text-primary">
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
      className="flex scroll-mt-48 flex-col gap-2 rounded-md border border-stroke-default bg-surface-elevated p-4"
    >
      <h3 id={headingId} className="text-body-md-semibold text-text-primary">
        {scenario.name}
      </h3>
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
