import { SCENARIOS } from "@/flows/catalogue";
import { ScenarioStart } from "./scenario-start";

/* One static page per runnable scenario: its shareable link. */
export function generateStaticParams() {
  return SCENARIOS.map(({ flow, scenario }) => ({ flow: flow.id, scenario: scenario.id.slice(flow.id.length + 1) }));
}

export default async function ScenarioStartPage({ params }: PageProps<"/flows/[flow]/[scenario]">) {
  const { flow, scenario } = await params;
  return <ScenarioStart flowId={flow} scenarioKey={scenario} />;
}
