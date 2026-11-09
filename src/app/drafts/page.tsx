import { EmptyState, Icon, PageTitle } from "@vdm-design-team/vcp-design-system";
import { CreateAVButton } from "@/components/create-av-button";
import { Screen } from "@/components/screen";

/* Drafts with nothing in it yet. */
export default function DraftsScreen() {
  return (
    <Screen active="drafts" header={<PageTitle title="Drafts" />}>
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title="No drafts"
          description="An Added Value you start and don't submit waits here."
          action={<CreateAVButton />}
        />
      </div>
    </Screen>
  );
}
