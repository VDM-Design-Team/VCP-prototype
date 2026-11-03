import { PageTitle, StatCard } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";
import { Panel } from "@/components/panel";

/* A user's dashboard: the Value Cards, then recent activity. Sample data. */
export default function DashboardScreen() {
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
        <StatCard className="flex-1" label="Pending" value="4" accent="warning" />
        <StatCard className="flex-1" label="Draft" value="5" accent="neutral" />
      </div>
      <Panel title="Recent activity">Nothing yet this cycle.</Panel>
    </Screen>
  );
}
