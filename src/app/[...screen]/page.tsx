import { EmptyState, Icon, PageTitle } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";

/* Every rail row without a screen yet, so no click in the prototype goes
   nowhere. When one is designed, give it its own folder (src/app/<key>/) and
   take it off this list. */
const NOT_DESIGNED_YET: Record<string, string> = {
  "my-values": "My Values",
  assigned: "Assigned",
  "task-log": "Task Log Trail",
};

/* The static export builds exactly these; any other path is a 404. */
export function generateStaticParams() {
  return Object.keys(NOT_DESIGNED_YET).map((screen) => ({ screen }));
}

export default async function NotDesignedYet({ params }: PageProps<"/[screen]">) {
  const { screen } = await params;
  const title = NOT_DESIGNED_YET[screen];
  return (
    <Screen active={screen} header={<PageTitle title={title} />}>
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title="Not designed yet"
          description={`${title} is still to come. It goes in src/app/${screen}/page.tsx.`}
        />
      </div>
    </Screen>
  );
}
