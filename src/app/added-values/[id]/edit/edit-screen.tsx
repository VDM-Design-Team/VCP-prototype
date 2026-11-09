"use client";

import { EmptyState, Icon, PageTitle } from "@vdm-design-team/vcp-design-system";
import { AVForm } from "@/components/av-form";
import { useAddedValues } from "@/components/av-store";
import { Screen } from "@/components/screen";

/**
 * Editing an Added Value (AV · 04): the creation form, filled in from the AV.
 * Figma draws it for a Draft (1026:166675) and a Pending AV (1043:239669); the
 * same page serves every status (decided 9 Nov 2026).
 */
export function EditScreen({ id }: { id: string }) {
  const { get } = useAddedValues();
  const av = get(id);
  if (av) return <AVForm editing={av} />;
  return (
    <Screen active="" header={<PageTitle title="Added Value not found" />}>
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title="This Added Value isn't here"
          description="It may have been deleted. Reload the prototype to start from the sample data again."
        />
      </div>
    </Screen>
  );
}
