import { EmptyState, Icon, PageTitle } from "@vdm-design-team/vcp-design-system";
import { Screen } from "@/components/screen";

/* Every rail row without a screen yet, for all three roles, so no click in the
   prototype goes nowhere. The key is the rail's — a sub-row's has a slash
   (`archive/completed`). When one is designed, give it its own folder
   (src/app/<key>/) and take it off this list. */
const NOT_DESIGNED_YET: Record<string, string> = {
  "my-values": "My Values",
  "task-log": "Task Log Trail",
  "planning/planning-list": "Planning List",
  "planning/holiday-registry": "Holiday Registry",
  accounts: "Accounts",
  domains: "Domains",
  "contact-list": "Contact List",
};

/* The static export builds exactly these; any other path is a 404. */
export function generateStaticParams() {
  return Object.keys(NOT_DESIGNED_YET).map((key) => ({ screen: key.split("/") }));
}

export default async function NotDesignedYet({ params }: PageProps<"/[...screen]">) {
  const key = (await params).screen.join("/");
  const title = NOT_DESIGNED_YET[key];
  return (
    <Screen active={key} header={<PageTitle title={title} />}>
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title="Not designed yet"
          description={`${title} is still to come. It goes in src/app/${key}/page.tsx.`}
        />
      </div>
    </Screen>
  );
}
