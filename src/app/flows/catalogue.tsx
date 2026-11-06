"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge, Button } from "@vdm-design-team/vcp-design-system";
import { useScenario } from "@/components/scenario";
import { AREAS, FLOWS } from "@/flows/catalogue";
import type { FlowDef, ImplementationStatus, ScenarioDef } from "@/flows/types";

const STATUS_TONE: Record<ImplementationStatus, "neutral" | "info" | "success"> = {
  Planned: "neutral",
  "In progress": "info",
  Implemented: "success",
};

/**
 * The Flows & Scenarios catalogue: the prototype's second way in (the first is
 * Explore, the Dashboard). Every flow from the FigJam Index, each with its
 * scenarios. A scenario's card and its start read the same definition.
 */
export function Catalogue() {
  const { clear } = useScenario();
  return (
    <main className="min-h-screen bg-surface-canvas px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="flex flex-col gap-3">
          <h1 className="text-heading-lg-semibold text-text-primary">Flows &amp; Scenarios</h1>
          <p className="max-w-2xl text-body-md-regular text-text-secondary">
            A flow is a task; a scenario is one set of conditions inside it. Start a scenario and its data and
            role are set for you, then you drive. Reset puts it back; nothing carries over from the last one.
          </p>
          <p className="text-body-sm-regular text-text-secondary">
            Or{" "}
            <Link href="/" onClick={clear} className="text-text-link-default underline">
              explore the prototype
            </Link>{" "}
            freely, with the sample data.
          </p>
        </header>
        {AREAS.map((area) => (
          <section key={area} aria-labelledby={`area-${area}`} className="flex flex-col gap-4">
            <h2 id={`area-${area}`} className="text-title-md-semibold text-text-primary">
              {area}
            </h2>
            <ul className="flex flex-col gap-3">
              {FLOWS.filter((f) => f.area === area).map((flow) => (
                <FlowCard key={flow.id} flow={flow} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

function FlowCard({ flow }: { flow: FlowDef }) {
  const headingId = React.useId();
  return (
    <li aria-labelledby={headingId} className="rounded-md border border-stroke-default bg-surface-elevated p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 id={headingId} className="text-title-sm-semibold text-text-primary">
          {flow.area} · {flow.number} {flow.name}
        </h3>
        <Badge size="sm" tone={STATUS_TONE[flow.status]}>
          {flow.status}
        </Badge>
        <span className="text-body-sm-regular text-text-secondary">{flow.actor}</span>
        {flow.figjam && (
          <a href={flow.figjam} target="_blank" rel="noreferrer" className="ml-auto text-body-sm-medium text-text-link-default underline">
            FigJam flow<span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
      {flow.goal && <p className="mt-1 text-body-sm-regular text-text-secondary">{flow.goal}</p>}
      {flow.scenarios.length > 0 ? (
        <ol className="mt-4 flex flex-col gap-3">
          {flow.scenarios.map((s) => (
            <ScenarioCard key={s.id} flow={flow} scenario={s} />
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-body-sm-regular text-text-tertiary">No scenarios yet: not available to start.</p>
      )}
    </li>
  );
}

function ScenarioCard({ flow, scenario }: { flow: FlowDef; scenario: ScenarioDef }) {
  const router = useRouter();
  const key = scenario.id.slice(flow.id.length + 1);
  const href = `/flows/${flow.id}/${key}`;
  const runnable = scenario.status === "Implemented";
  return (
    <li className="flex flex-col gap-2 rounded-sm border border-stroke-subtle p-3">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-body-md-semibold text-text-primary">{scenario.name}</h4>
        <Badge size="sm" tone={STATUS_TONE[scenario.status]}>
          {scenario.status}
        </Badge>
        <Badge size="sm" variant="outline">
          {scenario.testing}
        </Badge>
      </div>
      <p className="text-body-sm-regular text-text-secondary">{scenario.demonstrates}</p>
      <dl className="flex flex-col gap-1 text-body-sm-regular text-text-secondary">
        <dt className="text-label-sm-medium text-text-primary">Starts on</dt>
        <dd>{scenario.start === "/added-values/new" ? "Added Value Creation" : scenario.start}</dd>
        <dt className="text-label-sm-medium text-text-primary">Starting conditions</dt>
        <dd>{scenario.conditions}</dd>
        <dt className="text-label-sm-medium text-text-primary">Simulated</dt>
        <dd>{scenario.simulated}</dd>
        <dt className="text-label-sm-medium text-text-primary">Expected</dt>
        <dd>{scenario.expected}</dd>
      </dl>
      {runnable && (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => router.push(href)}>
            Start scenario<span className="sr-only">: {scenario.name}</span>
          </Button>
          <Button size="sm" variant="tertiary" onClick={() => router.push(`${href}?view=participant`)}>
            Start as participant<span className="sr-only">: {scenario.name}</span>
          </Button>
        </div>
      )}
    </li>
  );
}
