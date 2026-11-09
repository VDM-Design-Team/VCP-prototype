"use client";

import { EmptyState, Icon, PageTitle } from "@vdm-design-team/vcp-design-system";
import { AVForm } from "@/components/av-form";
import { useAddedValues } from "@/components/av-store";
import { Screen } from "@/components/screen";
import { EDITABLE } from "@/flows/av-04-edit";

/**
 * Editing an Added Value (AV · 04): the creation form, filled in from the AV.
 * Figma draws it for a Draft (1026:166675) and a Pending AV (1043:239669) only.
 */
export function EditScreen({ id }: { id: string }) {
  const { get } = useAddedValues();
  const av = get(id);
  if (av && EDITABLE.includes(av.status)) return <AVForm editing={av} />;
  return (
    <Screen active="" header={<PageTitle title={av ? `Edit ${av.ref}` : "Added Value not found"} />}>
      <div className="flex flex-1 items-center justify-center py-16">
        <EmptyState
          headingLevel={2}
          icon={<Icon name="file" size="lg" />}
          title={av ? `${av.ref} can't be edited here` : "This Added Value isn't here"}
          description={
            av
              ? "Only a Draft or Pending Added Value opens on the edit page. Editing one past Pending isn't designed yet."
              : "It may have been deleted. Reload the prototype to start from the sample data again."
          }
        />
      </div>
    </Screen>
  );
}
